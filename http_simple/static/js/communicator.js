const runButton = document.querySelector(".button3");

var sock = new WebSocket("ws://localhost:3001/"); // change later
var message = String(eventSelector.value) + "," + String(responseSelector.value);

sock.onopen = function(event){
    sock.send(message)
    sock.onclose = function () {}; // disable onclose handler first
    sock.close();
};

