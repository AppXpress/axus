const Action = require('./action');
const fs = require('fs');
const path = require('path');
const FileUtils = require('../../file/utils');

const HELP = `writes a JSON representation of a variable to disk`;
const LONG_HELP = `.writeVariable ${HELP}`;

const parser = require('yargs/yargs')(process.argv.slice(2))
    .example('.writeVariable foo --path ~/Desktop/foo.json',
        'Writes the stringified version of foo to a file named foo on your desktop.')
    .option('p', {
        alias: 'path',
        nargs: 1,
        default: '/Users/jdonovan1/Desktop/',
        description: 'Specifies the path to write the variable to'
    })
    .exitProcess(false)
    .help();

const circular = /^Converting circular structure to JSON/;

function parseArgs(argv) {
    const parsed = parser.parse(argv);
    if (parsed.help) {
        return parsed;
    }
    const vars = parsed._;
    if (!vars.length || vars.length > 1) {
        parsed.error = `Please specify one variable to write at a time`;
        return parsed;
    }
    parsed.variable = vars[0];
    parsed.targetPath = parsed.path;
    return parsed;
}

const WriteVariable = (server) => {

    const varNotFound = (variable) =>
        `Failed to find ${variable} in this context. Are you sure you spelled it correctly?`;

    const targetPathNotExist = (path) =>
        `The target path ${path} does not exist`;

    const getVar = (variableName, targetPath) => () =>
        new Promise((resolve, reject) => {
            const variableVal = server.getFromContext(variableName);
            if (!variableVal) {
                reject(varNotFound(variableName));
                return;
            }
            resolve({variableName, variableVal, targetPath});
        });

    const stringifyVar = ({variableName, variableVal, targetPath}) =>
        new Promise((resolve, reject) => {
            try {
                const json = JSON.stringify(variableVal, null, 4);
                resolve({variableName, json, targetPath});
            } catch (err) {
                if (circular.test(err)) {
                    reject('Circular references detected.  write JSON to file.');
                } else {
                    reject(err);
                }
            }
        });

    const expandAndCheckPath = ({variableName, json, targetPath}) =>
        new Promise((resolve, reject) => {
            const newTarget = FileUtils.expand(targetPath);
            let fullPath = newTarget;
            if (FileUtils.directoryExists(newTarget)) {
                fullPath = path.join(newTarget, `${name}.json`);
                resolve({json, fullPath});
            } else {
                const parentPath = path.resolve(newTarget, '..');
                if (FileUtils.directoryExists(parentPath)) {
                    resolve({json, fullPath});
                } else {
                    reject(targetPathNotExist(parentPath));
                }
            }
        });

    const write = ({json, fullPath}) =>
        new Promise((resolve, reject) => {
            fs.writeFile(fullPath, json, 'utf-8', (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });

    return {
        help: HELP,
        action: function(argv) {
            this.lineParser.reset();
            this.bufferedCommand = '';
            const actionMaker = Action.createActionMaker(this);
            const args = parseArgs(argv);
            const noOp = actionMaker.noOp(),
                doShowUsage = actionMaker.makeUsage(LONG_HELP);
            if (args.help) {
                noOp();
                return;
            }
            const {
                error,
                variable,
                targetPath
            } = args;
            if (error) {
                doShowUsage(error);
                return;
            }
            const doWriteVariable = actionMaker.makePromisedAction({
                firstStep: getVar(variable, targetPath),
                rest: [
                    stringifyVar,
                    expandAndCheckPath,
                    write
                ]
            });
            doWriteVariable();
        }
    };
};

module.exports = WriteVariable;
