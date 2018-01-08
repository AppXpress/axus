const {
    allElementsAreEqual,
    clone,
    deleteProperties,
    head,
    last,
    listEntriesIn
} = require('../../commons');
const {
    dfs,
    isParentofLeaf,
    pluckUrls
} = require('./connection-profile-fns');

/**
 * ProfilePrinter is the inverse of ProfileParser.
 * write(print(x)) = x and write ○ print = identityFn
 */
const print = (profiles) => {
    const consolidatedTree = clone(profiles);
    dfs(consolidatedTree, isParentofLeaf, collector);
    return consolidatedTree;
};

/**
 * This collector takes a parent,
 * checks the children for compliance,
 * prunes the children, hoists the shared fields,
 * and produces the child 'profiles' node.
 */
const collector = (o) => {
    const children = listEntriesIn(o);
    const urls = pluckUrls(children);
    if (!allElementsAreEqual(urls)) {
        throw new Error('Illegal State: all urls need to be equal in order to hoist\n');
    }
    deleteProperties(o, Object.keys(o));
    o.url = head(urls);
    o.profiles = makeProfilesNode(children);
};

const makeProfilesNode = (children) =>
    children.reduce((acc, child) => {
        const {
            fqp,
            username,
            dataKey
        } = child;
        acc[last(fqp)] = {
            username,
            dataKey
        };
        return acc;
    }, {});

exports.print = print;
