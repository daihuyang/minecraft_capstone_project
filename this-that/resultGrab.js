const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
//const {ipcMain} = require('electron');

let eventHeader = document.getElementById("event-header");
let occuredHeader = document.getElementById("occured-header");

ipcRenderer.send('request-mainprocess-action', "requesting JSON");

ipcRenderer.on('request-json', (event,arg) =>{ 
    // we will initialize an array of all object events by manually parsing the JSON file
    let eventsOccured = []; // this array
    // this will run thru finding all JSON errors & return the indices
    var regex = /\}\{/gi, result, indices = [];
    while ( (result = regex.exec(arg)) ) {
        indices.push(result.index);
    }
    // now we generate the objects from the returned indices of EOOs
    // don't touch this please
    indices.unshift(-1);
    for(var i=1; i < indices.length; i++){
        eventsOccured.push(JSON.parse(arg.slice(indices[i-1]+1,indices[i]+1)));
    }
    eventsOccured.push(JSON.parse(arg.slice(indices[indices.length-1]+1)));
    let dictionary = {};
    let eventCounter = 0;
    for(var i=0; i < eventsOccured.length; i++){
        // reading one short
        if(eventsOccured[i]["body"]["eventName"] == "BlockPlaced"){
            eventCounter++;
            if(!dictionary.hasOwnProperty(String(eventsOccured[i]["body"]["properties"]["Block"]))){
                dictionary[String(eventsOccured[i]["body"]["properties"]["Block"])] = 1;
            }else{
                dictionary[String(eventsOccured[i]["body"]["properties"]["Block"])]++;
            }
        }

    }
    let maxTest = Object.values(dictionary);
    let somethingFun = Object.keys(dictionary);

    let max = -1;
    let ind = -1;
    for(var i = 0; i < maxTest.length; i++){
        if(maxTest[i] > max){
            max = maxTest[i];
            ind = i;
        }
    }

    eventHeader.innerHTML = somethingFun[ind];
    occuredHeader.innerHTML = eventCounter; // "Huge Win for us"
});
