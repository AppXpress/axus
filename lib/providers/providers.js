const CustomTableProvider = require('./custom-table-provider.js');
const HelpEntryBuilder = require('../repl/help/help-entry-builder');
const MessageProvider = require('./message-provider.js');
const ObjectFactoryProvider = require('./object-factory-provider.js');
const PersistenceProvider = require('./persistence-provider.js');
const QueryProvider = require('./query-provider.js');
const DataApiProvider = require('./data-api-provider.js');
const Bridge = require('./bridge.js');
const ModuleDigest = require('./../digest/module-digest');

/**
 * Exposes all of the Providers given by the AppXpress Runtime.
 */
class Providers {

    constructor(bridge) {
        if (!bridge) {
            throw new Error('Cannot instantiate Providers without bridge');
        }
        this.bridge = bridge;
        this.customTableProvider = new CustomTableProvider(bridge);
        this.messageProvider = new MessageProvider();
        this.objectFactoryProvider = new ObjectFactoryProvider(bridge);
        this.persistenceProvider = new PersistenceProvider(bridge);
        this.queryProvider = new QueryProvider(bridge);
        this.dataApiProvider = new DataApiProvider(bridge);
    }

    getCustomTableProvider() {
        return this.customTableProvider;
    }

    /**
     * getMessageProvider - returns the MessageProvider
     *
     * @return {MessageProvider}  description
     */
    getMessageProvider() {
        return this.messageProvider;
    }

    /**
     * getObjectFactoryProvider - return the ObjectFactoryProvider
     *
     * @return {type}  description
     */
    getObjectFactoryProvider() {
        return this.objectFactoryProvider;
    }

    /**
     * getPersistenceProvider - return the PersistenceProvider
     *
     * @return {type}  description
     */
    getPersistenceProvider() {
        return this.persistenceProvider;
    }

    /**
     * getQueryProvider - returns the QueryProvider
     *
     * @return {type}  description
     */
    getQueryProvider() {
        return this.queryProvider;
    }

    /**
     * getDataApiProvider - returns the DataApiProvider
     *
     * @return {type}  description
     */
    getDataApiProvider() {
        return this.dataApiProvider;
    }

    reset() {
        this.customTableProvider.reset();
        this.queryProvider.reset();
        this.persistenceProvider.reset();
        this.messageProvider.reset();
        this.objectFactoryProvider.reset();
    }
}

HelpEntryBuilder.forAppXpress(__filename, 'Providers').defer();

module.exports = Providers;
