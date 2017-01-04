const chalk = require('chalk');
const {
    makeHeader
} = require('./help-formatter');

const noHelpEntryFound = (key) => ({
    displayEntry: () =>
         (chalk.red(`No documentation found for ${key}`))
});


/**
 * Responsible for keeping record of all help entries required
 * to be displayed at run time of the REPL.
 */
class HelpRegistrar {

    constructor() {
        this.cache = {};
        this.deferrals = [];
    }

    register(helpEntry) {
        this.cache[helpEntry.name] = helpEntry;
    }

    registerAll(helpEntries) {
        for (let entry of helpEntries) {
            this.register(entry);
        }
    }

    getHelpEntry(name) {
        return this.cache[name];
    }

    getAllHelpEntries() {
        return this.cache;
    }

    prepareEntriesList() {
        const allEntries = this.cache;
        const toPrint = {
            max: 0,
            keys: []
        };
        let {keys, max} = Object.keys(allEntries)
            .sort(providersFirstThenAlpha)
            .reduce((acc, next) => {
                if (allEntries[next].isForClass()) {
                    acc.keys.push(next);
                    acc.max = maxLength(acc.max, allEntries[next]);
                }
                return acc;
            }, toPrint);
        max += 4;
        return keys.reduce((acc, key) => {
                const clazz = allEntries[key];
                acc.push(makeHeader(key, max));
                clazz.children.forEach((child) => {
                    acc.push(`• ${child.name}`);
                });
                return acc;
            }, []);
    }

    getEntryDisplay(key) {
        const entry = this.getHelpEntry(key) || noHelpEntryFound(key);
        return entry.displayEntry();
    }

    /**
     * defer - Defers parsing of help, etc. Useful for instances
     *         when we don't need to generate help. For example, when only using
     *        axus a unit test dependency.
     *
     * @param  {type} builder description
     * @return {type}         description
     */
    defer(builder) {
        this.deferrals.push(builder);
    }

    processDeferrals() {
        this.deferrals.forEach((deferral) => deferral.build());
    }

}

const providersFirstThenAlpha = (a, b) => {
  if(a === 'Providers') {
    return -1;
  }
  if(b === 'Providers') {
    return 1;
  }
  return (a < b ? -1 : ( a > b ? 1 : 0));
};

const maxLength = (currMax, nextClass) => {
  return Math.max(currMax, maxLengthOfClass(nextClass));
};

const maxLengthOfClass = (clazz) => {
  return Math.max(clazz.name.length, ...clazz.children.map((c) => c.name.length));
};

//export the instance.
module.exports = new HelpRegistrar();
