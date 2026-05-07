
function initShareButton(){
  const shareButton = document.getElementById("share-button");
  
  shareButton.addEventListener("click", async() => {
    let file = createLoggingFile();
    const shareData = {
    title: "Logging File",
    text: "Share this file over WhatsApp",
    files: [file],
    };
  
    try {
      navigator.share(shareData);
    } catch (err) {
      alert(`Error: ${err}`);
    };
});

}


function createLoggingFile(){
  const options = {type: 'text/plain'};
  if(createLoggingFile.preProcessedFile === undefined){
    let promiseLogs = getLogs();
    promiseLogs.then(function(value){
      let content = JSON.stringify(value);
      createLoggingFile.preProcessedFile = new File([content],"Logging File.txt",options);
    },)
  }
  else{
    return createLoggingFile.preProcessedFile;
  }
}

function initFileUpload(){
  const inputElmt = document.getElementById("file-upload");
  const output = document.getElementById("output");
  
  const levelDataObject = getLevelDataObject();
  levelDataObject.then(
    function(value){ //Accepted
      if(value === undefined){
        console.log("No file there")
      }
      else{
        output.innerText = value.name;
      }
    },
    function(value){ //Rejected
      console.log("No file there")
    }
  )

  inputElmt.addEventListener("change",(e)=>{
    const selectedFile = e.target.files[0];
    output.innerText = "Processed...";
    reader = new FileReader();
    //document.body.appendChild(inputElmt);
    reader.addEventListener("load",function(e){
      const LevelDataObject = parseLevelData(reader.result);
      output.innerText = LevelDataObject.name;
      storeLevelObject(LevelDataObject);
    });
    //document.body.removeChild(inputElmt);
    reader.readAsBinaryString(selectedFile);
  })

}



function main(){
  initDB();
  createLoggingFile();
  initShareButton();
  initFileUpload();


}


window.onload = (event) =>{
    main();
}

