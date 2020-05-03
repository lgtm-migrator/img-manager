import React from 'react';

const {ipcRenderer} = window.require('electron');

export default function CameraButton() {
  function openCamera() {
    ipcRenderer.send('openCamera');
  }
  return (
    <button onClick={openCamera} className="camera-button">Câmera</button>
  );
}
