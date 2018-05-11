const LocalFetchRequest = require('./fetch/local-fetch-request');
const LocalQuery = require('./query/local-query');
const ModuleDigest = require('../digest/module-digest.js');
const Providers = require('../providers/providers');
const RestFetchRequest = require('./fetch/rest-fetch-request');
const RestQuery = require('./query/rest-query');


function *id(){
  let idx = 0;
  while(true){
        yield idx++;
  }
}

const idGen = id();

class Bridge {

  constructor(seed, apiVersion) {
    if(!seed) {
      throw new Error('must have a seed');
    }
    this.id = idGen.next().value;
    this.seed = seed;
    this.moduleDigests = {}; //digests
    this.apiVersion = apiVersion;
  }

  getId() {
    return this.id;
  }

  getSeed() {
    return this.seed;
  }

  newProviders() {
    return new Providers(this);
  }

  addModuleDigest(digest) {
    const m = digest.getCustomObjectToModuleDigestMap();
    Object.assign(this.moduleDigests, m);
    return this;
  }

  getModuleDigestForType(globalObjectType) {
    return this.moduleDigests[globalObjectType];
  }

  newQuery(type, apiVersion) {
    if (this.isRest()) {
      return new RestQuery(this, type, apiVersion);
    } else {
      return new LocalQuery(this, type, apiVersion);
    }
  }

  newFetchRequest(type, apiVersion, uid) {
    if (this.isRest()) {
      return new RestFetchRequest(this, type, apiVersion, uid);
    } else {
      return new LocalFetchRequest(this, type, apiVersion, uid);
    }
  }

  getStore() {
    if (this.isRest()) {
      throw new Error('No store present for RESTful impl');
    }
    return this.seed.local;
  }

  getCredentials() {
    if(this.isLocal()) {
      throw new Error('No rest config present for Local impl');
    }
    return this.seed.rest;
  }

  changeCredentials(newCredentials) {
    if(this.isLocal()) {
      throw new Error('Cannot change credentials when running Locally');
    }
    this.seed.rest = newCredentials;
  }

  isLocal() {
    return (this.seed.local) ? true : false;
  }

  isRest() {
    return (this.seed.rest) ? true : false;
  }

}

module.exports = Bridge;
