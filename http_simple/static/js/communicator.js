window.onload = function () {
    // initialize socket
    let sock = new WebSocket("ws://localhost:3001/"); // change later
    // tell Python that Javascript is ready
    sock.onopen = function(event){
        //sock.send("print('Hi')");
        //sock.send('JAVASCRIPT READY');
    };
    // TODO: move to classes, away from IDs
    const runButton = document.querySelector(".run-button");
    alert(runButton);
    const textBox = document.querySelector(".text-area");
    let outputArea = document.querySelector(".output-area");
    
    runButton.addEventListener("click", function () {
        let pythonCommand = textBox.value;
        alert(pythonCommand);
        //sendReceive(sock,pythonCommand);
        sock.send(pythonCommand);
        // let recv = "";
        // //let responseRecv = false;
        // sock.onmessage = function(event){
        //     let recv = event.data;
        //     //let responseRecv = true;
        //     outputArea.html = recv;
        // }
    });

    // const outputSocket = new Websocket("ws://localhost:3005/"); // recieves the output of the python code
    // outputSocket.addEventListener("message", function (event) {
	// outputArea.value = event.data;
    // });
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