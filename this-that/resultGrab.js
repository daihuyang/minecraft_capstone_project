const data = require("events.json");

let event_header = document.getElementById("event-header");
let occured_header = document.getElementById("occured-header");

let json_file = JSON.parse(data);

event_header.innerHTML += json_file.keys();