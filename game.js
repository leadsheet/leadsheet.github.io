if(localStorage.getItem("currentLevel")===null){
  localStorage.setItem("currentLevel","0");
}
const SHAPES = [
  // I
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  // J
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // L
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // O
  [
    [1, 1],
    [1, 1],
  ],
  // S
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  // T
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  // Z
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
];

const SHAPE_COLORS = [
  '#00BCD4',
  '#485FE5',
  '#FF9800',
  '#FFEB3B',
  '#4CAF50',
  '#A629BC',
  '#F44336',
];

const BLOCK_SIZE = 40;
const GRID_COLS = 10;
const GRID_ROWS = 18
const BLOCK_EMPTY = -1;
const MAX_DT = 100;

const GRAVITY_SPEED = 1;
const GRAVITY_ACCELERATION = 0.00001;
const GRAVITY_THRESHOLD = 1000; 

const GRID_WIDTH = GRID_COLS * BLOCK_SIZE;
const GRID_HEIGHT = GRID_ROWS * BLOCK_SIZE;

const TOUCH_THRESHOLDX = 25;
const TOUCH_THRESHOLDY = 25;
const TOUCH_THRESHOLDDROP = 30;
const TIP_THRESHOLD = 150;

const BREAKAFTERDROP = 700;

const KEY_TO_INPUT_TYPE = {
  ArrowLeft: 'moveLeft',
  ArrowRight: 'moveRight',
  ArrowDown: 'moveDown',
  ArrowUp: 'rotate',
  ' ': 'hardDrop',
  r: 'restart',
};

let touchData = {
  firstTouch:{
    x:null,
    y:null
  },
  position:{
    x:null,
    y:null,
  },
  time:{
    timeStampTouchStart:null,
    timeStampTouchEnd: null
  },
  changedTime: null
}

function setTouchData(touchData,fx=touchData.firstTouch.x,fy=touchData.firstTouch.y,
  px=touchData.position.x,py=touchData.position.y,
  tStart=touchData.time.timeStampTouchStart,tEnd=touchData.time.timeStampTouchEnd) {
  touchData.firstTouch.x = fx;
  touchData.firstTouch.y = fy;
  touchData.position.x = px;
  touchData.position.y = py;
  touchData.time.timeStampTouchStart = tStart;
  touchData.time.timeStampTouchEnd = tEnd;
}

function getRandomIndex(n) {
  return Math.floor(Math.random() * n);
}

function getRandomShapeId() {
  return getRandomIndex(SHAPES.length);
}

function makeEmptyGrid() {
  return Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill(BLOCK_EMPTY)
  );
}

function createCurrentPiece(shapeId) {
  const shape = SHAPES[shapeId];

  return {
    shapeId,
    shape,
    position: {
      x: getRandomIndex(GRID_COLS - shape[0].length + 1),
      y: 0,
    },
  };
}

function getInitialState(levelData) {

  return {
    isGameOver: false,
    score: 0,
    startTime: performance.now(),
    gravity: {
      progress: 0,
      speed: GRAVITY_SPEED,
    },
    currentPieceIndex: 0,
    currentPiece: createCurrentPiece(levelData[0]),
    levelData: levelData,
    grid: makeEmptyGrid(),
  };
}


function drawBlock(ctx, color, x, y,blockSize) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, blockSize - 1, blockSize - 1);
}

function drawShape(ctx, shape, colorId, x, y,blockSize){
  const color = SHAPE_COLORS[colorId];
  for(let i = 0; i < shape.length; i++){
    for(let j = 0; j < shape[0].length; j++){
      if(shape[i][j]){
        drawBlock(ctx,color,x+j*blockSize,y+i*blockSize,blockSize);
      }
    }
  }
}


function render(ctx,state){
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);

  const { grid, currentPiece, nextShapeId } = state;
  const blockSize = ctx.canvas.height/GRID_ROWS;
  const offsetX = (ctx.canvas.width - 10*blockSize)/2;

  //Draw Background
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const shapeId = grid[i][j];
      color = "rgb(200 200 200 / 80%)";;
      if(shapeId != BLOCK_EMPTY){
        color = SHAPE_COLORS[shapeId];
      }
      drawBlock(ctx, color, offsetX+j * blockSize, i * blockSize,blockSize);
    }
  }
  //Fill Rest
  ctx.fillStyle = "rgb(235, 235, 235)";
  ctx.fillRect(0,0,offsetX,ctx.canvas.height);
  ctx.fillRect(offsetX+blockSize*10,0,offsetX,ctx.canvas.height);


  //Shape
  drawShape(ctx,currentPiece.shape, currentPiece.shapeId, currentPiece.position.x*blockSize+offsetX,currentPiece.position.y*blockSize,blockSize);
 //Game Overlay
  if(state.isGameOver){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "100px playFont";
    ctx.fillText('Game Over!', ctx.canvas.width/2, ctx.canvas.height/2);
  }
}

