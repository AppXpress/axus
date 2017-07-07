const FileUtils = require('../../file/utils');
const fs = require('fs');
const ImportScanner = require('./import-scanner');
const path = require('path');

const libNormalizationFn = (libRoot) => (entryPath) => {
  return path.resolve(libRoot, entryPath);
};

class LibraryImporter {

    constructor(libRoot) {
      this.libRoot = libRoot;
    }

    getImportedScripts(scripts) {
      const imports = ImportScanner.scan(scripts);
      if(!imports.length) {
        return [];
      }
      if(!FileUtils.directoryExists(this.libRoot)) {
        throw new Error(`Library path does not exist: ${this.libRoot}
        The following script(s) could not be imported: ${imports}`);
      }
      const fullyQualifiedPaths = imports.map(libNormalizationFn(this.libRoot));
      const badImports = fullyQualifiedPaths.filter(FileUtils.fileExists);
      if(badImports.length) {
        throw new Error(`Could not resolve imports: ${badImports}\nAre you sure ${this.libRoot} is a valid path?`);
      }
      return fullyQualifiedPaths
              .map((anImport) => {
                    return fs.readFileSync(anImport, 'utf-8');
              });
    }

}

module.exports = LibraryImporter;
