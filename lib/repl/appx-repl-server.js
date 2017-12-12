const chalk = require('chalk');
const ConnectionParams = require('../connection/connection-params');
const ModuleBuilder = require('../module/module-builder');
const Commands = require('./command/commands');
const HelpRegistrar = require('./help/help-registrar');
const Streams = require('../stream/streams');
const repl = require('repl');
const ReplEval = require('./repl-eval');
const sync = require('synchronize');

const preamble = chalk.yellow(`
axus /ˈaksəs/
noun.
  1. a REPL for the AppXpress API.
  2. a unit test harness for AppXpress Modules.

developer.gtnexus.com`);

const prompt = chalk.green('appx > ');

module.exports = class AppXReplServer {

  static startNew() {
    const serv = new AppXReplServer();
    serv.start();
    return serv;
  }

  constructor() {
    this.bridge = null;
    this.connectionProfiles = null;
    this.isStarted = null;
    this.out = Streams.getMutableStream();
    this.registerStandardCommands = Commands
      .registerStandardCommands
      .bind(this);
    this.replServer = null;
    this.scope = {};
  }

  addScope(scope) {
    if (keysClash.call(this, scope)) {
      throw new Error('New scope clashes');
    }
    return this.putScope(scope);
  }

  putAppXScope(scope, digests) {
    this.putScope(scope);
    digests.forEach((digest) => {
      this.bridge.addModuleDigest(digest);
    });
  }

  putScope(scope) {
    Object.assign(this.scope, scope);
    if (this.isStarted) {
      this.injectContext();
    }
    return this;
  }

  start() {
    HelpRegistrar.processDeferrals();
    this.out.write(preamble);
    if (!this.connectionParams) {
      getConnectionParams.call(this);
    } else {
      this._start();
    }
  }

  _start() {
    const connectionParams = this.connectionProfiles.current.toConnectionParams();
    const appxContext = new ModuleBuilder()
      .useRest(connectionParams)
      .build();
    this.bridge = appxContext.createBridge();
    const {
      sandbox
    } = appxContext.produceRunTime();
    this.putScope(sandbox);
    this.replServer = repl.start({
      prompt: prompt,
      eval: makeEval(this),
      output: this.out,
      input: process.stdin
    });
    this.isStarted = true;
    this.registerStandardCommands();
    this.injectContext();
  }

  injectContext() {
    if (!this.isStarted) {
      throw new Error('Cannot inject context to repl until repl is started');
    }
    if (Object.keys(this.scope)) {
      mergeUniqueRight(this.scope, entries, this.replServer.context);
    }
    this.replServer.context.sync = sync;
    return this;
  }

  mute(newPrompt) {
    if (newPrompt) {
      this.out._prompt = newPrompt;
    }
    this.out.mute();
  }

  unmute() {
    this.out.unmute();
  }

  getReplContext() {
    return this.replServer.context;
  }

  getFromContext(name) {
    return this.replServer.context[name];
  }

  updateCredentials() {
    if (!this.isStarted) {
      throw new Error('Must start repl before changing credentials');
    }
    const newParams = this.connectionProfiles.current.toConnectionParams();
    this.bridge.changeCredentials(newParams);
  }

  write(str) {
    if (!str.endsWith('\n')) {
      str += '\n';
    }
    this.out.write(str);
  }

  writeErr(str) {
    return this.write(chalk.red(str));
  }

};

function getConnectionParams() {
  ConnectionParams
    .load(this.out)
    .then((connectionProfiles) => {
      const current = connectionProfiles.current;
      if (!current) {
        throw new Error('No profile was selected');
      }
      this.connectionProfiles = connectionProfiles;
      this._start();
    }).catch((err) => {
      this.write('Error when getting credentials.');
      this.write(err.stack || err);
      getConnectionParams.call(this);
    });
}

function keysClash(...scopes) {
  if (!scopes.length) {
    return false;
  }
  if (scopes.length === 1) {
    scopes.push(this.scope);
  } else if (scopes.length > 2) {
    throw new Error('Only two scopes may be compared');
  }
  return some(entries(scopes[0]), entry => {
    [key, value] = entry;
    return scopes[1][key];
  });
}

function makeEval(options) {
  return ReplEval.createEval(options);
}

function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}

function mergeUniqueRight(source, keyFn, destination) {
  for (let [k, v] of keyFn(source)) {
    destination[k] = source[k];
  }
}

function some(generator, predicate) {
  for (let k of generator) {
    if (predicate(k)) {
      return true;
    }
  }
  return false;
}
