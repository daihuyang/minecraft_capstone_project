$(document).ready(function(){
    $('#add-button').click(function(){
        // max of 10 entries currently
        if($('.text-group').length < 10){
            var newBox = $('.text-group').first().clone();
            $(newBox).children('.code-input').html('<br/><br/><br/><br/><br/>');
            $(newBox).appendTo($('#text-section'));
            // update remove button to work
            $('.remove-button').click(function(e){
                if($('.text-group').length > 1){
                    $(e.target).parent().parent().remove();
                }
            });
        }
    });

    // select2 select box styling using jQuery
    $(".event-selector").select2({
        placeholder: "Select an event"
    });

    // initialize websocket
    let socket = new WebSocket("ws://localhost:3005/");

    // connection established
    socket.onopen = function(e) {

    };

    // data received
    socket.onmessage = function(e) {
        
    };

    // connection closed
    socket.onclose = function(e) {

    };

    // websocket error
    socket.onerror = function(e) {

    }

    /////////////////////////////////////
    // future home of pillbox handling //
    /////////////////////////////////////
    $('#update-button').click(function(){
        var chosenEvents = $('.event-selector').val();
        socket.send(chosenEvents);
        // alert(chosenEvents);
    });
});