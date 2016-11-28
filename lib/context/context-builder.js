const AppXContext = require('./appx-context');
const CollectingWalker = require('../import/collecting-walker');
const DigestCollector = require('../import/digest-collector');
const fs = require('fs');
const LibraryImporter = require('../import/lib-import/library-importer');
const ModuleDigest = require('../digest/module-digest');
const path = require('path');
const ScriptCollector = require('../import/script-collector');

class ContextBuilder {

    constructor() {
        this.explicitRoot = null;
        this.explicitLib = null;
        this.resourceName = null;
        this.connection = null;
        this.seed = null;
        this.additionalContext = {};
    }

    compose(root) {
        if (!fs.lstatSync(root).isDirectory) {
            root = path.dirname(root);
        }
        this.explicitRoot = root;
        return this;
    }

    forNamedResource(resourceName) {
        this.resourceName = resourceName;
        return this;
    }

    overrideLib(newLib) {
        this.explicitLib = resolve.call(this, newLib);
        return this;
    }

    useLocal(store) {
        this.connection = 'local';
        this.seed = {
            'local': store
        };
        return this;
    }

    useRest(conf) {
        this.connection = 'rest';
        this.seed = {
            'rest': conf
        };
        return this;
    }

    withAdditionalContext(additionalContext) {
        Object.assign(this.additionalContext, additionalContext);
        return this;
    }

    build() {
        const {
            scripts,
            imports,
            digests
        } = this.getRawResources();
        const builtDigests = ModuleDigest.build(digests);
        return new AppXContext(scripts, imports, builtDigests, this.seed)
            .addContext(this.additionalContext);
    }

    // instance helper fn's ------------------------------------------------------
    // TODO: cleanup.
    getRawResources() {
        if (!this.resourceName) {
            return {
                scripts: [],
                imports: [],
                digests: []
            };
        }
        const normalizedName = normalizeResourceName.call(this, this.resourceName);
        const {
            scripts,
            digests
        } = read(normalizedName);
        const imports = this.getLibImports(scripts);
        return {
            scripts: scripts,
            imports: imports,
            digests: digests
        };
    }

    getRoot() {
        return this.explicitRoot || getDefaultRoot();
    }

    getLibrary() {
        return this.explicitLib || getDefaultLibrary.call(this);
    }

    getLibImports(scripts) {
        return new LibraryImporter(libraryResolver())
            .getImportedScripts(scripts);
    }

}

function getDefaultLibrary() {
    return path.join(this.getRoot(), '..', 'lib');
}

function resolve(name) {
    return path.join(this.getRoot(), name);
}

function getDefaultRoot() {
    return module.parent.filename;
}

function normalizeResourceName(name) {
    return path.resolve(this.getRoot(), name);
}

function libraryResolver(builder) {
    return (name) => {
        return path.resolve(builder.getLibrary(), name);
    };
}

function read(path) {
    if (fs.lstatSync(path).isDirectory()) {
        return readModule(path);
    }
    return readFile(path);
}

function readModule(moduleName) {
    return new CollectingWalker()
        .withDefaultOptions()
        .withCollectors(new ScriptCollector(), new DigestCollector())
        .walk(moduleName);
}

function readFile(filename, errHandler) {
    try {
        return {
            'scripts': [fs.readFileSync(filename, 'utf-8')]
        };
    } catch (err) {
        if (errHandler) {
            errHandler(err);
        } else {
            throw err;
        }
    }
}

module.exports = ContextBuilder;
