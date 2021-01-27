window.onload = function () {
    const runButton = document.querySelector(".button3");
    const textBox = document.querySelector("#textbox");
    
    runButton.addEventListener("click", function () {
        var pythonCommand = textBox.value;
        openSocket(pythonCommand);
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
