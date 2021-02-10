// window.onload = function(){
    var addButton = document.querySelector("#add-button");
    addButton.onclick = function(){
        if($('.text-group').length < 10){
            var newBox = $('.text-group').first().clone();
            $(newBox).children('.code-input').html('<br/><br/><br/><br/><br/>');
            $(newBox).appendTo($('#text-section'));
            $('.remove-button').click(function(e){
                if($('.text-group').length > 1){
                    let Removebutton = $(e.target);
                    Removebutton.parent().parent().remove();
                }
               
            });
        }
    }
    // document.querySelector('.code-input').addEventListener('input',function(){
    //     $('.code-input').css('background-size','cover')
    // });
// };
// var removeButton=document.querySelector("#remove-button");

// removeButton.addEventListener("click",(event)=>{
//      if(event.target.tagName==='text-section'){
//          const button=event.target;
//          const div=button.parentNode;
//          const ul=div.parentNode;
//          if(button.textContent === 'REMOVE'){
//              ul.removeChild(div);
//          }

//      }

//  })

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