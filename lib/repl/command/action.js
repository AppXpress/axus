const STANDARD_EXTRA = 'Try passing --help to the command for more information';
const {
  isString
} = require('../../type/js-type-checker');

const after = (iface, fn, decoration) => (...args) => {
  try {
    const result = fn(...args);
    decoration(...args);
    return result;
  } catch (e) {
    handleReason(iface, e);
    iface.displayPrompt();
  }
};

const promisePrompt = (iface) => (...args) => new Promise((resolve) => {
  iface.displayPrompt();
  resolve(...args);
});

const handleReason = (iface, reason) => {
  if (isString(reason)) {
    iface.output.write(reason + '\n');
  } else {
    iface.output.write(`Error occurred when performing action.\n`);
    iface.output.write(reason.stack + '\n');
  }
};

class ActionMaker {

  constructor(iface) {
    this.iface = iface;
  }

  makeAction(actionFn) {
    return after(this.iface, actionFn, () => this.iface.displayPrompt());
  }

  noOp() {
    return () => {
      this.iface.output.write('\n');
      this.iface.displayPrompt();
    };
  }

  makePromisedAction({firstStep, rest}) {
    return () => {
      let p = firstStep();
      for (let step of rest) {
        p = p.then(step);
      }
      p.then(promisePrompt(this.iface));
      p.catch((err) => {
        handleReason(iface, err);
        this.iface.displayPrompt();
      });
      return p;
    };
  }

  makeUsage(defaultHelp) {
    return (extraHelp) => {
      let msg = extraHelp || STANDARD_EXTRA;
      if (defaultHelp) {
        msg += ('\n\n' + defaultHelp);
      }
      this.iface.output.write(msg);
      this.iface.displayPrompt();
    };
  }
}

exports.createActionMaker = (iface) => new ActionMaker(iface);
