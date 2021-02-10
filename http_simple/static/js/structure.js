// window.onload = function(){
    var addButton = document.querySelector("#add-button");
    addButton.onclick = function(){
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
    }
    // document.querySelector('.code-input').addEventListener('input',function(){
    //     $('.code-input').css('background-size','cover')
    // });
// };

// Global variables of the updated pixel values of the HTML body's width and height based on the users window size
var windowHeight;
var windowWidth;

// gets the user's inner-window height and width and sets Global variables, as well as the CSS properties for the body.
window.onresize = window.onload = function () {
    windowHeight = this.innerHeight;
    windowWidth = this.innerWidth;
    document.getElementById("bodyEl").style.height = windowHeight + "px";
    document.getElementById("bodyEl").style.width = windowWidth + "px";
};

var allEvents = ["event1", "event2"];
var selectedEvents = []; // use this group of selected events to send as a comma separated list for python over 3005

// select2 select box styling using jQuery
$(".event-selector").select2({
    placeholder: "Select an event"
});

// Use cloneNode() instead to add the new div that includes the text area and buttons 
// function addTextGroup() {
//     console.log("hi");
//     textGroupCounter = textGroupCounter + 1;
//     var textSection = document.getElementById("text-section");
//     var textGroup = document.createElement("div");
//     textGroup.className = "text-group";
//     var buttonGroup = document.createElement("div");
//     textGroup.className = "button-group";
//     var runButton = document.createElement("button");
//     runButton.name = "run-button-" + textGroupCounter;
//     runButton.type = "button";
//     runButton.className = "run-button";
//     runButton.innerHTML = "RUN";
//     var removeButton = document.createElement("button");
//     removeButton.type = "button";
//     removeButton.className = "remove-button";
//     removeButton.name = "remove-button-" + textGroupCounter;
//     removeButton.innerHTML = "REMOVE";
//     var textArea = document.createElement("textarea");
//     textArea.name = 'text-input-' + textGroupCounter;
//     textArea.className("text-area");
//     textArea.rows = 6;
//     textSection.appendChild(textGroup);
//     textGroup.appendChild(buttonGroup);
//     textGroup.appendChild(textArea);
//     buttonGroup.appendChild(runButton);
//     buttonGroup.appendChild(removeButton);
// };
