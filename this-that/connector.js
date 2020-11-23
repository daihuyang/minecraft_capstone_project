let {PythonShell} = require('python-shell')

let inputArgs = ["testing", 1, 34*2];
let options = {
  mode: 'text',
  pythonOptions: ['-u'], // get print results in real-time
  scriptPath: './Python/',
  args: inputArgs
};

let shell = new PythonShell('mee.py', options);
shell.on('message', function(message){
  console.log(message);
});