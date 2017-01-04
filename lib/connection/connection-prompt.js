const ConnectionParamValidator = require('./validate');
const Streams = require('../stream/streams');
const ping = require('./ping');
const readline = require('readline');
const Spinner = require('cli-spinner').Spinner;

/**
 * ConnectionPrompt requires an Interface (as defined by node/readline).
 *
 * This allows the class to leverage a running repl's interface, or create
 * a new one to use on the fly (i.e. before REPL start up).
 *
 */
class ConnectionPrompt {

    static newPrompt(outstream) {
        return new ConnectionPrompt(Streams.getMutableInterface(outstream));
    }

    constructor(iface) {
        this.iface = iface;
        this._askName = askName.bind(this);
        this._askPassword = askPass.bind(this);
        this._askDataKey = askDataKey.bind(this);
        this._askEnv = askEnv.bind(this);
    }

    close() {
        this.iface.close();
    }

    prompt() {
        throw new TypeError('Unimplemented by parent');
    }

    completeProfile(connectionProfiles) {
        let p = Promise.resolve(connectionProfiles.current);
        const required = getMissingAttributes(connectionProfiles.current);
        for (let requirement of required) {
            const nextQuestion = attributeToPrompt[requirement].bind(this);
            p = p.then(nextQuestion);
        }
        const {showSpinner, stopSpinner} = getSpinnerControls(this.iface);
        return p
            .then(showSpinner)
            .then(ping.pingWithProfile)
            .then(stopSpinner)
            .then((fulfilledProfile) => {
                return new Promise((resolve) => {
                    connectionProfiles.current = fulfilledProfile;
                    resolve(connectionProfiles);
                });
            }).catch((reason) => {
              stopSpinner();
              throw reason;
            });
    }

}

function getMissingAttributes(profile) {
  const required = ConnectionParamValidator
      .getMissingAttributes(profile);
  if(required.indexOf('password') === -1) {
    required.push('password');
  }
  return required;
}

function ifaceHasMutableOutStream(iface) {
    return Streams.interfaceIsMutable(iface);
}

function askName(params) {
    params = params || {};
    return new Promise((resolve) => {
        this.iface.question('Username: ', (uname) => {
            params.username = uname;
            resolve(params);
        });
    });
}

function askPass(params) {
    return new Promise((resolve) => {
        const prompt = 'Password: ';
        this.iface.question(prompt, (pass) => {
            params.password = pass;
            this.iface.output.unmute();
            resolve(params);
        });
        this.iface.output.mute(prompt);
    });
}

function askDataKey(params) {
    return new Promise((resolve) => {
        this.iface.question('DataKey: ', (key) => {
            params.dataKey = key;
            resolve(params);
        });
    });
}

function askEnv(params) {
    return new Promise((resolve) => {
        this.iface.question('URL: ', (url) => {
            params.url = url;
            resolve(params);
        });
    });
}

function getSpinnerControls(iface) {
  const spinner = new Spinner({
      text: 'Authenticating.. %s',
      stream: iface.output
  });
  const showSpinner = passThrough(() => spinner.start());
  const stopSpinner = passThrough(() => spinner.stop());
  return {showSpinner, stopSpinner};
}

const passThrough = (action) => (passOn) =>
  new Promise((resolve, reject) => {
    action();
    resolve(passOn);
  });

//TODO: question deserves a similar framework to passThrough

/**
 * Attribute to prompt mapping.
 */
const attributeToPrompt = {
    url: askEnv,
    password: askPass,
    dataKey: askDataKey,
    username: askName
};

module.exports = ConnectionPrompt;
