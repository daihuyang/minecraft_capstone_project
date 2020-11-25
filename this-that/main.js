const { app, BrowserWindow } = require('electron')
const { Notification } = require('electron')

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
    frame: true,
    resizable: false
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
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