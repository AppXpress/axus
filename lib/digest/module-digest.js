const CustomObjectDesignDigestBuilder = require('./builder/custom-object-design-digest-builder');
const PlatformModuleDigestBuilder = require('./builder/platform-module-digest-builder');

class ModuleDigest {

  static build(digests = []) {
    const platformModuleDigest = PlatformModuleDigestBuilder.build(digests.slice());
    const customObjectDesignDigest = CustomObjectDesignDigestBuilder.build(digests.slice());
    return new ModuleDigest(platformModuleDigest, customObjectDesignDigest);
  }

  constructor(platformModuleDigest, customObjectDesignDigest) {
    this.platformModuleDigest = platformModuleDigest;
    this.customObjectDesignDigest = customObjectDesignDigest;
  }

  getPlatformModuleConfiguration() {
    return this.platformModuleDigest.getPlatformModuleDigest();
  }

  getModuleId() {
    return this.platformModuleDigest.getModuleId();
  }

  getModuleName() {
    return this.platformModuleDigest.getModuleName();
  }

  getModuleDescription() {
    return this.platformModuleDigest.getModuleDescription();
  }

  getCustomObjectDesignDigest(globalObjectType) {
    if (!this.customObjectDesignDigest) {
      throw new Error('No custom object design Digest found for: ' + globalObjectType);
    }
    return this.customObjectDesignDigest.getDesignDigest(globalObjectType);
  }

  getCustomObjectDesignWorkflowFeature(globalObjectType) {
    if (!this.customObjectDesignDigest) {
      throw new Error('No custom object design workflow feature found for: ' + globalObjectType);
    }
    return this.customObjectDesignDigest.getDesignWorkflowFeature(globalObjectType);
  }

  getCustomObjectDesignApiVersion(globalObjectType) {
    if (!this.customObjectDesignDigest) {
      throw new Error('No custom object design API version found for: ' + globalObjectType);
    }
    return this.customObjectDesignDigest.getDesignApiVersion(globalObjectType);
  }

  getCustomObjectToModuleDigestMap() {
    const coToCustomObjDesignDigest = this.customObjectDesignDigest.digestMap;
    return Object.keys(coToCustomObjDesignDigest)
      .reduce((acc, next) => {
        acc[next] = this;
        return acc;
      }, {});
  }
}

module.exports = ModuleDigest;
