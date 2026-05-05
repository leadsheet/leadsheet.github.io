
function initShareButton(){
  const shareButton = document.getElementById("share-button");

  const options = {type: 'text/plain'};

  
  shareButton.addEventListener("click", async() => {
    let promiseLogs = getLogs();
    promiseLogs.then(function(value){
      
      const file = new File([JSON.stringify(value)],"Logging File.txt",options);

      const shareData = {
      title: "Logging File",
      text: "Share this file over WhatsApp",
      files: [file],
      };
  
      try {
        navigator.share(shareData);
      } catch (err) {
        alert(`Error: ${err}`);
      }
    },function(value){

    })

  });
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
  initShareButton();
  initFileUpload();


}


window.onload = (event) =>{
    main();
}

