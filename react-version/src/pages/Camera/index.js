import React, {useRef, useCallback, useEffect} from 'react';

const {ipcRenderer} = window.require('electron');

function Camera() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 480;
  const videoComp = useRef(null);
  const start = useCallback(() => {
    if (videoComp.current && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
				.then((stream) => {
					videoComp.current.srcObject = stream;
					videoComp.current.play();
				});
    }
  }, []);

  useEffect(start, []);

  function snapshot() {
    if (videoComp.current.srcObject) {
      ctx.drawImage(videoComp.current, 0, 0);
      const img = canvas.toDataURL();
      ipcRenderer.send('saveImage', img);
    }
  }

  function close() {
    ipcRenderer.send('closeCamera');
  }

  return (
    <div className="Camera">
      <video id="camera-video" ref={videoComp} width="640" height="480"></video>
      <div className="camera-buttons">
        <button className="camera-button" onClick={snapshot}>
          Tirar foto
        </button>
        <button className="camera-button" onClick={close}>
          Fechar
        </button>
      </div>
    </div>
  );
}

export default Camera;