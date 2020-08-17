const FetchRequest = require('./fetch-request');
const syncunirest = require('../../sync-unirest/sync-unirest');
const unirest = require('unirest');
//const sync = require('synchronize');
const FetchRequestValidator = require('./fetch-request-validator');
const ImmutableDefroster = require('../../type/defroster');

class RestFetchRequest extends FetchRequest {

  static pathFor(root, request) {
    let path;
    if (request._resource) {
      if ('attachments' === request._resource) {
        path = `${root}${request._apiVersion}/${request.type}/${request._uid}/attachments`;
      } else {
        path = `${root}${request._apiVersion}/${request._resource}/${request._resourceId}`;
      }
    } else {
      path = `${root}${request._apiVersion}/${request.type}/${request._uid}`;
    }
    return path;
  }

  static buildUnirestRequest(appx, req) {
    const request = unirest('GET', RestFetchRequest.pathFor(appx.url, req));
    request.query(req._params);
    request.query({
      dataKey: appx.dataKey
    });
    request.headers({
      'content-type': 'application/json',
    });
    request.auth({
      user: appx.username,
      pass: appx.password,
      sendImmediately: true
    });
    return request;
  }

  execute() {
    throw new Error ('Rest Fetch is no longer supported');
    /*
    const appx = this.bridge.getCredentials();
    if(!appx) {
      throw new Error('Could not resolve parent provider config');
    }
    FetchRequestValidator.validate(this);
    const request = RestFetchRequest.buildUnirestRequest(appx, this);
    const result = sync.await(request.end(syncunirest.defer()));
    return new ImmutableDefroster().defrost(result);
    */
  }
}

module.exports = RestFetchRequest;
