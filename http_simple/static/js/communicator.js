const md = new Remarkable();
let currentLesson = -1;
$(document).ready(function () {
    // initialize socket
    $("div.code-input").on("paste",function(event){
        $(this).text($(this).text() + "\r\n");
    });

    let sock = new WebSocket("ws://localhost:3001/"); // change later

    $('#copy-button').click(function () {
        navigator.clipboard.writeText("/connect localhost:8765").then(function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    });

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
        toggleLessons(currentLesson);
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
        if (currentLesson == -1) {
            var $startPage = $("<div>", { id: "lesson-start-page" });
            var $header = $("<h2>", {
                id: "lessons-header",
                class: "lessons-startpage",
                text: "Choose a Lesson:",
                align: "center"
            })
            var $selector = $("<select>", { multiple: "multiple" });
            // this ideally holds all current lessons, loaded from a directory or DB
            var dummyOptions = ["Example", "Hierarchical Clustering", "Boogers"];
            dummyOptions.forEach(function (lesson, i) {
                var $choice = $("<option>", { value: i, name: lesson, text: lesson });
                $choice.appendTo($selector);
            });
            $header.appendTo($startPage);
            $selector.appendTo($startPage);
            $startPage.appendTo($("#lessons-window"));
            $selector.on("change", function () {
                currentLesson = $("option:selected", this).attr("value");
                loadLessonsWindow();
            });
        } else {
            // clear lessons page
            $("#lessons-window").html("");
            var $backButton = $("#lessons-window").append($("<button>", {
                type: "button",
                id: "back-button",
                class: "minecraft-button",
                text: "Back"
            }))
            var $lessonDiv = $("<div>", {
                id: "lesson-div"
            })
            $lessonDiv.appendTo($("#lessons-window"));
            // request lesson
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    $lessonDiv.html(md.render(this.responseText));
                }
            };
            xhttp.open("GET", "./resources/lessons/lesson_example.md", true);
            xhttp.send();
            $backButton.click(function () {
                $("#lessons-window").html("");
                currentLesson = -1;
                loadLessonsWindow();
            });
        }

    }
});

function primeRunButtons(sock) {
    $('.run-button').click(function () {
        let $btn = $(this);

        // Parse the code in the code-input
        var codeBlock = $(this).parent().parent().children('.code-input');
        var codeLines = [];
        codeBlock.children('div').each(function (){
            var currText = $(this);
            codeLines.push(currText.text());
        })
        var pythonCommand = codeLines.join("\n")
        console.log(pythonCommand)
        //sendReceive(sock,pythonCommand);
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