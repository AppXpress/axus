const {createDisplay} = require('./help-formatter');

/**
 * Wrapper entity around obj produced by jsdoc3.
 */
class HelpEntry {

  constructor(doc) {
    this.doc = doc;
    this.name = doc.longname;
    this.children = [];
    this.display = null;
  }

  isForClass() {
    return this.doc.kind === 'class';
  }

  isForFunction() {
    return this.doc.kind === 'function';
  }

  addChildren(children) {
    Array.prototype.push.apply(this.children, children);
  }

  addChild(child) {
    this.children.push(child);
  }

  hasChildren() {
    return this.children.length > 0;
  }

  displayEntry() {
    if(!this.display) {
      this.display = createDisplay(this);
    }
    return this.display;
  }

}

module.exports = HelpEntry;
