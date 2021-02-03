window.onload = function () {
    document.getElementById("ide_title").innerHTML = "Width: " + window.innerWidth + " & Height: " + window.innerHeight;
    var addButton = document.getElementById("add-button");
    addButton.addEventListener("click", addTextGroup, true);
    document.getElementById("bodyEl").style.height = windowHeight + "px";
    document.getElementById("bodyEl").style.width = windowWidth + "px";
};

// Global variables of the updated pixel values of the HTML body's width and height based on the users window size
var windowHeight;
var windowWidth;

// gets the user's inner-window height and width and sets Global variables, as well as the CSS properties for the body.
window.onresize = window.onload = function () {
    windowHeight = this.innerHeight;
    windowWidth = this.innerWidth;
    document.getElementById("bodyEl").style.height = windowHeight + "px";
    document.getElementById("bodyEl").style.width = windowWidth + "px";
    // document.getElementById("ide-title").innerHTML = "Width: " + windowWidth + " & Height: " + windowHeight;
};

var textGroupCounter = 2;

function addTextGroup() {
    console.log("hi");
    textGroupCounter = textGroupCounter + 1;
    var textSection = document.getElementById("text-section");
    var textGroup = document.createElement("div");
    textGroup.className = "text-group";
    var buttonGroup = document.createElement("div");
    textGroup.className = "button-group";
    var runButton = document.createElement("button");
    runButton.name = "run-button-" + textGroupCounter;
    runButton.type = "button";
    runButton.className = "run-button";
    runButton.innerHTML = "RUN";
    var removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.name = "remove-button-" + textGroupCounter;
    removeButton.innerHTML = "REMOVE";
    var textArea = document.createElement("textarea");
    textArea.name = 'text-input-' + textGroupCounter;
    textArea.className("text-area");
    textArea.rows = 6;
    textSection.appendChild(textGroup);
    textGroup.appendChild(buttonGroup);
    textGroup.appendChild(textArea);
    buttonGroup.appendChild(runButton);
    buttonGroup.appendChild(removeButton);
};




















