$(document).ready(function(){
    // initialize socket
    let sock = new WebSocket("ws://localhost:3001/"); // change later
    
    $('#copy-button').click(function(){
        var value = document.getElementById("myInput");
        copyText.select(); 
        document.execCommand("copy");
        // navigator.clipboard.writeText("/connect localhost:8765").then(function() {
        //     console.log('Async: Copying to clipboard was successful!');
        //   }, function(err) {
        //     console.error('Async: Could not copy text: ', err);
        //   });
    });

    // set up the REPL buttons
    $('#add-button').click(function(){
        // max of 10 entries currently
        if($('.text-group').length < 10){
            var newBox = $('.text-group').first().clone();
            $(newBox).children('.code-input').html('<br/><br/><br/><br/><br/>');
            $(newBox).children('.code-output').html('');
            $(newBox).children('.code-output').css('display','none');
            $(newBox).appendTo($('#text-section'));
            // update remove button to work
            $('.remove-button').click(function(e){
                if($('.text-group').length > 1){
                    $(e.target).parent().parent().remove();
                }
            });
        }
        // update run buttons
        primeRunButtons(sock);
    });

    sock.onmessage = function(event){
        alert(event.data) // event.data is the output of the code
    };

    // set up run button
    primeRunButtons(sock);

    // select2 select box styling using jQuery
    $(".event-selector").select2({
        placeholder: "Select an event"
    });

    // initialize websocket
    let socket = new WebSocket("ws://localhost:3005/");

    /////////////////////////////////////
    // future home of pillbox handling //
    /////////////////////////////////////
    $('#update-button').click(function(){
        var chosenEvents = $('.event-selector').val();
        socket.send(chosenEvents);
        // alert(chosenEvents);
    });
});

function primeRunButtons(sock){
    $('.run-button').click(function(){
        let $btn = $(this);
        var pythonCommand = $(this).parent().parent().children('.code-input').html().replace(/<div>/gm,'\n').replace(/<[^>]*>/gm,'');
        //sendReceive(sock,pythonCommand);
        sock.send(pythonCommand);
        $(this).parent().parent().children('.code-output').html("Done with 0 Errors");
        sock.onmessage = function(event){
            $btn.parent().parent().children('.code-output').html(event.data); // event.data is the output of the code
        };
        $(this).parent().parent().children('.code-output').css('display','block');
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

function dismissPopUp(e){
    // $(e.parent).remove();
    $('#popUp').remove();
    $('#faded').remove();
}