const HelpRegistrar = require('../help/help-registrar');
const HelpFormatter = require('../help/help-formatter');
const HELP = `display AppXpress help documentation`;

const parser = require('yargs')
    .option('ls', {
        alias: 'list',
        nargs: 0
    })
    .exitProcess(false);

const HelpCommand = (server) => {
    return {
        help: HELP,
        action: function(argv) {
            const args = parseArgs(argv);
            if (args.ls) {
              HelpFormatter.listEntries();
            } else {
              if(args._.length > 1 || !args._.length) {
                console.log('Please specify one, and only one arugment to display the help for');
              } else {
                HelpFormatter.displayEntry(args._[0]);
              }
            }
            this.displayPrompt();
        }
    };
};

function parseArgs(argv) {
    return parser.parse(argv);
}

module.exports = HelpCommand;