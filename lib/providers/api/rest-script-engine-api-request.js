const ScriptEngineApiRequest = require('./script-engine-api-request');
const syncunirest = require('../../sync-unirest/sync-unirest');
const unirest = require('unirest');
//const sync = require('synchronize');

class RestScriptEngineApiRequest extends ScriptEngineApiRequest {

  execute() {
    throw new Error ('Rest Fetch is no longer supported');
    /*
    if(!this.pathInfo) {
      throw new Error('Cannot query without pathInfo');
    }
    const appxConfig = this.parentProvider.config;
    if(!appxConfig) {
      throw new Error('Missing appx config');
    }
    const req = defaultRequest(this, appxConfig);
    const result = sync.await(req.end(syncunirest.defer()));
    return result;
    */
  }

}

function defaultRequest(restScriptEngineApiRequest, appxConfig) {
  const url = cleanUrl(appxConfig.url);
  const req = unirest('GET' , buildRequestUrl(appxConfig.url, restScriptEngineApiRequest.pathInfo));
  req.query(defaultParams(restScriptEngineApiRequest.parameters, appxConfig));
  req.headers(defaultHeaders(restScriptEngineApiRequest.headers));
  req.auth({
    user: appxConfig.username,
    pass: appxConfig.password,
    sendImmediately: true
  });
  return req;
}

function cleanUrl(url) {
  const idx = url.indexOf('/rest');
  return idx == -1 ? url : url.substring(0, idx);
}

function buildRequestUrl(base, path) {
  base = cleanUrl(base);
  if(!base.endsWith('/')) {
    base = base + '/';
  }
  return base + path;
}

function defaultHeaders(headers) {
  if(!headers['content-type']) {
    headers['content-type'] = 'application/json';
  }
  return headers;
}

function defaultParams(params, appxConfig) {
  if(!params.dataKey) {
    params.dataKey = appxConfig.dataKey;
  }
  return params;
}

module.exports = RestScriptEngineApiRequest;
