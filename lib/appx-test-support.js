const AppRootDir = require('app-root-dir').get();
const AppxRequire = require('./appx-require');
const ConnectionParamLoader = require('./connection/connection-params');
const ModuleBuilder = require('./module/module-builder');
const Defroster = require('./type/defroster');
const Types = require('./type/types');
const v310Type = require('./type/v310-type');

const r = (name, runnable) => name ? runnable[name] : runnable;

class TestSupport {

  constructor(resourcePath) {
    this.moduleBuilder = new ModuleBuilder()
      .compose(AppRootDir)
      .forNamedResource(resourcePath);
  }

  overrideLib(newLibPath) {
    this.moduleBuilder.overrideLib(newLibPath);
    return this;
  }

  dependsOn(modulePath) {
    //TODO: this will be our point of injection
    //for additional digests that we need to consume
    //
    //@see: https://github.com/AppXpress/axus/issues/34
    if(!Array.isArray(modulePath)) {
      modulePath = [modulePath];
    }
    modulePath.forEach((path) => {
      this.moduleBuilder.addModuleDependency(path);
    });
    return this;
  }

  addToContext(nameMap) {
    this.moduleBuilder.withAdditionalContext(nameMap);
    return this;
  }

  useLocal(seed) {
    this.moduleBuilder.useLocal(seed);
    return load(this.moduleBuilder.build());
  }

  useRest(conf) {
    if(!conf) {
     conf = ConnectionParamLoader.readConfig();
    }
    this.moduleBuilder.useRest(conf);
    return load(this.moduleBuilder.build());
  }
}

function requireRest(resource, name, additionalContext) {
    const ts = new TestSupport(resource).addToContext(additionalContext);
    const runnable = ts.useRest();
    return r(name, runnable);
}

function requireLocal(resource, name, additionalContext) {
    const ts = new TestSupport(resource).addToContext(additionalContext);
    return {
        seed: (store) => {
            store = store || {};
            if (typeof store !== 'object') {
                throw new TypeError('Store must be an object!');
            }
            const runnable = ts.useLocal(store);
            return r(name, runnable);
        }
    };
}

function load(module) {
    return AppxRequire.require(module);
}

function registerV310Type(typeName, design, ...aliases) {
    const newType = new v310Type.Builder()
        .named(typeName)
        .withSchemaDesign(design)
        .withAliases(...aliases)
        .build();
    Types.getCacheInstance().register(newType);
    return Handles;
}

function overrideLib(newLib) {
    Handles.explicitLib = newLib;
    return Handles;
}

const Handles = {
    defrost: (p) => new Defroster().defrostPath(p),
    overrideLib: overrideLib,
    registerV310Type: registerV310Type,
    require: (resource) => new TestSupport(resource),
    requireRest: requireRest,
    requireLocal: requireLocal
};

module.exports = Handles;
