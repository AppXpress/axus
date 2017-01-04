const Types = require('../type/types');
const {clone} = require('../commons');

const IGNORE_KEYS = [
    'self',
    'fingerprint'
];

/**
 * revive - wrapper to be called by JSON.stringify
 *
 * @param  {type} k current key that JSON.parse is targeting
 * @param  {type} v value that current key point to.
 * @return {type} object the (maybe) revived object
 */
function revive(k, v) {
    return reviveAppXObject(v);
}

/**
 * revive - revives the plain js object if it is an AppX object.
 *          Otherwise, returns the plain old js object.
 *
 * @param  {type} o the maybe appx obj that we want to revive.
 * @return {type} object the (maybe) revived object
 */
function reviveAppXObject(o) {
    if (!Types.isRecognizableAppXType(o)) {
        return o;
    }
    const appxType = Types.getTypeDefinition(o);
    const dictionary = appxType.getDataDictionary();
    const topLvlType = dictionary.type;
    const root = dictionary[topLvlType];
    return transform(o, root, appxType.getSchema());
}

/**
 * transform - leverages the current dictionary to transform any scalar fields,
 *             otherwise recurses to transform object(map)/collection.
 *             Falls back on Schema/Design/FieldData for some custom objects who
 *             have 'incomplete' DataDictionaries.
 *
 * @param  {object} target     the object that we want to transform
 * @param  {object} dictScope  the dictionary entry for the current target
 * @param  {object} dictionary the entire dictionary from the design.
 */
function transform(source, dictScope, schema) {
    const dictionary = schema.getDataDictionary();
    const destination = {};
    Object
        .keys(source)
        .forEach((k) => {
            const val = source[k];
            const typeDesc = dictScope[k];
            const specialCase = handleSpecialCase(k, val, dictionary);
            if (specialCase.isSpecial) {
                destination[k] = specialCase.value;
                return;
            }
            if (!typeDesc && isCustomObject(dictionary)) {
                const auxilliaryData = getAuxilliaryFieldData(schema, k);
                if (auxilliaryData) {
                    const {
                        axuilliarySchema,
                        axuilliaryRoot
                    } = auxilliaryData;
                    transform(val, axuilliaryRoot, axuilliarySchema);
                    return;
                }
            }
            if (!typeDesc) {
                throw new Error(`Illegal State Exception.
                  No typeDesc for ${k} -> ${JSON.stringify(val)}
                  In dictScope ${JSON.stringify(dictScope)}`);
            }
            const nextDictScope = dictionary[typeDesc.type];
            if (typeDesc.type === 'TEXT') {
                destination[k] = source[k];
            } else if (typeDesc.type === 'COMPLEX') {
                destination[k] = source[k].slice();
            } else if (typeDesc.type === 'DATE') {
                destination[k] = new Date(val);
            } else if (typeDesc.type === 'NUMBER') {
                destination[k] = Number(val);
            } else if (typeDesc.type === 'BOOLEAN') {
                destination[k] = Boolean(val);
            } else if (typeDesc.isCollection) {
                destination[k] = transformCollection(val, nextDictScope, schema);
            } else if (typeDesc.isMap) {
                destination[k] = transformMap(val, nextDictScope, schema);
            } else {
                destination[k] = transform(val, nextDictScope, schema);
            }
        });
    return destination;
}


/**
 * handleSpecialCase - currently handles three cases in which we need to return
 *                     early, AND we won't have a typeDesc for the key.
 *  1.  __metadata is not in core Data Dictionaries
 *  2.  uid is not in Custom ObjectDataDictionaries, and is a String that can be
 *      returned. We are keeping it seperate from IGNORE_KEYS because core types
 *      do not have this field littered throughout.
 *  3.  IGNORE_KEYS are common keys that the Dictionaries never specify.
 *
 *
 * @param  {type} key        description
 * @param  {type} val        description
 * @param  {type} dictionary description
 * @return {type}            description
 */
function handleSpecialCase(key, val, dictionary) {
    if (key === '__metadata') {
        return {
            isSpecial: true,
            value: clone(val)
        };
    }
    if (IGNORE_KEYS.indexOf(key) !== -1 ||
        (key === 'uid' && isCustomObject(dictionary))) {
        return {
            isSpecial: true,
            value: val
        };
    }
    return {
        isSpecial: false
    };
}

/**
 * transformCollection - Helper function, transforms each element in the
 *                       collection according to the dictScope given.
 *
 * @param  {object} target     the object that we want to transform
 * @param  {object} dictScope  the dictionary entry for the current target
 * @param  {object} schema     the entire design
 */
