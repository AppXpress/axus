const FileUtil = require('../../file/utils');

const STANDARD_HOME = '~/.appxpress/connection-profiles.json';

function findProfileFile(path = STANDARD_HOME) {
  const fullPath = FileUtil.expand(path);
  return FileUtil.fileExists(fullPath) ? fullPath : undefined;
}

exports.findProfileFile = findProfileFile;
exports.STANDARD_HOME = STANDARD_HOME;
