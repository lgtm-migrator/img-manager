const path = require('path');
const {shell, remote, clipboard, nativeImage, ipcRenderer} = require('electron');
const {Menu} = remote;
const fileManager = require('./fileManager');

const breadcrumbListElement = document.querySelector('#breadcrumb-list');
const foldersListElement = document.querySelector('#folder-list');
const fileListElement = document.querySelector('#file-list');

const fileManagerTemplate = {
  init() {
    fileManagerTemplate.startStructure();
  },
  startStructure() {
    fileManagerTemplate.breadcrumbList().then(template => breadcrumbListElement.innerHTML = template);
    fileManagerTemplate.foldersList().then(template => foldersListElement.innerHTML = template);
    fileManagerTemplate.imageList().then(template => fileListElement.innerHTML = template);
  },
  foldersList() {
    return new Promise((resolve) => {
      const folders = fileManager.folders.list();
      folders.then(result => {
        const template = result
          .map(folder => `
            <li class="folder-list-item" onclick="App.fileManagerTemplate.selectFolder('${folder}')">
              <h1 class="folder-name">${folder}</h1>
            </li>
          `)
          .join('\n');
        resolve(template);
      });
    });
  },
  breadcrumbList() {
    let template = '';
    return new Promise(resolve => {
      fileManager.folders.listBreadcrumbs().forEach(folder => {
        const folderPath = (folder.path + path.sep).replace(/\\/g, '\\\\');
        template += `
          <li class="breadcrumb-list-item" onclick="App.fileManagerTemplate.selectFolder('${folderPath}', true)">
            <h1 class="breadcrumb-name">${folder.name}</h1>
          </li>
        `;
      });
      resolve(template);
    });
  },
  imageList() {
    let template = '';
    return new Promise(resolve => {
      fileManager.files.listImage().then(images => {
        paths = fileManager.files.getFullPath(images).map(path =>
          path.replace(/\\/g, '\\\\')
        );
        images.forEach((image, i) => {
          template += `
            <li class="file-list-item" oncontextmenu="App.fileManagerTemplate.onItemContextMenu('${paths[i]}')">
              <img class="file-picture" style="background-image:url('${paths[i].replace(/\\/g, '/')}')" />
              <h1 class="file-name">${image}</h1>
            </li>
          `;
        });
        resolve(template);
      });
    });
  },
  selectFolder(folderPath, isAbsolute=false) {
    console.log(folderPath);
    fileManager.folders.select(folderPath, isAbsolute);
    fileManagerTemplate.startStructure();
  },
  openImage(path) {
    shell.openItem(path.replace(/\\/g, '/'));
  },
  copyImage(path) {
    const img = nativeImage.createFromPath(path.replace(/\\/g, '/'));
    clipboard.writeImage(img);
  },
  deleteImage(path) {
    shell.moveItemToTrash(path.replace(/\\/g, '/'));
    fileManagerTemplate.startStructure();
  },
  onItemContextMenu(path) {
    const template = [{
      label: 'Abrir',
      click: () => fileManagerTemplate.openImage(path),
    }, {
      label: 'Copiar',
      click: () => fileManagerTemplate.copyImage(path),
    }, {
      label: 'Deletar',
      click: () => fileManagerTemplate.deleteImage(path),
    }];
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  },
};

module.exports = fileManagerTemplate;

ipcRenderer.on('updateFilesList', fileManagerTemplate.startStructure);