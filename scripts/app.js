const debugMode = true;
function isPWA(){
    const UA = navigator.userAgent;

    const IOS = UA.match(/iPhone|iPad|iPod/);
    const ANDROID = UA.match(/Android/);

    const PLATFORM = IOS ? 'ios' : ANDROID ? 'android' : 'unknown';

    const standalone = window.matchMedia('(display-mode: standalone)').matches;

    const INSTALLED = !!(standalone || (IOS && !UA.match(/Safari/)));
    return INSTALLED;
}

function main(){
    if(!isPWA() && !debugMode) {
        location.replace("../pwainfo.html");
    };

    const playButton = document.getElementById("play-button");
    const settingsButton = document.getElementById("settings-button");

    playButton.addEventListener("click",function(e){
        const pLevelData = getLevelDataObject()
        pLevelData.then(
            function(levelData){
                if(levelData !== undefined && parseInt(localStorage.getItem("currentLevel"))!== 1001){
                    location.replace('../game.html');
                }
            },
            function(levelData){
                console.log("Load levelData");
            }
        )
    })

    settingsButton.addEventListener("click",function(e){
        location.replace("../settings.html");
    })
    initDB();

}

window.onload = (event)=>{
    main();
}