let {PythonShell} = require('python-shell')
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let options = {
  mode: 'text',
  pythonOptions: ['-u'], // get print results in real-time
  scriptPath: '.'
};

// PythonShell.run('hello.py', options, function  (err,results)  {
//   if  (err)  throw err;
//   console.log('hello.py finished.');
//   console.log('results', results);
// });

let shell = new PythonShell('mee.py', options);
shell.on('message', function(message){
  console.log(message);
});
