import React from 'react';

const { remote, ipcRenderer } = window.require('electron');
const {Menu} = remote;

export default function FileList({files}) {

  function onItemContextMenu(path) {
    const template = [{
      label: 'Abrir',
      click: () => ipcRenderer.send('openFile', path),
    }, {
      label: 'Copiar',
      click: () => ipcRenderer.send('copyImage', path),
    }, {
      label: 'Deletar',
      click: () => ipcRenderer.send('deleteFile', path),
    }];
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  }

  return (
    <ul id="file-list">
      {files.map((img, i) => (
        <li
          key={i}
          className="file-list-item"
          onContextMenu={() => onItemContextMenu(img.path)}
        >
          <img
            className="file-picture"
            src={img.src}
            alt={img.name}
          />
          <h1 className="file-name">{img.name}</h1>
        </li>
      ))}
    </ul>
  );
}
