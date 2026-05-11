
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
function createLog(timeStamp,xpos,ypos,eventtype,levelID){
    return {t: timeStamp,x: xpos,y:ypos,e: eventtype,l: levelID};
}

function logAction(xpos,ypos,eventtype){
    initLogsystem.logCollection.push(createLog(performance.now(),xpos,ypos,eventtype,initLogsystem.currentLevelID));
    

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
            initLogsystem.logCollection.shift()
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
        console.error("Complete Logging");
        initLogsystem.logCollection = [];
    }
}


function getLogs(){
    let logsReady = new Promise(function(resolve,reject){

    let openRequest = indexedDB.open('logDatabase',1);
    let fileContent = "";
    openRequest.onsuccess = function(){
        let db = openRequest.result;

        let transaction = db.transaction('logStore','readonly');

        let logStore = transaction.objectStore('logStore');

        let request = logStore.openCursor();

        request.onsuccess = function(){
            let cursor = request.result;
            if(cursor){
                let key = cursor.key;
                let value = cursor.value;
                //console.log(key,value);
                function replacer(key,value){
                    if(key == "id") {return undefined;}
                    if(key == "e"){return value.substring(5);}
                    return value;
                }
                fileContent = fileContent + JSON.stringify(value,replacer) + ",";

                cursor.continue();
            }
            else{
                console.log("all data read");
                resolve(fileContent);
            }
        }
        

        request.onerror = function(){;
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