function transformCollection(sources, dictScope, schema) {
    return sources.map((source) => {
        return transform(source, dictScope, schema);
    });
}

/**
 * transformMap - Helper function, transforms each entry in a map, according to
 *                the dictScope, infers the type of map.
 *
 *                There are currently three types of maps supported.
 *                1) Simple Key-Value maps, such as a References section. These
 *                   maps have dictScope's which have special $key and $value
 *                   entries.
 *                2) An indirectMap has some key that points to either a single
 *                   object that conforms to the dictScope, or an array of
 *                   that each fit the dictScope.
 *                3) A regular map that does not fit any of the above criteria.
 *
 * @param  {object} target     the object that we want to transform
 * @param  {object} dictScope  the dictionary entry for the current target
 * @param  {object} dictionary the entire dictionary from the schema.
 */
function transformMap(target, dictScope, schema) {
    if (isSimpleKVMap(dictScope)) {
        return transform(target, makeKVDict(target, dictScope.$value), schema);
    } else if (isIndirectMap(target, dictScope)) {
        return transformIndirectMap(target, dictScope, schema);
    } else {
        return transform(target, dictScope, schema);
    }
}


/**
 * transformIndirectMap - Helper function to transform an indirect map.
 *                        E.g.:
 *                        "Party" : {
 *                          "Buyer" [] // Array of Party obj's
 *                        }
 *
 * @param  {type} target    description
 * @param  {type} dictScope description
 * @param  {type} schema    description
 * @return {type}           description
 */
function transformIndirectMap(target, dictScope, schema) {
    return Object
        .keys(target)
        .reduce((acc, v) => {
            const mapEntry = target[v];
            if (Array.isArray(mapEntry)) {
                acc[v] = transformCollection(mapEntry, dictScope, schema);
            } else {
                acc[v] = transform(mapEntry, dictScope, schema);
            }
            return acc;
        }, {});
}


/**
 * isSimpleKVMap - determines if the dictScope is for a simple KV map.
 *
 * @param  {type} dictScope the scope of the dictionary in question.
 * @return {boolean} isSimpleKVMap
 */
function isSimpleKVMap(dictScope) {
    return dictScope.$key && dictScope.$value;
}

/**
 * makeKVDict - simple KV maps don't fit our recursion pattern.
 *
 *              We use the the simpleKVmap's dict entry and our current
 *              object to create a new dict entry that does.
 *
 * @param  {type} obj  description
 * @param  {type} dict description
 * @return {type}      description
 */
function makeKVDict(obj, dict) {
    return Object
        .keys(obj)
        .reduce((acc, next) => {
            acc[next] = dict;
            return acc;
        }, {});
}

/**
 * isIndirectMap - when the keys of our target are not in the dict, we can
 *                 assume that we have an inDirectMap, such as the Party section.
 *
 * @param  {type} target    description
 * @param  {type} dictScope description
 * @return {type}           description
 */
function isIndirectMap(target, dictScope) {
    return !Object.keys(target).some((k) => dictScope.hasOwnProperty(k));
}

//TODO: this might not be the smartest impl. could also just use schema.design
function isCustomObject(dictionary) {
    return dictionary.type.startsWith('$');
}


/**
 * getAuxilliaryFieldData - Used when we cannot find an entry in the dictionary.
 *                          Custom Object Schema's have a fieldData section
 *                          which contains more information that we can use to
 *                          defrost the object.
 *
 * @param  {type} schema description
 * @param  {type} key    description
 * @return {type}        description
 */
function getAuxilliaryFieldData(schema, key) {
    const fieldDataEntry = schema.getFieldDataEntry(key);
    if (!fieldDataEntry) {
        return null;
    }
    const typeDef = findTypeDefinition(fieldDataEntry, schema);
    if (!typeDef) {
        return null;
    }
    const dd = typeDef.getDataDictionary();
    const root = getRootForFieldDataEntry(dd, fieldDataEntry);
    return root ? {
        axuilliarySchema: typeDef.schema,
        axuilliaryRoot: root
    } : null;
}

function findTypeDefinition(fieldDataEntry, schema) {
    if (schema.isV310()) {
        return Types.getV310TypeDefinition(fieldDataEntry.type);
    }
    throw new Error(`Unhandled apiVersion ${schema.getApiVersion()}`);
}

function getRootForFieldDataEntry(dd, fieldDataEntry) {
    return dd[fieldDataEntry.type] || dd[initCap(fieldDataEntry.type)];
}

function initCap(str) {
    return str
        .toLowerCase()
        .replace(/(?:^|\s)[a-z]/g, (c) => {
            return c.toUpperCase();
        });
}

exports.revive = revive;
