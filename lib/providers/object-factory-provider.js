const HelpEntryBuilder = require('../repl/help/help-entry-builder');

/**
 * The ObjectFactoryProvider allows for the creation of known object types.
 *
 * For more information, see:
 * https://developer.gtnexus.com/platform/scripts/built-in-functions/creating-an-object
 */
class ObjectFactoryProvider {

  constructor(bridge){
      this.created = [];
      this.bridge = bridge;
  }


  /**
   * newObject - Returns a new instance of an object of the specified type and
   *             version.
   *             For more information, see:
   *             https://developer.gtnexus.com/platform/scripts/built-in-functions/creating-an-object
   *
   * @param  {String} type  The global object type you wish to create an instance
   *                        of.
   * @param  {Number} version The API Version of the type.
   * @return {Object}
   */
  newObject(type, version) {
    let newObj = {type: type};
    this.created.push(newObj);
    return newObj;
  }

  getCreated() {
    return this.created.slice();
  }

  getNextPoolNumber(poolName, sequenceDepth) {
    let nextPoolNumber = {};

    //TODO - API changes required to support RESTful scenario
    if (this.bridge.isRest()) {
      throw new Error(`Unsupported Operation:
        Restful getNextPoolNumber is not yet implemented.
        Please use Local`);
    }
    //TODO - End

    if (sequenceDepth) {
      nextPoolNumber = this.bridge.newFetchRequest('NumberingPool', this.bridge.apiVersion, poolName + '/' + sequenceDepth);
    } else {
      nextPoolNumber = this.bridge.newFetchRequest('NumberingPool', this.bridge.apiVersion, poolName);
    }
    return nextPoolNumber.execute();
  }

  reset() {
    this.created = [];
  }
}

HelpEntryBuilder.forAppXpress(__filename, 'ObjectFactoryProvider').defer();

module.exports = ObjectFactoryProvider;
