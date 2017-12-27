const Action = require('./action');
const HelpRegistrar = require('../help/help-registrar');
const HelpFormatter = require('../help/help-formatter');

const HELP = `display AppXpress help documentation`;
const LONG_HELP = `.h can ${HELP}`;

const BAD_ARGS = 'Please specify one, and only one arugment to display the help for';

const parser = require('yargs/yargs')(process.argv.slice(2))
  .option('ls', {
    alias: 'list',
    nargs: 0
  })
  .exitProcess(false);

const HelpCommand = (server) => {

  const listHelpEntries = () => HelpRegistrar.prepareEntriesList()
    .forEach(server.write.bind(server));

  const displayHelpEntry = (entry) => server.write(HelpRegistrar.getEntryDisplay(entry));

  return {
    help: HELP,
    action: function(args) {
      const actionMaker = Action.createActionMaker(this);
      const doListHelpEntries = actionMaker.makeAction(listHelpEntries),
        doDisplayHelpEntry = actionMaker.makeAction(displayHelpEntry),
        doShowUsage = actionMaker.makeUsage(LONG_HELP);
      parser.parse(args, (err, argv, output) => {
        if (argv.ls) {
          doListHelpEntries();
        } else {
          if (argv._.length > 1 || !argv._.length) {
            doShowUsage(BAD_ARGS);
          } else {
            doDisplayHelpEntry(argv._[0]);
          }
        }
      });
    }
  };
};

module.exports = HelpCommand;
