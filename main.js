const {app, BrowserWindow, Menu, Tray, ipcMain, globalShortcut} = require('electron');

const URLs = {
  renderer: path => 'file://'+__dirname+'/app/renderer/'+path,
};
const appURL = URLs.renderer('index.html');

let win, tray;

function destroyWindowApp() {
  win = null;
}

function createWindowApp() {
  if (!win) {
    win = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    win.loadURL(appURL);
    win.on('closed', destroyWindowApp);
    globalShortcut.register('CmdOrCtrl+P', () => {
      if (win) {
        win.send('screenshot');
      }
    });
  }
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


app.on('activate', () => {
  if (win === null) {
    createWindowApp();
  }
});

ipcMain.on('saveImage', (event, file) => {
  win.send('saveImage', file);
});

ipcMain.on('updateFilesList', () => {
  win.send('updateFilesList');
});