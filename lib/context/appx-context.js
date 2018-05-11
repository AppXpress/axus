const Bridge = require('../providers/bridge');
const Defroster = require('../type/defroster');
const Providers = require('../providers/providers');

/**
 * JS cannot compare across contexts.
 *
 * This is here to share the global core types, so that epxressions like
 * `date instanceof Date` will behave as expected whether called in the
 * modules source, or by the axus/mocha test-case.
 */
const globs = {
    Array: Array,
    Date: Date,
    Function: Function,
    JSON: JSON,
    Number: Number,
    Object: Object,
    RegExp: RegExp,
    String: String
};

/**
 *
 */
class AppXContext {

    constructor(moduleScripts, libScripts, digests, seed, apiVersion) {
        this.moduleScripts = moduleScripts;
        this.libScripts = libScripts;
        this.digests = Array.isArray(digests) ? digests : [digests];
        this.seed = seed;
        this.additionalContext = {};
        this.apiVersion = apiVersion || '310';
    }

    /**
     * getBridge - description
     *
     * @return {type}  description
     */
    getBridge() {
        if (!this.bridge()) {
            this.createBridge();
        }
        return this.bridge;
    }

    /**
     * addContext - description
     *
     * @param  {type} additionalContext description
     * @return {type}                   description
     */
    addContext(additionalContext) {
        Object.assign(this.additionalContext, additionalContext);
        return this;
    }

    /**
     * produceRunTime - description
     *
     * @return {type}  description
     */
    produceRunTime() {
        const code = this.getCode();
        const sandbox = this.createSandbox();
        return {
            code: code,
            sandbox: sandbox
        };
    }

    /**
     * getCode - description
     *
     * @return {type}  description
     */
    getCode() {
        return this.libScripts.concat(this.moduleScripts).join('\n');
    }

    /**
     * getDigests - description
     *
     * @return {type}  description
     */
    getDigests() {
        return this.digests;
    }

    /**
     * getApiVersion - description
     *
     * @return {type}  description
     */
    getApiVersion() {
        return this.apiVersion;
    }

    /**
     * createSandbox - creates a sandbox for the a context.
     *                 a sandbox providers the Providers, and any other additionalContext
     *                 context.
     *
     * @return {type}  description
     */
    createSandbox() {
        if (!this.bridge) {
          this.createBridge();

        }
        const providers = this.bridge.newProviders();
        return Object.assign({},
            this.additionalContext, {
                Providers: providers
            },
            globs);
    }

    /**
     * createBridge - description
     *
     * @return {type}  description
     */
    createBridge() {
        const bridge = new Bridge(this.seed, this.apiVersion);
        this.digests.forEach((digest) => {
          bridge.addModuleDigest(digest);
        });
        this.bridge = bridge;
        return this.bridge;
    }
}

/**
 * TODO: is this wired in?????
 * defrostSeed - description
 *
 * @param  {type} seed description
 * @return {type}      description
 */
function defrostSeed(seed) {
    const defroster = new Defroster();
    return Object
        .keys(seed)
        .reduce((outerAcc, k) => {
            const child = seed[k];
            const childKeys = Object.keys(child);
            outerAcc[k] = childKeys.reduce((innerAcc, childKey) => {
                const entry = child[childKey];
                if (Array.isArray(entry)) {
                    innerAcc[childKey] = entry.map(defroster.defrost);
                } else {
                    innerAcc[childKey] = defroster.defrost(entry);
                }
                return innerAcc;
            }, {});
            return outerAcc;
        }, {});
}

module.exports = AppXContext;
