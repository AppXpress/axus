const FetchRequest = require('./fetch-request');
const syncunirest = require('../../sync-unirest/sync-unirest');
const unirest = require('unirest');
const sync = require('synchronize');
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

    //TODO: ping and this can pretty much share this...
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
        const appx = this.bridge.getCredentials();
        if (!appx) {
            throw new Error('Could not resolve parent provider config');
        }
        FetchRequestValidator.validate(this);
        const request = RestFetchRequest.buildUnirestRequest(appx, this);
        try {
            const result = sync.await(request.end(syncunirest.defer()));
            return new ImmutableDefroster().defrost(result);
        } catch (error) {
            const {
                message,
                name,
                stack
            } = error;
            console.log(`Error when executing fetch request for
        path: ${RestFetchRequest.pathFor(appx.url, this)}`);
            throw error;
        }
    }
}

module.exports = RestFetchRequest;