function touchHandler(e,canvas,state,inputs){
  e.preventDefault();
  if(e.type == 'touchstart' || e.type == 'touchmove'){


    playerX = e.touches[0].pageX - canvas.offsetLeft;
    playerY = e.touches[0].pageY - canvas.offsetTop;
    logAction(playerX,playerY,e.type);
    console.log(initLogsystem.logCollection.length);

    if(e.type == 'touchstart'){
      setTouchData(touchData,playerX,playerY,playerX,playerY,performance.now(),null);
      console.log("Data:"+touchData.firstTouch.x,touchData.position.x);
    }
    else if(e.type == 'touchmove'){
      touchData.position.x = playerX;
      touchData.position.y = playerY;
      touchData.changedTime = performance.now();
    }    
  }
  else if (e.type == 'touchend'){
    touchData.time.timeStampTouchEnd = performance.now();
    touchData.changedTime = performance.now();
    saveLogs();
    
  }
  else if(e.type == 'touchcancel'){
    console.log("Touchcancel");
    alert("Cancel");
  }
}

function startCollectingInputs(canvas,state,inputs){
    canvas.addEventListener("touchstart", function(event){
        touchHandler(event,canvas,state,inputs);
    });
    canvas.addEventListener("touchmove",  function(event){
        touchHandler(event,canvas,state,inputs);
    });
    canvas.addEventListener("touchend", function(event){
      touchHandler(event,canvas,state,inputs);
    })
}

function initCanvas(){
  const canvas = document.getElementById("game");
  const cwidth = canvas.clientWidth;
  const cheight = canvas.clientHeight;
  canvas.width = cwidth*window.devicePixelRatio;
  canvas.height = cheight*window.devicePixelRatio;
  const ctx = canvas.getContext("2d");
  return ctx;
}

function canGridFitShape(grid,shape,shapeX,shapeY){
  return shape.every((row,i) => {
    const gridY = shapeY+i;

    return row.every((isSolid,j) => {
      if(!isSolid){
        return true;
      }
      //Below the floor - collision
      if(gridY >= grid.length){
        return false;
      }

      //Outside the walls - collision
      const gridX = shapeX + j;
      if(gridX < 0 || gridX >= grid[0].length){
        return false;
      }

      //Finally, check if the place is free
      return grid[gridY][gridX] === BLOCK_EMPTY;
    })
  })
}

function moveCurrentPiece(grid,currentPiece, moveX,moveY){
  const {shape, position} = currentPiece;
  const {x, y} = position;

  const canMove = canGridFitShape(grid,shape,x+moveX,y+moveY);

  if(canMove){
    currentPiece.position.x += moveX;
    currentPiece.position.y += moveY;
  }
  return canMove;
}

function rotate(shape){
  return Array.from({length: shape[0].length},(_,i)=>
    Array.from(
      {length: shape.length},
      (_,j) => shape[shape.length - 1 - j][i]
    )
  );
}

function rotateCurrentPiece(grid,currentPiece){
  const {shape, position} = currentPiece;

  const newShape = rotate(shape);
  if(canGridFitShape(grid,newShape,position.x,position.y)){
    currentPiece.shape = newShape;
  }
}

function updateCurrentPiece(state,inputs,dt,ctx){
  if(updateCurrentPiece.touchDataChangeTime == 'undefined'){
    updateCurrentPiece.touchDataChangeTime = 0;
    updateCurrentPiece.pieceDropDown = 0;
  }

  if(touchData.changedTime != updateCurrentPiece.touchDataChangeTime){
    updateCurrentPiece.touchDataChangeTime = touchData.changedTime;
    const {grid, currentPiece} = state;
    const screenOffsetX = (touchData.position.x - touchData.firstTouch.x);
    const screenOffsetY = (touchData.position.y - touchData.firstTouch.y);
    const tipDuration = (touchData.time.timeStampTouchEnd - touchData.time.timeStampTouchStart);

    if(tipDuration < TIP_THRESHOLD && touchData.time.timeStampTouchEnd != null && touchData.firstTouch.x == touchData.position.x) {
      rotateCurrentPiece(state.grid,state.currentPiece);
      console.log(touchData.firstTouch.x,touchData.position.x);
      console.log("TIP");
    }
    else if(screenOffsetX > TOUCH_THRESHOLDX){ // Rechts
      moveCurrentPiece(state.grid,state.currentPiece,1,0);
      touchData.firstTouch.x = touchData.position.x;
      console.log("Rechts");
    }
    else if(screenOffsetX < -TOUCH_THRESHOLDX){ // Links
      moveCurrentPiece(state.grid,state.currentPiece,-1,0);
      touchData.firstTouch.x = touchData.position.x;
      console.log("Links");
    }
    else if (screenOffsetY > TOUCH_THRESHOLDY ){ // Unten 
      moveCurrentPieceDown(state);
      updateCurrentPiece.pieceDropDown = updateCurrentPiece.pieceDropDown + TOUCH_THRESHOLDY;
      touchData.firstTouch.y = touchData.position.y;
    }

  } 
  else{
    if(touchData.time.timeStampTouchEnd != null){
    updateCurrentPiece.pieceDropDown = 0;
    }
  }
}

