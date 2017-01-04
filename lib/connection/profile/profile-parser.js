const {
    isPrimitive,
    isString
} = require('../../type/js-type-checker');
const FileUtil = require('../../file/utils');
const Profile = require('./profile');


/**
 * Helper to encapsulate some chaining.
 */
const readAndParse = (f, connectionProfiles) => FileUtil.getJSONFileAsPOJO(f)
    .then((rawProfileFile) => {
        return Promise.resolve(parse(rawProfileFile, connectionProfiles));
    });

/**
 * We need a crawl of the whole JSON tree.
 * A Profile would get created for each subtre,
 * where the FQP for that profile is the key(s) of that
 * subtree's parents.
 *
 * Here, a subtree is made of a url, and a profiles map.
 */
const parse = (o, connectionProfiles) => _parse([], connectionProfiles, o);

const isProfilesSubTree = (maybeLeaf) => maybeLeaf &&
    isString(maybeLeaf.url) && !isPrimitive(maybeLeaf.profiles);

/**
 * _parse - We recurse, each time building up acc (accumulation)
 * in order to create a fully qualified path to the node.
 *
 * @param  {type} acc      description
 * @param  {type} profiles description
 * @param  {type} next     description
 * @return {type}          description
 */
function _parse(acc, profiles, next) {
    if (isProfilesSubTree(next)) {
        profiles.addProfiles(parseSubtree(acc, next));
    } else {
        for (let child in next) {
            _parse(acc.concat([child]), profiles, next[child]);
        }
    }
    return profiles;
}

/**
 * parseSubtree - parses a block like:
 *
 * {
 *   "url": "https://environment.gtnexus.com/rest/",
 *   "profiles": {
 *       "supq-admin": {
 *           "username": "user@gtnexus",
 *           "dataKey": "86f169071a3c5a16812fa8d089f871d0f4d7cc4d"
 *        }
 *    }
 * }
 *
 * @param  {type} acc     description
 * @param  {type} subtree description
 * @return {Array}         Array of Profile
 */
function parseSubtree(acc, subtree) {
    const results = [];
    const {
        url,
        profiles
    } = subtree;
    for (let name in profiles) {
        const {
            username,
            dataKey
        } = profiles[name];
        const p = new Profile([...acc, name], url, username, dataKey);
        results.push(p);
    }
    return results;
}

exports.parse = parse;
exports.readAndParse = readAndParse;
