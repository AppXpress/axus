const ConnectionManagerCommand = require('./connection-manager-command');
const HelpCommand = require('./help-command');
const LoadModuleCommand = require('./load-module-command');
const WriteVariableCommand = require('./write-variable-command');

const cmds = {
    'loadModule': LoadModuleCommand,
    'writeVariable': WriteVariableCommand,
    'connection': ConnectionManagerCommand,
    'h': HelpCommand
};

const appxCommandKeys = Object.keys(cmds);

exports.registerStandardCommands = function registerStandardCommands() {
    appxCommandKeys.forEach((cmd) => {
        this.replServer.defineCommand(cmd, cmds[cmd](this));
    });
    this.replServer.defineCommand('help', HelpReplacement(this));
};


/**
 * Replacement of node's REPL help command.
 * • Better visibility to custom and built in commands.
 * • Not to be confused with the .h command.
 *
 */
const HelpReplacement = (server) => {

    return {
        help: 'Print this help message',
        action: function() {
            const names = Object.keys(this.commands);
            const longestNameLength = names.reduce(
                (max, name) => Math.max(max, name.length),
                0
            );
            const groups = groupCommands(names);
            const writeEntry = (name) => {
                const cmd = this.commands[name];
                const spaces = ' '.repeat(longestNameLength - name.length + 3);
                const line = '.' + name + (cmd.help ? spaces + cmd.help : '') + '\n';
                this.outputStream.write(line);
            };
            this.outputStream.write('\nCore Commands\n');
            groups.core.sort().forEach(writeEntry);
            this.outputStream.write('\nAppXpress Commands\n');
            groups.appx.sort().forEach(writeEntry);
            this.displayPrompt();
        }
    };
};

const groupCommands = (cmds) => {
    return cmds.reduce((acc, next) => {
        if (isAppXCommandKey(next)) {
            acc.appx.push(next);
        } else {
            acc.core.push(next);
        }
        return acc;
    }, {
        core: [],
        appx: []
    });
};

const isAppXCommandKey = (cmdName) => {
    return appxCommandKeys.indexOf(cmdName) > -1;
};
