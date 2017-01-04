const {
    allElementsAreEqual,
    entries,
    listEntriesIn,
    pluckWith
} = require('../../commons');

/**
 * getProfileLeaves - perform DFS on the profiles trie
 *
 * @param  {type} profiles description
 * @return {type}          description
 */
const getProfileLeaves = (profiles) => {
    const leaves = [],
        collector = (o) => leaves.push(o);
    dfs(profiles, isLeaf, collector);
    return leaves;
};

//TODO: needs to check if at any point we are
// trying to advance past a leaf.
const advanceToLocalPath =
    (origin, directions = []) => {
        let pointer = origin;
        for (const subPath of directions) {
            if (!pointer[subPath]) {
                pointer[subPath] = {};
            }
            pointer = pointer[subPath];
        }
        return pointer;
    };

/**
 * dfs - description
 *
 * @param  {type} profiles  description
 * @param  {type} predicate description
 * @param  {type} collect   description
 * @return {type}           description
 */
function dfs(profiles, predicate, collect) {

    const stack = [];

    const found = (node) => {
        if (!node) {
            return false;
        }
        const isFound = predicate(node);
        if (!isFound) {
            stack.push(node); // explore its children, if any.
        }
        return isFound;
    };

    /**
     * Perform the dfs
     */
    if (found(profiles)) {
        collect(profiles);
    }
    while (stack.length) {
        const nextNode = stack.pop();
        for (const childNode of entries(nextNode)) {
            if (found(childNode)) {
                collect(childNode);
            }
        }
    }

}

const isLeaf = (p) => Boolean(p && p.fqp);

const isParentofLeaf = (p) => listEntriesIn(p).every(isLeaf);

const pluckUrls = pluckWith('url');

const urlsOfChildren = (o) => pluckUrls(listEntriesIn(o));

const allUrlsOfChildrenAreEqual = (o) => allElementsAreEqual(urlsOfChildren(o));

const safeToAdd = (pointer, toAdd) =>
    Object.keys(pointer).length === 0 ||
    allElementsAreEqual([...urlsOfChildren(pointer), toAdd.url]);

exports.advanceToLocalPath = advanceToLocalPath;
exports.allUrlsOfChildrenAreEqual = allUrlsOfChildrenAreEqual;
exports.dfs = dfs;
exports.getProfileLeaves = getProfileLeaves;
exports.isLeaf = isLeaf;
exports.isParentofLeaf = isParentofLeaf;
exports.pluckUrls = pluckUrls;
exports.safeToAdd = safeToAdd;
exports.urlsOfChildren = urlsOfChildren;