function attachToGrid(grid, currentPiece){
  const {shapeId, shape, position } = currentPiece;

  for(let i = 0; i < shape.length;i++){
    for(let j = 0; j < shape[0].length; j++){
      if(shape[i][j]){
        grid[position.y + i][position.x + j] = shapeId;

      }
    }
  }
}

function clearCompleteLines(grid){
  let clearedLines = 0;

  for(let i = grid.length - 1; i >= 0;i--){
    if(grid[i].every(cell=>cell!== BLOCK_EMPTY)){
      clearedLines++;
    }
    else if (clearedLines > 0){
      grid[i + clearedLines] = [...grid[i]];
    }
  }
  for(let i = 0; i < clearedLines;i++){
    grid[i].fill(BLOCK_EMPTY);
  }
  return clearedLines;
}

function updateScore(newScore){
  document.getElementById("goal-counter").innerText = newScore;
}

function updateTime(state){
  const elapsedTime = performance.now() - state.startTime;
  const data = new Date(elapsedTime);
  console.log(data.getSeconds());
  const timerText = `${data.getMinutes()}`.padStart(2,'0') + ':' + `${data.getSeconds()}`.padStart(2,'0');
  document.getElementById("time-counter").innerText = timerText;
}

function handleCurrentPieceLanding(state){
 attachToGrid(state.grid,state.currentPiece);
 const clearedLines = clearCompleteLines(state.grid);
 state.score += clearedLines;
 updateScore(state.score);
 state.currentPieceIndex +=1;
 const newPiece = createCurrentPiece(state.levelData[state.currentPieceIndex]);
 const {shape, position} = newPiece;

 if(canGridFitShape(state.grid,shape,position.x,position.y)){
  state.currentPiece = newPiece;
 }
 else{
  state.isGameOver = true;
 }

 //if it doesnt fit - game over
}

function moveCurrentPieceDown(state){
  state.gravity.progress = 0;

  const didMove = moveCurrentPiece(state.grid, state.currentPiece,0,1);
  if(!didMove){
    handleCurrentPieceLanding(state);
  }

  return didMove;
}

function updateGravity(state,dt){
  state.gravity.speed += GRAVITY_ACCELERATION * dt;
  state.gravity.progress += state.gravity.speed * dt;
  if(state.gravity.progress >= GRAVITY_THRESHOLD) {
    moveCurrentPieceDown(state);
  }
}

function resetGameState(state){
  Object.assign(state,getInitialState());
}

function update(state, inputs, dt,ctx) {

  if(state.isGameOver){
    //restart Game
  }else{
    updateCurrentPiece(state,inputs,dt,ctx);
    updateGravity(state,dt);
    updateTime(state);
  }
}

function getLevel(levelID){
  let level = new Promise(function(resolve,reject){
  const pLevelDataObject =getLevelDataObject();
  pLevelDataObject.then (
    function(value){
      if(value!== undefined){
        resolve(value.levelCollection[levelID])
      }
    },
    function(value){
      reject(false);
    }
  )
  });
  return level;
}

function setLevelLabel(levelID){
  console.log(levelID);
  document.getElementById("level-text").innerText = "Level " + (levelID+1);
}

function gameloop(levelData,levelID){
  const ctx = initCanvas();
  const state = getInitialState(levelData);
  const inputs = {};

  setLevelLabel(levelID);
    
  startCollectingInputs(ctx.canvas,state,inputs);

  let previousTime = performance.now();

  function loop(currentTime){
    const dt = Math.min(currentTime - previousTime, MAX_DT);
    previousTime = currentTime;
    update(state, inputs,dt,ctx);
    render(ctx,state);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

function getCurrentLevelID(){
  const levelID = parseInt(localStorage.getItem("currentLevel"));
  localStorage.setItem("currentLevel",levelID+1)
  return levelID;
}
function main(){
  const levelID = getCurrentLevelID();
  initLogsystem(levelID);
  const levelData = getLevel(levelID);
  levelData.then(function(levelData){
    gameloop(levelData,levelID),function(){
      alert("Game Data could not be loaded");
    }
  })
}


window.onload = (event) => {
  main();
};