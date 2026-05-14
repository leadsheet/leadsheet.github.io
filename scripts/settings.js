//Download Logs
function initShareButton(){
  const shareButton = document.getElementById("share-button");
  
  shareButton.addEventListener("click", async() => {
    //let file = createLoggingFile();
    const pGetLogs = getLogs();

    pGetLogs.then(
      function(fileContent){
        const file = new File([fileContent],"Logging.txt",{type:'text/plain'});
        const shareData = {
          title: "Logging File",
          text: "Share this file over WhatsApp",
          files: [file]
        }
        try{
          navigator.share(shareData);
        }catch(err){
          alert(`Error: ${err}`);
        }
      }
    )
});
}

function initCalculateButton(){
  const cbutton = document.getElementById("calculate-button");

  cbutton.addEventListener("click",function(){
    console.log("Hi");
    const pLogSize = calculateLogSize();
    cbutton.innerText = "Calculate...";
    pLogSize.then(
      function(fileSize){
        alert("LogFileSize: " + fileSize/1000 + "kb");
      },
      function(value){
        alert("Error during Calculation");
      }
    )
    pLogSize.finally(function(){
      cbutton.innerText = "Calculate filesize";
    })

  })
}




//Upload Gamefile
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
  initFileUpload();
  initShareButton();
  initCalculateButton();
}


window.onload = (event) =>{
    main();
}

