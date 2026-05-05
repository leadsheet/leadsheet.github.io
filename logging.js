
function initLogsystem(levelID){
    console.log("Init Logsystem");
    if(initLogsystem.logCollection === undefined){
        initLogsystem.logCollection = [];
    }
    if(initLogsystem.currentLevelID === undefined){
        initLogsystem.currentLevelID = levelID;
    }
    let openRequest = indexedDB.open("logDatabase",1);

    openRequest.onupgradeneeded = function(){
        let db = openRequest.result;
        if(!db.objectStoreNames.contains('logStore')){
            db.createObjectStore('logStore',{keyPath: "id",autoIncrement:true});
        }
    }

    openRequest.onerror = function(){
        console.error("Error",openRequest.error);
    }

}
function createLog(timeStamp,xpos,ypos,levelID){
    return {timeStamp: timeStamp,x: xpos,y:ypos,level: levelID};
}

function logAction(xpos,ypos){
    initLogsystem.logCollection.push(createLog(performance.now(),xpos,ypos,initLogsystem.currentLevelID));
    

}

function saveLogs(){
    let openRequest = indexedDB.open("logDatabase",1);

    openRequest.onupgradeneeded = function(){
        let db = openRequest.result;
        if(!db.objectStoreNames.contains('logStore')){
            db.createObjectStore('logStore',{keyPath: "id",autoIncrement:true});
        }
    }

    openRequest.onsuccess = function(){
        let db = openRequest.result;
        let transaction = db.transaction('logStore','readwrite');
        let logStore = transaction.objectStore('logStore')

        initLogsystem.logCollection.forEach(function(item,index){
        let request = logStore.put(item);

        request.onsuccess = function(){
            console.log("Log succesul saved");
        }
        request.onerror = function(){
            console.error(request.error);
        }
        })
    }

    openRequest.onerror = function(){
        console.error("Error",openRequest.error);
    }
    openRequest.oncomplete = function(){
        console.log("Complete Logging");
        initLogsystem.logCollection = [];
    }
}

function getLogs(){
    let logsReady = new Promise(function(resolve,reject){

    let openRequest = indexedDB.open('logDatabase',1);
    openRequest.onsuccess = function(){
        let db = openRequest.result;

        let transaction = db.transaction('logStore','readonly');

        let logStore = transaction.objectStore('logStore');

        let request = logStore.getAll();

        request.onsuccess = function(){
            resolve(request.result);
        }

        request.onerror = function(){
            console.error(request.error);
            reject(false);
        }
    }
    openRequest.onerror = function(){
        reject(false);
    }

    })

    return logsReady;

}

window.onload = (event) => {

}