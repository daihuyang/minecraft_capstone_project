window.onload = function () {
    const runButton = document.querySelector(".button3");
    const textBox = document.querySelector("#textbox");
    const outputArea = document.querySelector(".output-area");
    
    runButton.addEventListener("click", function () {
        var pythonCommand = textBox.value;
        openSocket(pythonCommand);
    });

    const outputSocket = new Websocket("ws://localhost:3005/"); // recieves the output of the python code
    outputSocket.addEventListener("message", function (event) {
	outputArea.value = event.data;
    });
}


function openSocket (message) {
    var sock = new WebSocket("ws://localhost:3001/"); // change later

    sock.onopen = function(event){
        sock.send(message)
        sock.onclose = function () {}; // disable onclose handler first
        sock.close();
    };
}
