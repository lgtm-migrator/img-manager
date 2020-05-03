const fs = require('fs');
const path = require('path');

//TODO receber o diretório do main
const homeDirectory = '/home/rafael/electron';

function listDirectory(path = homeDirectory, requiredType = 'directories') {
  function statType(err, stat) {
    if (err) {
      console.error(err);
    } else if (stat) {
      if (stat.isDirectory()) {
        return 'directories';
      } else if (stat.isFile()) {
        return 'files';
      }
    }
    return null;
  }

  const list = {
    files: [],
    directories: [],
  };
  const addToList = ({index, value}) => list[index].push(value);

  function createAddToListPromise(fileName) {
    return new Promise(resolve => {
      const filePath = path + '/' + fileName;
      fs.stat(filePath, (err, stat) => {
        const index = statType(err, stat);
        if (index) {
          resolve({index, value: fileName});
        }
      });
    });
  }
  return new Promise(resolve => {
    fs.readdir(path, (err, files) => {
      if (err) {
        console.error(err);
      }
      else if (files) {
        const promises = files
          .filter(file => !file.startsWith('.'))
          .map(fileName => 
            createAddToListPromise(fileName).then(addToList)
          );
        Promise.all(promises).then(() => resolve(list[requiredType]));
      }
    });
  });
}

const fileManager = {
  files: {
    current: '',
    list(dir = fileManager.folders.current) {
      const files = listDirectory(dir, 'files');
      return files;
    },
    listImage() {
      const imgs = fileManager.files.list().then(fileNames =>
        fileNames.filter(fileName => 
          fileName.endsWith('jpg') ||
          fileName.endsWith('jpeg') ||
          fileName.endsWith('png') ||
          fileName.endsWith('gif') ||
          fileName.endsWith('bmp')
        )
      );
      return imgs;
    },
    getFullPath(fileList = [], directory = fileManager.folders.current) {
      return fileList.map(file => path.resolve(directory, file));
    }
  },
  folders: {
    current: homeDirectory,
    select(directory = '', isAbsolute = false) {
      fileManager.folders.current = isAbsolute ?
        path.resolve(directory) :
        path.resolve(fileManager.folders.current, directory);
      return fileManager.folders.current;
    },
    upDirectory() {
      fileManager.folders.current = path.resolve(fileManager.folders.current, '..');
      return fileManager.folders.current;
    },
    list(dir = fileManager.folders.current) {
      return listDirectory(dir);
    },
    listBreadcrumbs(dir = fileManager.folders.current) {
      const folders = dir.split(path.sep);
      const breadcrumbs = [];
      for (let index = 0; index < folders.length; index++) {
        breadcrumbs.push({
          name: folders[index],
          path: folders.slice(0, index+1).join(path.sep),
        });
      }
      return breadcrumbs.slice(-4);
    },
  },
};

module.exports = fileManager;