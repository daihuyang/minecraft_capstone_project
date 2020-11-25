const electron = require("electron");
//const { remote } = require('electron');
const { BrowserWindow } = require('electron').remote

let {PythonShell} = require('python-shell')

function createWindow () {
  const win = new BrowserWindow({
    width: 905,
    height: 532,
    webPreferences: {
      nodeIntegration: true
    },
    frame: true,
    resizable: false
  })

  win.loadFile('results.html')
  //win.webContents.openDevTools()
}

createWindow();

// Python Shell connection

let inputArgs = ["testing", 1, 34*2];
let options = {
  mode: 'text',
  pythonOptions: ['-u'], // get print results in real-time
  scriptPath: './Python/',
  args: inputArgs
};

let shell = new PythonShell('mee.py', options);
shell.on('message', function(message){
  document.getElementById("CommandLabel").value = message;
});


// Document Buttons
let copyButton = document.getElementById("CopyButton");
let runButton = document.getElementById("RunButton")


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
});

runButton.addEventListener('focus', (event) => {
  runButton.classList.add('focus');
});

runButton.addEventListener('blur', (event) => {
  runButton.classList.remove('focus');
});
