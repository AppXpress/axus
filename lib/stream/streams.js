const MuteStream = require('mute-stream');
const readline = require('readline');

function getMutableStream(stream) {
  stream = stream || process.stdout;
  if(stream.mute && stream.unmute) {
    return stream; //incase we are given an already mutable stream.
  }
  const m = new MuteStream({replace: '*'});
  m.pipe(stream /*, {end: false}*/);
  return m;
}


function getMutableInterface(outstream, instream = process.stdin) {
  const out = getMutableStream(outstream);
  return readline.createInterface({
    input: instream,
    output: out
  });
}

function interfaceIsMutable(iface) {
    return iface.output.mute && iface.output.unmute;
}

exports.getMutableStream = getMutableStream;
exports.getMutableInterface = getMutableInterface;
exports.interfaceIsMutable = interfaceIsMutable;
