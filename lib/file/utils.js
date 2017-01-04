const fs = require('fs');
const home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const path = require('path');

function expand(p) {
    if (!p) {
        return p;
    }
    if (p === '~') {
        return home;
    }
    if (p.substr(0, 2) !== '~/') {
        return p;
    }
    return path.join(home, p.substr(2));
}

function fileExists(path) {
    return fs.existsSync(path) && !fs.lstatSync(path).isDirectory();
}

function directoryExists(path) {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

function getJSONFileAsPOJO(pathToJSON) {
  pathToJSON = expand(pathToJSON);
  if (fileExists(pathToJSON)) {
    return new Promise((resolve, reject) => {
      fs.readFile(pathToJSON, 'utf-8', (err, data) => {
        if(err) {
          reject(err);
          return;
        }
        resolve(JSON.parse(data));
      });
    });
  }
  return Promise.reject();
}

function getJSONFileAsPOJOSync(pathToJSON) {
  pathToJSON = expand(pathToJSON);
  if (fileExists(pathToJSON)) {
      return JSON.parse(fs.readFileSync(pathToJSON));
  }
}

exports.expand = expand;
exports.fileExists = fileExists;
exports.directoryExists = directoryExists;
exports.getJSONFileAsPOJO = getJSONFileAsPOJO;
