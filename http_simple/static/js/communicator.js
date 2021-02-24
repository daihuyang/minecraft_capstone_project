$(document).ready(function(){
    // initialize socket
    let sock = new WebSocket("ws://localhost:3001/"); // change later
    // tell Python that Javascript is ready

    sock.onmessage = function(event){
        alert(event.data) // event.data is the output of the code
    };
    // TODO: move to classes, away from IDs
    const textBox = document.querySelector(".text-area");
    let outputArea = document.querySelector(".output-area");
    // set up run button
    primeRunButtons(sock);
    // const outputSocket = new Websocket("ws://localhost:3005/"); // recieves the output of the python code
    // outputSocket.addEventListener("message", function (event) {
	// outputArea.value = event.data;
    // });
});

function primeRunButtons(sock){
    $('.run-button').click(function(){
        let $btn = $(this);
        var pythonCommand = $(this).parent().parent().children('.code-input').html(); //.replace(/<div>/,'\n').replace(/<[^>]*>/gm,'');
        alert(pythonCommand);
        //sendReceive(sock,pythonCommand);
        sock.send(pythonCommand);
        $(this).parent().parent().children('.code-output').css('display','block');
        sock.onmessage = function(event){
            $btn.parent().parent().children('.code-output').html(event.data); // event.data is the output of the code
        };
        // sock.onmessage = function(event){
        //     alert(event.data) // event.data is the output of the code
        // };
    });
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