// const md = new Remarkable({
//     highlight: function (str, lang) {
//         if (lang && hljs.getLanguage(lang)) {
//           try {
//             return hljs.highlight(lang, str).value;
//           } catch (err) {}
//         }
    
//         try {
//           return hljs.highlightAuto(str).value;
//         } catch (err) {}
    
//         return ''; // use external default escaping
//     }
// });
// Above code introduces syntax highligthing, but is not used to avoid rich text copy errors
const md = new Remarkable();
let lessonChosen = false;
let reader = new FileReader();

var minecraftEvents = [ 
    "AgentCommand",
    "BlockBroken",
    "BlockPlaced",
    "CameraUsed",
    "EndOfDay",
    "EntitySpawned",
    "ItemAcquired",
    "ItemCrafted",
    "ItemDropped",
    "ItemEquipped",
    "ItemInteracted",
    "ItemNamed",
    "ItemSmelted",
    "ItemUsed",
    "MobKilled",
    "PlayerBounced",
    "PlayerDied",
    "PlayerMessage",
    "PlayerTeleported",
    "PlayerTravelled",
];

$(document).ready(function () {
    // handle proper python syntax within code blocks i.e. tabs
    $("div.code-input").on("paste",function(e){
        e.preventDefault();
        var text = (e.originalEvent || e).clipboardData.getData('text/plain') + "\r\n";
        document.execCommand("insertHTML", false, text);
        // $(this).text($(this).text() + "\r\n");
    });
    $("div.code-input").on("keydown",function(event){
        if(event.keyCode === 9){
            event.preventDefault();
            var range = window.getSelection().getRangeAt(0);
            var tabNode = document.createTextNode("    ");
            range.insertNode(tabNode);
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode); 
        }
    });
    $("div.code-input").on("paste",function(event){
        $(this).text($(this).text() + "\r\n");
    });
    
    // initialize socket
    let sock = new WebSocket("ws://localhost:3001/"); // change later

    // ensure copying of connection message works
    $('#copy-button').click(function () {
        navigator.clipboard.writeText("/connect localhost:8765").then(function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    });

    // set up event subscription selector
    var $subscriptionSelector = $("#subscription-selector");
    minecraftEvents.forEach(function(m_e, i){
        var $option = $("<option>",{
            value: m_e,
            text: prettyPrint(m_e)
        })
        $subscriptionSelector.append($option);
    })

    // set up the REPL buttons
    $('#add-button').click(function () {
        // max of 10 entries currently
        if ($('.text-group').length < 10) {
            var newBox = $('.text-group').first().clone();
            $(newBox).children('.code-input').html('<br/><br/><br/><br/><br/>');
            $(newBox).children('.code-output').html('');
            $(newBox).children('.code-output').css('display', 'none');
            $(newBox).appendTo($('#text-section'));
            // update remove button to work
            $('.remove-button').click(function (e) {
                if ($('.text-group').length > 1) {
                    $(e.target).parent().parent().remove();
                }
            });
        }
        // update run buttons
        primeRunButtons(sock);
    });

    sock.onmessage = function (event) {
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
    $('#update-button').click(function () {
        var chosenEvents = $('.event-selector').val();
        socket.send(chosenEvents);
        // alert(chosenEvents);
    });

    $("#lessons-button").click(function () {
        toggleLessons();
    })

    function toggleLessons() {
        var $lessonsWindow = $("#lessons-window");
        if ($lessonsWindow.css("display") == "none") {
            // give some screenspace to the lessons window
            $("#text-section").css("height", ($("#text-section").css("height").replace("px", "") / 2) + "px");
            $lessonsWindow.css("display", "block");
            loadLessonsWindow();
        } else {
            $lessonsWindow.html("");
            $lessonsWindow.css("display", "none");
            $("#text-section").css("height", ($("#text-section").css("height").replace("px", "") * 2) + "px");
        }
    }

    function loadLessonsWindow() {
        if (!lessonChosen) {
            var $startPage = $("<div>", { id: "lesson-start-page" });
            var $header = $("<h2>", {
                id: "lessons-header",
                class: "lessons-startpage",
                text: "Choose a Lesson:",
                align: "center"
            });
            var $inputContainer = $("<div>",{
                id: "lessons-body",
                align: "center",
                style: "text-align: center;"
            });
            var $filePicker = $("<input>", { 
                id: "file-picker",
                type: "file" 
            });
            $header.appendTo($startPage);
            $filePicker.appendTo($inputContainer);
            $inputContainer.appendTo($startPage);
            $startPage.appendTo($("#lessons-window"));
            $filePicker.on("change", function () {
                lessonChosen = true;
                loadLessonsWindow();
            });
        } else {
            var $backButton =$("<button>", {
                type: "button",
                id: "back-button",
                class: "minecraft-button",
                text: "Back"
            });
            var $lessonDiv = $("<div>", {
                id: "lesson-div"
            });
            // read in lesson & render as HTML
            var lessonInput = document.querySelector("#file-picker");
            let file = lessonInput.files[0];
            reader.readAsText(file);
            reader.onload = function() {
                $lessonDiv.html(md.render(reader.result));
            };
            $backButton.click(function () {
                $("#lessons-window").html("");
                lessonChosen = false;
                loadLessonsWindow();
            });
            // clear lessons page and load new content
            $("#lessons-window").html("");
            $("#lessons-window").append($backButton);
            $lessonDiv.appendTo($("#lessons-window"));
        }

    }
});

function primeRunButtons(sock) {
    $('.run-button').click(function () {
        let $btn = $(this);
        var pythonCommand = "";
        var inputField = $(this).parent().parent().children('.code-input');
        // attempt to catch first line (parsing doesn't work on first line withour a carriage return)
        try{
            var startLineEnd = inputField.html().indexOf("<br>");
            pythonCommand = `${inputField.html().slice(0,startLineEnd)}\n`;
        }catch(e){}
        // parse rest of input
        inputField.children('div').each(function(){
            var curr = $(this).text();
            // console.log($(this).parent().html());
            pythonCommand += `${curr}\n`;
        });
        console.log(pythonCommand);
        sock.send(pythonCommand);
        $(this).parent().parent().children('.code-output').html("Done with 0 Errors");
        sock.onmessage = function (event) {
            $btn.parent().parent().children('.code-output').html(event.data); // event.data is the output of the code
        };
        $(this).parent().parent().children('.code-output').css('display', 'block');
        // sock.onmessage = function(event){
        //     alert(event.data) // event.data is the output of the code
        // };
    });
}

function sendReceive(sock, message) {
    sock.send(message);
    let recv = "";
    //let responseRecv = false;
    sock.onmessage = function (event) {
        let recv = event.data;
        //let responseRecv = true;
        outputArea.html = recv;
    }
}

// closes socket silently
function closeSocket(sock) {
    sock.onclose = function () { }; // disable onclose handler first
    sock.close();
}

function dismissPopUp(e) {
    // $(e.parent).remove();
    $('#popUp').remove();
    $('#faded').remove();
}

function prettyPrint(phrase){
    return phrase.match(/[A-Z][a-z]+/g).join(" ")
}