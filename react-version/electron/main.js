const {app, BrowserWindow, Menu, Tray, ipcMain, globalShortcut} = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const directoryReader = require('./directoryReader');
const fileManipulator = require('./fileManipulator');

let fileManagerInfo;

let mainWin, cameraWin, tray;

function destroyWindowApp() {
  mainWin = null;
  cameraWin = null;
}

function createWindowApp() {
  if (!mainWin) {
    mainWin = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    mainWin.loadURL(isDev ?
      'http://localhost:3000' :
      `file://${path.resolve(__dirname, '..', 'build', 'index.html')}`,
    );
    mainWin.on('closed', destroyWindowApp);
    globalShortcut.register('CmdOrCtrl+P', () => {
      if (mainWin) {
        mainWin.send('screenshot');
      }
    });
    initFileManagerInfo();
  }
}

function initFileManagerInfo() {
  const directory = fileManagerInfo ? fileManagerInfo.folders.current :
    '/home/rafael/electron/curso/projeto-final/logos';
  directoryReader.load(directory).then(info => {
    fileManagerInfo = info;
    mainWin.send('changeFiles', fileManagerInfo);
  });
}

function createTray() {
  tray = new Tray(__dirname+'/app/assets/img/icon.png');
  const menu = Menu.buildFromTemplate([
    {label: 'Abrir', click: createWindowApp},
    {label: 'Sair', click: app.quit},
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip('Image Manager');
  app.on('window-all-closed', () => {});
}

function startApp() {
  createWindowApp();
  // DOES NOT WORK ON MINT 19.3 createTray();
}

app.on('ready', startApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWin === null) {
    createWindowApp();
  }
});

ipcMain.on('updateFilesList', () => {
  mainWin.send('updateFilesList');
});

ipcMain.on('selectDir', (event, directory) => {
  directoryReader.load(directory).then(info => {
    fileManagerInfo = info;
    mainWin.send('changeFiles', fileManagerInfo);
  });
});

ipcMain.on('requireFileInfo', initFileManagerInfo);

fileManipulator.instance(initFileManagerInfo);

ipcMain.on('closeCamera', () => {
  cameraWin.close();
  cameraWin = null;
});

ipcMain.on('openCamera', () => {
  if (!cameraWin) {
    cameraWin = new BrowserWindow({
      width: 660,
      height: 540,
      transparent: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
      },
      resizable: false,
      alwaysOnTop: true,
    });
    cameraWin.loadURL(isDev ?
      'http://localhost:3000/camera' :
      //FIXME how to open the correct content in "build"
      `file://${path.resolve(__dirname, '..', 'build', 'index.html')}`
    );
    cameraWin.on('closed', () => cameraWin = null);
  }
});
