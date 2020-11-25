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
    //eventsOccured.push(JSON.parse(arg.slice(indices[indices.length-1])+1));
    let dictionary = {};
    for(var i=0; i < eventsOccured.length; i++){
        // reading one short
        if(eventsOccured["body"]["eventName"] == "BlockPlaced"){
            // if (dictionary[eventsOccured["properties"]["block"]] == undefined)
            //     dictionary[eventsOccured["properties"]["block"]]= 1;
            // else
            //     dictionary[eventsOccured["properties"]["block"]]++;
            
            eventHeader.innerHTML = ":)";
        }
    }
    // let maxTest = Object.values(dictionary);
    // // let i = arr.indexOf(Math.max(...dictionary));
    // let somethingFun = Object.keys(dictionary);

    occuredHeader.innerHTML = eventsOccured.length + 1; // "Huge Win for us"
});
