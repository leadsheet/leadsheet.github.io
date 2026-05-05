const OFFSET_CONTENT = 34;
const HASH_LENGTH = 64;

const levelObjectKey = 'LEVELKEY';

function initDB(){
  let openRequest = indexedDB.open("levelObjectDatabase",1);

  openRequest.onupgradeneeded = function(){
    let db = openRequest.result;
    if(!db.objectStoreNames.contains('levelObjectStore')){
      db.createObjectStore('levelObjectStore');
    }
    if(!db.objectStoreNames.contains('gameLogStore')){
      db.createObjectStore('gameLogStore');
    }
  }

}

function storeLevelObject(levelObject,override=true){
  let openRequest = indexedDB.open("levelObjectDatabase",1);

  openRequest.onupgradeneeded = function(){
    let db = openRequest.result;
    if(!db.objectStoreNames.contains('levelObjectStore')){
      db.createObjectStore('levelObjectStore');
    }
  }

  openRequest.onerror = function(){
    console.error(openRequest.error);
  }

  openRequest.onsuccess = function(){
    let db = openRequest.result;



    let transaction = db.transaction('levelObjectStore','readwrite');

    let levelObjectStore = transaction.objectStore('levelObjectStore');

    let request;

    if(override){
      request = levelObjectStore.put(levelObject,levelObjectKey);
    }else{
      request = levelObjectStore.add(levelObject,levelObjectKey);
    }

    request.onsuccess = function(){
      console.log("text saved with: ",request.result);
    }

    request.onerror = function(){
      console.error(request.error);
    }
  }
}

function getLevelDataObject(){
  let levelDataReady = new Promise(function(resolve,reject){
    let openRequest = indexedDB.open("levelObjectDatabase",1);

    openRequest.onerror = function(){
      console.error(openRequest.error);
      reject(false);
    }
    openRequest.onsuccess = function(){
      let db = openRequest.result;
      if(db.objectStoreNames.contains("levelObjectStore")){
        let transaction = db.transaction('levelObjectStore','readwrite');

        let levelObjectStore = transaction.objectStore('levelObjectStore');
      

        let request = levelObjectStore.get(levelObjectKey);

        request.onsuccess = function(e){
          resolve(request.result);
        }
        request.onerror = function(){
          console.error(request.error);
          reject(false);
      }
    }
    else{
      reject(false);
    }

    }
  })

  return levelDataReady;
}


function hash(string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}

//FIX Hash wird nicht kontrolliert
function parseLevelData(content){
    const levelNum = parseInt(content.substr(24,5));
    const blockNum = parseInt(content.substr(29,5));
    const contentSize = levelNum*blockNum;
    const contentString = content.substr(OFFSET_CONTENT,contentSize);
    const hashValue = content.substr(OFFSET_CONTENT+contentSize,HASH_LENGTH);
    let levelCollection = [];
    for(let i = 0; i < levelNum;i++){
      const levelString = contentString.substr(i*blockNum,blockNum);
      const levelArray = Array.from(levelString,(x)=>parseInt(x));
      levelCollection.push(levelArray);
    }
    return {
      name: content.substr(4,20).trim(),
      levelNum: levelNum,
      blockNum: blockNum,
      levelCollection: levelCollection
    }

}

function validData(content){
    if(content.length > 50 && content.substr(0,4) == "spdt"){return true;}
    return false;
}




