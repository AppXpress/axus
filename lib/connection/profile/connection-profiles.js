const ProfileLocator = require('./profile-locator');
const ProfileParser = require('./profile-parser');
const ProfilePrinter = require('./profile-printer');

const {
    advanceToLocalPath,
    getProfileLeaves,
    isLeaf,
    safeToAdd
} = require('./connection-profile-fns');

const {
    allElementsAreEqual,
    clone,
    deleteProperties,
    entries,
    init,
    last,
    listEntriesIn,
    pluckWith
} = require('../../commons');

function load() {
    const instance = new ConnectionProfiles();
    const f = ProfileLocator.findProfileFile();
    return f ?
        ProfileParser.readAndParse(f, instance) :
        Promise.resolve(instance);
}

function newCollection() {
    return new ConnectionProfiles();
}

class ConnectionProfiles {

    constructor() {
        this.profiles = {};
        this.size = 0;
        this.current = null;
    }

    addProfile(p) {
        if (p.fullyQualifiedPath().length < 2) {
            throw new Error('name must be qualified.');
        }
        let pointer = advanceToLocalPath(this.profiles, p.directionsToLocalPath());
        const [neighborhood, address] = p.localPath();
        if(!pointer[neighborhood]) {
          pointer[neighborhood] = {};
        } else if (isLeaf(pointer[neighborhood])) {
          throw new Error('Illegal Nesting Structure');
        }
        pointer = pointer[neighborhood];
        if(pointer[address]) {
          if(isLeaf(pointer[address])) {
            throw new Error(`Profile ${p.fullyQualifiedPath()} already exists`);
          }
          throw new Error('Illegal Nesting Structure');
        }
        if (!safeToAdd(pointer, p)) {
            throw new Error('Nested namespaces must share the same url');
        }
        pointer[address] = p;
        this.size++;
        return this;
    }

    hasProfile(p) {
        return this.hasAProfileWithFqp(p.fullyQualifiedPath());
    }

    hasAProfileWithFqp(fqp) {
        let pointer = this.profiles;
        for (const subPath of fqp) {
            if (!pointer[subPath]) {
                return false;
            }
            pointer = pointer[subPath];
        }
        return !pointer.fqp ?
            false :
            pointer.fqp.join() === fqp.join();
    }

    addProfiles(ps) {
        ps.forEach((p) => this.addProfile(p));
        return this;
    }

    hasProfiles() {
        return this.size > 0;
    }

    getProfiles() {
        return getProfileLeaves(this.profiles);
    }

    toWritable() {
        return ProfilePrinter.print(this.profiles);
    }

}

exports.load = load;
exports.newCollection = newCollection;
