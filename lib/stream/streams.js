const MuteStream = require('mute-stream');
const readline = require('readline');

function getMutableStream(stream, options = {replace: '*', prompt: 'Password: '}) {
  stream = stream || process.stdout;
  if(stream.mute && stream.unmute) {
    //incase we are given an already mutable stream.
    return stream;
  }
  const m = new MuteStream(options);
  m.pipe(stream);
  return m;
}

function getMutableInterface(outstream, instream = process.stdin) {
  return readline.createInterface({
    output: getMutableStream(outstream),
    input: instream
  });
}

function interfaceIsMutable(iface) {
    return iface.output.mute && iface.output.unmute;
}

exports = {
  getMutableStream : getMutableStream,
  getMutableInterface : getMutableInterface,
  interfaceIsMutable : interfaceIsMutable
};
