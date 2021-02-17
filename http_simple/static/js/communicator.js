$(document).ready(function(){
    // initialize socket
    let sock = new WebSocket("ws://localhost:3001/"); // change later
    // tell Python that Javascript is ready

    // sock.onmessage = function(event){
    //     alert(event.data)
    // };
    // TODO: move to classes, away from IDs
    const runButton = document.querySelector(".run-button");
    const textBox = document.querySelector(".text-area");
    let outputArea = document.querySelector(".output-area");
    
    runButton.addEventListener("click", function () {
        var pythonCommand = $(e.target).parent().parent().children('.code-input').text();
        alert(pythonCommand);
        //sendReceive(sock,pythonCommand);
        sock.send(pythonCommand);
        
    });

    // const outputSocket = new Websocket("ws://localhost:3005/"); // recieves the output of the python code
    // outputSocket.addEventListener("message", function (event) {
	// outputArea.value = event.data;
    // });
});

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