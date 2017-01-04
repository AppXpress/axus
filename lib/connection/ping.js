const unirest = require('unirest');
const httpStatusCode = require('./http-status-code');


exports.pingWithProfile = (profile) =>
    ping(profile.toConnectionParams(), profile);

/**
 * Ping API to make sure we have
 * working credentials.
 */

const ping = (params, objToResolve) => {
    const request = buildRequest(params);
    return new Promise((resolve, reject) => {
        request.end((response) => {
            const {
                code,
                error,
                statusType
            } = response;
            if (statusType === 2) {
                resolve(objToResolve);
            } else {
                reject(httpStatusCode.errorMessage(code));
            }
        });
    });
};

/**
 * Pick an arbitrary object on the API to force
 * validation.
 */
const buildFullURL = (url) => {
    if (!url.endsWith('/')) {
        url += '/';
    }
    url += '310/OrderDetail';
    return url;
};

const buildRequest = (params) => {
    const {
        url,
        username,
        password,
        dataKey
    } = params;
    const request = unirest('GET', buildFullURL(url));
    request.header({
        'content-type': 'application/json'
    });
    request.query({
        dataKey: dataKey
    });
    request.auth({
        user: username,
        pass: password,
        sendImmediately: true
    });
    return request;
};
