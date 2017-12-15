const FetchRequest = require('./fetch-request');
const QueryResultBuilder = require('../query/query-result-builder');

class LocalFetchRequest extends FetchRequest {
  execute() {
    const store = this.bridge.getStore();
    if (!store) {
      throw new Error('Illegal state. Could not resolve local store');
    }
    let possibleMatches, result;
    if (this._resource) {
      return fetchResource.call(this);
    }
    if (!(possibleMatches = store[this.type])) {
      httpError({
        type: this.type
      });
    }
    result = possibleMatches[String(this._uid)];
    if (!result) {
      httpError({
        type: this.type,
        uid: this._uid
      });
    }
    return result;
  }
}

function fetchResource() {
  if (this._resource === 'attachments') {
    return fetchAttachments.call(this);
  }
  let possibleMatches;
  if (!(possibleMatches = store[this._resource])) {
    httpError({
      resource: this._resource
    });
  }
  result = possibleMatches[this._uid];
  if (!result) {
    httpError({
      resource: this_resource,
      uid: this._uid
    });
  }
  return result;
}

function fetchAttachments() {
  const store = this.bridge.getStore();
  let possibleMatches, result;
  if (!(possibleMatches = store[this.type])) {
    httpError({
      type: this.type
    });
  }
  result = possibleMatches[this._uid + '/attachments'];
  if (!result) {
    httpError({
      resource: this.type,
      uid: this._uid
    });
  }
  return QueryResultBuilder.buildResultSet(result);
}

function httpError(info) {
  const subMsg = Object.keys(info)
    .reduce((acc, k) => {
      acc.push(`${k}::${info[k]}`);
      return acc;
    }, []).join(', ');
  throw new Error(`404 the requested ${subMsg} was not found in the local store`);
}

function explain(possibleMatches) {
  const i = Object
    .keys(possibleMatches)
    .reduce((acc, next) => {
      const nextTag = Object.prototype.toString.call(next);
      const matchJson = JSON.stringify(possibleMatches[next]);
      acc.push(`${next}::${nextTag} -> \n${matchJson}`);
      return acc;
    }, []);
  return i.join('\n');
}

module.exports = LocalFetchRequest;
