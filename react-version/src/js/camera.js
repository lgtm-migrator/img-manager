import fs from 'fs';
import {remote, ipcRenderer, desktopCapturer} from 'electron';
import fileManager from './fileManager';
import fileManagerTemplate from './fileManagerTemplate';

const {BrowserWindow} = remote;

let cameraWindow = null;
let video = null;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 480;

let camera = {
  open() {
    if (!cameraWindow) {
      cameraWindow = new BrowserWindow({
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
      const url = 'file://' + __dirname + '/../camera.html';
      console.log(url);
      cameraWindow.loadURL(url);
      cameraWindow.on('closed', () => cameraWindow = null);
    }
  },
  close() {
    remote.getCurrentWindow().close();
  },
  start() {
    video = document.querySelector('#camera-video');
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
			navigator.mediaDevices.getUserMedia({video: true})
				.then((stream) => {
					video.srcObject = stream;
					video.play();
				});
		}
  },
  snapshot(videoSource = video) {
    if (videoSource.srcObject) {
      ctx.drawImage(videoSource, 0, 0);
      const img = canvas.toDataURL();
      ipcRenderer.send('saveImage', img);
    }
  },
  saveImage(event, img) {
    const data = img.replace(/^data:image\/\w+;base64,/, '');
    const buffer = new Buffer(data, 'base64');
    const name = new Date().getTime().toString();
    const path = fileManager.folders.current + '/' + name + '.png';
    fs.writeFile(path, buffer, err => {
      if (err) {
        console.error(err);
      } else {
        //newFileNotification
        ipcRenderer.send('updateFilesList');
        var notification = new Notification('Image Manager', {
          body: 'Foto capturada com sucesso',
          icon: path,
        });
        notification.onclick = () => {
          fileManagerTemplate.openImage(path);
        }
      }
    });
  },
  screenshot() {
    desktopCapturer.getSources({types: ['screen']}).then(sources => {
        navigator.webkitGetUserMedia({
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[0].id,
                minWidth: 800,
                maxWidth: 1280,
                minHeight: 600,
                maxHeight: 720
              },
            },
          },
          stream => {
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.play();
            setTimeout(() => {
              camera.snapshot(videoElement);
              stream.getTracks()[0].stop();
            }, 300);
          }, console.error);
    });
  }
};

ipcRenderer.on('screenshot', camera.screenshot);
ipcRenderer.on('saveImage', camera.saveImage);

module.exports = camera;