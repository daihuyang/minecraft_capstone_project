const electron = require("electron");
const { remote } = require('electron');
const app = require('electron').remote.app;
const { run } = require("python-shell");
const { BrowserWindow } = require('electron').remote; //added semicolon
const path = require('path');

let {PythonShell} = require('python-shell')

function createWindow () {
  const win = new BrowserWindow({
    width: 905,
    height: 532,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false
  })
  
  win.loadFile('results.html')
  //win.webContents.openDevTools()
}

// Document Buttons
let copyButton = document.getElementById("CopyButton");
let runButton = document.getElementById("RunButton");
let closeButton = document.getElementById("CloseButton");
let messageWindow = document.querySelector("#CommandLabel");

runButton.style.display = "none";

// Python shell connection + message receiving
let options = {
  mode: 'text',
  pythonOptions: ['-u'], // get print results in real-time
};
let shell = new PythonShell(path.join(app.getAppPath(), 'Python/mee.py'), options);
shell.on('message', function(message){
  document.getElementById("CommandLabel").value = message;
  if(message.includes("success")){
    runButton.style.display="block";
    copyButton.style.display = "none";
    messageWindow.value = "";
    document.querySelector("#minecraft-title").innerHTML = "Connected! Run Your Commands!";
  }
});

copyButton.addEventListener('click', (event) => {
  electron.clipboard.writeText(document.getElementById("CommandLabel").value);
});

copyButton.addEventListener('mouseover', (event) => {
  copyButton.classList.add('hover');
});

copyButton.addEventListener('mouseleave', (event) => {
  copyButton.classList.remove('hover');
  copyButton.classList.remove('active');
  copyButton.classList.remove('focus');
});

copyButton.addEventListener('mousedown', (event) => {
  if (event.button == 0){
    copyButton.classList.add('active');
  }
});

copyButton.addEventListener('mouseup', (event) => {
  copyButton.classList.remove("active")
});

copyButton.addEventListener('focus', (event) => {
  copyButton.classList.add('focus');
});

copyButton.addEventListener('blur', (event) => {
  copyButton.classList.remove('focus');
});

runButton.addEventListener('mouseover', (event) => {
  runButton.classList.add('hover');
});

runButton.addEventListener('mouseleave', (event) => {
  runButton.classList.remove('hover');
  runButton.classList.remove('active');
  runButton.classList.remove('focus');
});

runButton.addEventListener('mousedown', (event) => {
  if (event.button == 0){
    runButton.classList.add('active');
  }
});

runButton.addEventListener('mouseup', (event) => {
  runButton.classList.remove("active")
  let eventSelector = document.getElementById("events");
  let responseSelector = document.getElementById("response-selection");
  let sock = new WebSocket("ws://localhost:8766/");
  let message = String(eventSelector.value) + "," + String(responseSelector.value);
  sock.onopen = function(event){
    sock.send(message)
    sock.onclose = function () {}; // disable onclose handler first
    sock.close();
  };
  confirmAction();
});

runButton.addEventListener('focus', (event) => {
  runButton.classList.add('focus');
});

runButton.addEventListener('blur', (event) => {
  runButton.classList.remove('focus');
});

closeButton.addEventListener('mouseover', (event) => {
  closeButton.classList.add('hover');
});

closeButton.addEventListener('mouseleave', (event) => {
  closeButton.classList.remove('hover');
  closeButton.classList.remove('active');
  closeButton.classList.remove('focus');
});

closeButton.addEventListener('mousedown', (event) => {
  if (event.button == 0){
    closeButton.classList.add('active');
  }
});

closeButton.addEventListener('mouseup', (event) => {
  closeButton.classList.remove("active")

  createWindow();
  let win2= remote.getCurrentWindow();
  win2.close();
});

closeButton.addEventListener('focus', (event) => {
  closeButton.classList.add('focus');
});

closeButton.addEventListener('blur', (event) => {
  closeButton.classList.remove('focus');
});

async function confirmAction(){
  messageWindow.value = "*";
  await new Promise(r => setTimeout(r, 200));
  messageWindow.value = "--";
  for(var i = 2; i < 9; i++){
    await new Promise(r => setTimeout(r, 100));
    messageWindow.value += "-";
  }
  await new Promise(r => setTimeout(r, 100));
  messageWindow.value = "Instructions Updated!";
  await new Promise(r => setTimeout(r, 3000));
  messageWindow.value = "";
}
