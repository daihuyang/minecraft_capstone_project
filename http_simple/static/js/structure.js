// window.onload = function(){
    var addButton = document.querySelector("#add-button");
    addButton.onclick = function(){
        if($('.text-group').length < 10){
            var newBox = $('.text-group').first().clone();
            $(newBox).children('.code-input').html('<br/><br/><br/><br/><br/>');
            $(newBox).appendTo($('#text-section'));
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