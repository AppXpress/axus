const fs = require('fs');
const root = require('app-root-path').toString();

function legacyFind() {
  const contents = fs.readdirSync(root);
  return contents.find((f) => {
      return f === 'appx.json';
  });
}

exports.findConfig = function findConfig() {
  const conf = legacyFind();
  if (!conf) {
      throw new Error('Could not find appx.json file. ' +
          'Please check your project root.');
  }
  return conf;
};

exports.parseConfig = function parseConfig(f) {
    try {
        return JSON.parse(fs.readFileSync(f));
    } catch (err) {
        // console.log('Failed to read json!');
        throw err;
    }
};
