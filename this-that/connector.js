let {PythonShell} = require('python-shell')

document.getElementsByTagName("h1")[0].innerHTML = "connector.js loaded";

let inputArgs = ["testing", 1, 34*2];
let options = {
  mode: 'text',
  pythonOptions: ['-u'], // get print results in real-time
  scriptPath: './Python/',
  args: inputArgs
};

let shell = new PythonShell('mee.py', options);
shell.on('message', function(message){
  document.getElementsByTagName("h1")[0].innerHTML = message;
});