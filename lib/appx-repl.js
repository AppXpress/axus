#! /usr/bin/env node
try {
  require('synchronize');
} catch (e) {
  console.log('Sorry, but synchronize is required for REPL');
  console.log('Try running `npm install synchronize`');
  process.exit(1);
}
console.log('pooooo');
require('./repl/appx-repl-server').startNew();
