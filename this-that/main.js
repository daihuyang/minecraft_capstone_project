const { app, BrowserWindow, webContents } = require('electron')
const {ipcMain} = require('electron');
const { ipcRenderer } = require('electron');
const fs = require('fs');

if (require('electron-squirrel-startup')) return app.quit();

ipcMain.on('request-mainprocess-action', (event, arg) => {
  if(arg == 0){
    app.quit();
  }

  // prints received message to console
  console.log(arg);
  // reads file
  fs.readFile('events.json', 'utf-8', (err, data) => {
    if(err){
        alert("An error ocurred reading the file :" + err.message);
        return;
    }
    // send file contents back to IPC event location with proper IPC ID
    event.reply('request-json', data);
  
  });
});

// var img = new Image();
// img.src='./resources/background.png';

function createWindow () {
  const win = new BrowserWindow({
    width: 905,
    height: 532,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false,
    resizable: false
  })

  win.loadFile('index.html')
  // win.webContents.openDevTools()
}

function writeToCons(msg){
  console.log(msg);
}

app.whenReady().then(createWindow);
//app.on('ready',createWindow);
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