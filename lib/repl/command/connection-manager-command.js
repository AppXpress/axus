const Action = require('./action');
const ConnectionParams = require('../../connection/connection-params');
const Profile = require('../../connection/profile/profile');
const ProfileSelectionPrompt = require('../../connection/profile/profile-selection-prompt');

const HELP = `print connection info, change credentials,etc...`;
const LONG_HELP = `.connection can ${HELP}`;

const parser = require('yargs/yargs')(process.argv.slice(2))
  .example('.connection -v', 'Prints the current connection params')
  .example('.connection --switch-profile', 'Select a connection profile')
  .option('v', {
    alias: 'verbose',
    nargs: 0,
    description: 'Print the current connection params'
  })
  .exitProcess(false)
  .help();

const ConnectionManagerCommand = (server) => {

  const changeConnection = (connectionProfiles) => {
    if(connectionProfiles.current !== Profile.Dummy) {
      ConnectionParams.validate(connectionProfiles.current.toConnectionParams());
    }
    server.updateCredentials();
  };

  const showCurrentProfile = () => {
    const current = server.connectionProfiles.current;
    const pretty = JSON.stringify(current, undefined, 4);
    server.write(pretty);
  };

  const switchConnections = (iface) => {
    const {
      connectionProfiles
    } = server;
    const firstStep = () =>
      new ProfileSelectionPrompt(iface)
      .prompt(connectionProfiles);
    return {
      firstStep: firstStep,
      rest: [changeConnection]
    };
  };

  return {
    help: HELP,
    action: function(args) {
      const actionMaker = Action.createActionMaker(this);
      const noOp = actionMaker.noOp(),
        doShowCurrent = actionMaker.makeAction(showCurrentProfile),
        doSwitchConnections = actionMaker.makePromisedAction(switchConnections(this)),
        doShowUsage = actionMaker.makeUsage(LONG_HELP);
      parser.parse(args, (err, argv, output) => {
        if (argv.help) {
          noOp(output);
        } else if (argv.verbose) {
          doShowCurrent();
        } else if (argv.switchProfile) {
          doSwitchConnections();
        } else {
          doShowUsage();
        }
      });
    }
  };
};

module.exports = ConnectionManagerCommand;
