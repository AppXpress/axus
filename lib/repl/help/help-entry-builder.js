const jsdocx = require('jsdoc-x');
const HelpEntry = require('./help-entry');
const HelpRegistrar = require('./help-registrar');
const Hierarchy = require('./help-entry-hierarchy-fns');

const isClassDef =
    (classname) =>
    (doc) =>
    doc.longname === classname && doc.kind === 'class';

/**
 * FilterFunction holds predicates used to categorize the entries returned by
 * jsdoc-x.
 * Most of these first require you feed it the builder instance.
 */
const FilterFunction = {};

FilterFunction.isDocumented = (doc) => !doc.undocumented ||
    doc.undocumented !== true;

FilterFunction.isClass = (b) => (doc) => b.memberOf === doc.memberOf ||
    isClassDef(b.memberOf)(doc);

FilterFunction.isMember = (b) => (doc) => b.memberOf === doc.memberOf;

FilterFunction.isKind = (b) => (doc) => (b.isClass && isClassDef(doc)) ?
    true :
    b.kinds.includes(doc.kind);

/**
 * Joins a list of filters made up of entries from FilterFunction
 */
const joinFilters = (filters) => {
    return (doc) => {
        for (let filter of filters) {
            if (!filter(doc)) {
                return false;
            }
        }
        return true;
    };
};

/**
 * Requires source, should be a path to the .js file that
 * jsdoc will parse.
 *
 * Defer can be used to delay jsdoc's parsing, and ultimately
 * the registration of the HelpEntry.
 */
class HelpEntryBuilder {

    /**
     * forAppXpress - standard entry point for appx mock classes.
     *                Establishes heirarchy between parent class
     *                and their methods.
     *
     * @param  {type} sourcePath description
     * @param  {type} className  description
     * @return {type}            description
     */
    static forAppXpress(sourcePath, className) {
        return new HelpEntryBuilder()
            .forSource(sourcePath)
            .asAClass(className)
            .includeKind('function');
    }

    constructor() {
        this.source = undefined;
        this.mustBeDocumented = true;
        this.memberof = undefined;
        this.kinds = [];
        this.filter = undefined;
    }

    forSource(source) {
        this.source = source;
        return this;
    }

    asAClass(className) {
        //TODO: class generator.
        this.isClass = true;
        this.mustBememberof(className);
        return this;
    }

    useFilter(filter) {
        this.filter = filter;
    }

    mustBememberof(name) {
        this.memberof = name;
        return this;
    }

    includeKind(kind) {
        this.kinds.push(kind);
        return this;
    }

    includeKinds(kinds) {
        this.kinds.push(...kinds);
        return this;
    }

    mustBeDocumented(mustBeDocumented) {
        this.mustBeDocumented = mustBeDocumented;
        return this;
    }

    build() {
        if (!this.source) {
            throw new Error('Cannot build HelpEntry with a source!');
        }
        const docFilter = this.filter || createFilter.call(this);
        jsdocx
            .parse(this.source)
            .then(registerRelevantHelpEntries.call(this, docFilter));
    }

    defer() {
        HelpRegistrar.defer(this);
    }

}

function createFilter() {
    const filters = [];
    if (this.mustBeDocumented) {
        filters.push(FilterFunction.isDocumented);
    }
    if (this.isClass) {
        filters.push(FilterFunction.isClass(this));
    } else if (this.memberof) {
        filters.push(FilterFunction.isMember(this));
    }
    if (this.kinds.length) {
        filters.push(FilterFunction.isKind(this));
    }
    return joinFilters(filters);
}

function registerRelevantHelpEntries(docFilter) {
    return (docs) => {
        const hierachyFn = this.isClass ?
            Hierarchy.buildClassHierarchy :
            Hierarchy.flatHierarchy;
        const relevantDocs = docs.filter(docFilter);
        const entries = hierachyFn(relevantDocs);
        HelpRegistrar.registerAll(entries);
    };
}

module.exports = HelpEntryBuilder;
