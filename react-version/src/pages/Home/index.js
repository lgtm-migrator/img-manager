import React, {useState, useEffect} from 'react';

import CameraButton from '../../components/CameraButton';
import BreadcrumbList from '../../components/BreadcrumbList';
import FolderList from '../../components/FolderList';
import FileList from '../../components/FileList';

const {ipcRenderer} = window.require('electron');

function Home() {
  const [fileManager, setFileManager] = useState({
    files: {
      listImage: [],
    },
    folders: {
      listBreadcrumbs: [],
      list: [],
      current: '',
    },
    pathSeparator: '/',
  });

  function selectFolder(folderPath, isAbsolute=false) {
    if (!isAbsolute) {
      folderPath = fileManager.folders.current +
                  fileManager.pathSeparator + folderPath;
    }
    ipcRenderer.send('selectDir', folderPath);
  }

  useEffect(() => {
    ipcRenderer.on('changeFiles', (event, fileManagerInfo) =>
      setFileManager(fileManagerInfo)
    );
    ipcRenderer.send('requireFileInfo');
  }, []);

  return (
    <div className="Home">
      <CameraButton />
      <hr />
      
      <BreadcrumbList
        breadcrumbs={fileManager.folders.listBreadcrumbs}
        selectFolder={selectFolder}
      />
      <hr />
      <FolderList
        folders={fileManager.folders.list}
        selectFolder={selectFolder}
      />
      <hr />
      <FileList
        files={fileManager.files.listImage}
      />
    </div>
  );
}

export default Home;
