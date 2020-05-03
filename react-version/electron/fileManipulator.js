const {shell, nativeImage, clipboard, ipcMain, globalShortcut} = require('electron');
const fs = require('fs');

function saveImage(img, path, refreshFunction) {
  const data = img.replace(/^data:image\/\w+;base64,/, '');
  const buffer = new Buffer(data, 'base64');
  fs.writeFile(path, buffer, err => {
    if (err) {
      console.error(err);
    } else {
      //newFileNotification
      refreshFunction();
      var notification = new Notification('Image Manager', {
        body: 'Imagem salva com sucesso',
        icon: path,
      });
      notification.onclick = () => {
        fileManagerTemplate.openImage(path);
      }
    }
  });
}

const FileManipulator = {
  instance(refreshFunction) {
    ipcMain.on('openFile', (event, path) => {
      shell.openItem(path.replace(/\\/g, '/'));
    });
    
    ipcMain.on('copyImage', (event, path) => {
      const img = nativeImage.createFromPath(path.replace(/\\/g, '/'));
      clipboard.writeImage(img);
    });
    
    ipcMain.on('deleteFile', (event, path) => {
      shell.moveItemToTrash(path.replace(/\\/g, '/'));
      refreshFunction();
    });
    
    ipcMain.on('saveImage', (event, img) => {
      const name = new Date().getTime().toString();
      //TODO const path = fileManager.folders.current + '/' + name + '.png';
      //saveImage(img, path, refreshFunction);
      console.log('Not yet implemented');
    });
  }
};

module.exports = FileManipulator;