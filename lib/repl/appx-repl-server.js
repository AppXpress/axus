const chalk = require('chalk');
const ConnectionsParams = require('../connection/connection-params');
const ConnectionPrompt = require('../connection/connection-prompt');
const ContextBuilder = require('../context/context-builder');
const Commands = require('./command/commands');
const HelpRegistrar = require('./help/help-registrar');
const Streams = require('../stream/streams');
const repl = require('repl');
const ReplEval = require('./repl-eval');
//const sync = require('synchronize');

const preamble = chalk.yellow(
    `axus /ˈaksəs/
noun.
  1. a REPL for the AppXpress API.
  2. a unit test harness for AppXpress Modules.

developer.gtnexus.com
`);

const prompt = chalk.green('appx > ');

module.exports = class AppXReplServer {

    static startNew() {
      const serv = new AppXReplServer();
      serv.start();
      return serv;
    }

    constructor() {
        this.appxContext = undefined;
        this.bridge = undefined;
        this.replServer = undefined;
        this.connectionParams = undefined;
        this.scope = {};
        this.isStarted = false;
        this.out = Streams.getMutableStream();
        this.registerStandardCommands = Commands
            .registerStandardCommands
            .bind(this);
    }

    useDefaultConfig() {
        this.connectionParams = ConnectionsParams.readConfig();
        return this;
    } 

    addScope(scope) {
        if (keysClash.call(this, scope)) {
            throw new Error('New scope clashes');
        }
        return this.putScope(scope);
    }

    putAppXScope(scope, digests) {
        this.putScope(scope);
        //TODO:push digests onto bridge.
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
        console.log(preamble);
        if (!this.connectionParams) {
            getConnectionParams.call(this);
        } else {
            this._start();
        }
    }

    _start() {
        const appxContext = new ContextBuilder()
            .useRest(this.connectionParams)
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

    updateCredentials(newCredentials) {
        if (!this.isStarted) {
            throw new Error('Must start repl before changing credentials');
        }
        this.connectionParams = newCredentials;
        this.bridge.changeCredentials(newCredentials);
    }

};

function getConnectionParams() {
    // this.useDefaultConfig();
    // this._start();
    ConnectionPrompt
        .newPrompt(this.out)
        .closeInterfaceOnCompletion()
        .prompt()
        .then((params) => {
            this.connectionParams = params; //TODO: validate.
            this._start();
        }).catch((err) => {
            console.log('Error when getting credentials.');
            console.log(err.stack);
            process.exit();
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
