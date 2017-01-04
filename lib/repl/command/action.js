const STANDARD_EXTRA = 'Try passing --help to the command for more information';
const {
    isString
} = require('../../type/js-type-checker');

const after = (fn, decoration) => (...args) => {
    const result = fn(...args);
    decoration(...args);
    return result;
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

exports.createActionMaker = (iface) => ({

    makeAction: (actionFn) => after(actionFn, () => iface.displayPrompt()),

    makePromisedAction: ({
        firstStep,
        rest
    }) => () => {
        let p = firstStep();
        for (let step of rest) {
            p = p.then(step);
        }
        p.then(promisePrompt(iface));
        p.catch((err) => {
            handleReason(iface, err);
            iface.displayPrompt();
        });
        return p;
    },

    noOp: () => () => iface.displayPrompt(),

    makeUsage: (defaultHelp) => (extraHelp) => {
        let msg = extraHelp || STANDARD_EXTRA;
        if (defaultHelp) {
            msg += ('\n\n' + defaultHelp);
        }
        iface.output.write(msg);
        iface.displayPrompt();
    }

});
