window.onload = function () {
    var sock;
    openSocket();
    const runButton = document.querySelector(".button3");
    const textBox = document.querySelector("#textbox");
    const outputArea = document.querySelector(".output-area");
    
    runButton.addEventListener("click", function () {
        var pythonCommand = textBox.value;
        sendReceive(pythonCommand);
    });

    // const outputSocket = new Websocket("ws://localhost:3005/"); // recieves the output of the python code
    // outputSocket.addEventListener("message", function (event) {
	// outputArea.value = event.data;
    // });
}

// initialize comm with Python
function openSocket() {
    // initialize socket
    sock = new WebSocket("ws://localhost:3001/"); // change later
    // tell Python that Javascript is ready
    sock.onopen = function(event){
        sock.send("JAVASCRIPT UP");
    };
}


function sendReceive(sock,message){
    sock.send(message);
    let recv = "";
    //let responseRecv = false;
    sock.onmessage = function(event){
        let recv = event.data;
        //let responseRecv = true;
        outputArea.html = recv;
    }
}

// closes socket silently
function closeSocket(sock){
    sock.onclose = function () {}; // disable onclose handler first
    sock.close();
}