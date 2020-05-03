const fs = require('fs');
const path = require('path');
const { nativeImage } = require('electron');

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

function load(path) {
  function createAddToListPromise(fileName) {
    return new Promise(resolve => {
      const filePath = path + '/' + fileName;
      fs.stat(filePath, (err, stat) => {
        const index = statType(err, stat);
        if (index) {
          const result = {index, value: fileName};
          resolve(result);
        }
      });
    });
  }
  
  const list = {
    files: [],
    directories: [],
  };
  const addToList = ({index, value}) => list[index].push(value);
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
        Promise.all(promises).then(() => resolve(list));
      }
    });
  });
}

const sep = path.sep;

function listBreadcrumbs(path) {
  const folders = path.split(sep);
  const breadcrumbs = [];
  for (let index = 0; index < folders.length; index++) {
    breadcrumbs.push({
      name: folders[index],
      path: folders.slice(0, index+1).join(sep),
    });
  }
  return breadcrumbs.slice(-4);
}

function readFile(path) {
  const img = nativeImage.createFromPath(path.replace(/\\/g, '/'));
  return img.toDataURL()
}

const directoryReader = {
  async load(path) {
    const list = await load(path);
    return {
      files: {
        list: list.files,
        listImage: list.files
          .filter(fileName => 
              fileName.endsWith('jpg') ||
              fileName.endsWith('jpeg') ||
              fileName.endsWith('png') ||
              fileName.endsWith('gif') ||
              fileName.endsWith('bmp')
          ).map(fileName => ({
            name: fileName,
            path: path + sep + fileName,
            src: readFile(path + sep + fileName),
          })),
      },
      folders: {
        current: path,
        list: list.directories,
        listBreadcrumbs: listBreadcrumbs(path),
      },
      pathSeparator: sep,
    };
  }
};

module.exports = directoryReader;