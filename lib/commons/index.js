const Types = require('../type/types');

function clone(o) {
    if (o === null || o === undefined) {
        return o;
    }
    if (Types.isPrimitive(o)) {
        return o;
    }
    if (Types.isDate(o)) {
        const d = new Date();
        d.setTime(o.getTime());
        return d;
    }
    if (Types.isArray(o)) {
        return o.map(clone);
    }
    //Object
    return Object.keys(o).reduce((acc, k) => {
        acc[k] = clone(o[k]);
        return acc;
    }, {});
}

function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield obj[key];
    }
}

const listEntriesIn = (obj) => [...entries(obj)];

const C = (a) => (b) => (c) => a(c, b);

const pluck = (collection, property) =>
    collection.map((o) => o[property]);

const pluckWith = C(pluck);

const allElementsAreEqual = (arr) =>
    isEmpty(arr) ||
    !!arr.reduce((a, b) => a == b ? a : NaN);

const isEmpty = (arr) => arr.length === 0;

const deleteProperties = (o, properties) =>
    properties.forEach((p) => {
        delete o[p];
    });

/**
 * FP (haskell) style init. Returns all but last.
 */
const init = (arr) => arr.slice(0, lastIndex(arr));

const last = (arr) => arr[lastIndex(arr)];

const lastIndex = (arr) => arr.length - 1;

const head = (arr) => arr[0];

exports.allElementsAreEqual = allElementsAreEqual;
exports.clone = clone;
exports.deleteProperties = deleteProperties;
exports.entries = entries;
exports.head = head;
exports.init = init;
exports.last = last;
exports.listEntriesIn = listEntriesIn;
exports.pluck = pluck;
exports.pluckWith = pluckWith;
