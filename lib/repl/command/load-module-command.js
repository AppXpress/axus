const Action = require('./action');
const ModuleBuilder = require('../../module/module-builder');
const vm = require('vm');

const HELP = `loads the appx module at the specified path.`;

const parser = require('yargs/yargs')(process.argv.slice(2))
    .example('.loadModule ~/modules/MyModule',
        'Loads the module at the path into the current REPL session.')
    .exitProcess(false)
    .help();

function parseArgs(argv) {
    const parsed = parser.parse(argv);
    parsed.isValid = true;
    const path = parsed._;
    parsed.path = path;
    if (!path || !path.length) {
        parsed.isValid = false;
        parsed.validationMsg = `Hmmm...${path} doesn't look like a path`;
    } else if (Array.isArray(path)) {
        if (path.length > 1) {
            parsed.isValid = false;
            parsed.validationMsg = 'Please specify only one module';
        } else {
            parsed.path = path[0];
        }
    }
    return parsed;
}

const LoadModuleCommand = (server) => {

    const addScope = (pathToScope, doShowUsage) => {
        let module;
        try {
          module = new ModuleBuilder()
            .forNamedResource(pathToScope)
            .build();
        } catch (e) {
          if(/^Library path does not exist/.test(e.message)) {
            server.writeErr('Please tell axus where your local lib is.');
          } else if (/^Could not resolve imports/.test(e.message)) {
            server.writeErr('Some imports are missing from your library');
          }
          throw e;
        }
        const code = module.getCode();
        if (!code) {
          doShowUsage(`No code found at ${pathToScope}`);
          return;
        }
        const digests = module.getDigests();
        const script = vm.createScript(code);
        const sandbox = {};
        script.runInNewContext(sandbox);
        server.putAppXScope(sandbox, digests);
        server.write(`Succesfully loaded ${pathToScope}`);
    };

    return {
        help: HELP,
        action: function(argv) {
            const actionMaker = Action.createActionMaker(this);
            const noOp = actionMaker.noOp(),
                doShowUsage = actionMaker.makeUsage(HELP),
                doLoadModule = actionMaker.makeAction(addScope);
            this.lineParser && this.lineParser.reset();
            this.bufferedCommand = '';
            const parsed = parseArgs(argv);
            if (parsed.help) {
                noOp();
            } else if (!parsed.isValid) {
                doShowUsage(parsed.validationMsg);
            } else {
                const path = parsed.path;
                doLoadModule(path, doShowUsage);
            }
        }
    };
};

module.exports = LoadModuleCommand;
