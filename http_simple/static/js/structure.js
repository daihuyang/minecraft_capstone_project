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

    /////////////////////////////////////
    // future home of pillbox handling //
    /////////////////////////////////////
    $('#update-button').click(function(){
        var chosenEvents = $('.event-selector').val();
        alert(chosenEvents);
    });
});