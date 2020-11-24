const electron = require("electron");

let {PythonShell} = require('python-shell')

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



copyButton.addEventListener('click', (event) => {
  electron.clipboard.writeText(document.getElementById("CommandLabel").value);
  // Websocket Connection to send when client has run
  // currently tied to copyButton, to be moved to the run button
  let socket = new WebSocket("ws://localhost:8765");
  socket.send("BlockPlaced");
  /*
  We should have this send the event that is being subscribed to 
  and the command to execute when that event occurs
  */
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