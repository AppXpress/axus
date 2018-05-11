/*jshint expr: true*/
const expect = require('chai').expect;
const axus = require('../lib/appx-test-support');

describe('axus-test-support', () => {

  it('correctly loads a vanilla script', (done) => {
    let ctx = axus.requireLocal('./test/resources/vanilla/jake.js').seed();
    let jake = axus.requireRest('./test/resources/vanilla/jake.js', 'jake');
    expect(ctx).to.be.defined;
    expect(jake).to.be.defined;
    expect(ctx.jake).to.deep.equal(jake);
    expect(jake.isADog).to.be.ok;
    done();
  });

  it('correctly loads a directory of vanilla', (done) => {
    let ctx = axus.requireLocal('./test/resources/vanilla').seed();
    let jake = axus.requireRest('./test/resources/vanilla/jake.js', 'jake');
    expect(ctx).to.be.defined;
    expect(ctx.jake).to.be.defined;
    expect(ctx.jake).to.deep.equal(jake);
    done();
  });

  it('correctly loads a script after overrideLib', (done) => {
    let ctx = axus
      .overrideLib('./test/resources/vanilla/')
      .requireLocal('./test/resources/libimport/jake.js');
    expect(ctx.adventure).to.be.defined;
    done();
  });

  it('correctly loads a module directory', (done) => {
    let ctx = axus.requireLocal('./test/resources/testModule').seed();
    expect(ctx).to.be.defined;
    expect(ctx.obiWan).to.be.defined;
    expect(ctx.Providers.bridge.getModuleDigestForType('$testTableQ1')).to.be.defined;
    done();
  });

  it('contextualizes providers.', (done) => {
    let ctx = axus
      .requireLocal('./test/resources/vanilla/loginfo.js')
      .seed();
    let ctx2 = axus
      .requireLocal('./test/resources/vanilla/loginfo.js')
      .seed();
    ctx.info();
    let msgs = ctx.Providers.getMessageProvider().getMessages();
    expect(msgs.length).to.equal(1);
    expect(ctx2.Providers.getMessageProvider().getMessages().length).to.not.be.ok;
    done();
  });

  it('correctly loads a custom appx module', (done) => {
    let ctx = axus.requireLocal('./test/resources/testModule').seed();
    let obiWan = axus.requireRest('./test/resources/testModule', 'obiWan');
    expect(ctx).to.be.defined;
    expect(ctx.obiWan).to.be.defined;
    expect(ctx.obiWan).to.deep.equal(obiWan);
    done();
  });

  it('correctly loads a custom appx module configurations', (done) => {
    let ctx = axus.requireLocal('./test/resources/testModule').seed();
    expect(ctx).to.be.defined;
    expect(ctx.Providers.configurations).to.be.defined;
    done();
  });

  describe('require', () => {
    it('works the same as requireLocal', () => {
      let ctx = axus.require('./test/resources/testModule').useLocal();
      expect(ctx.Providers).to.be.defined;
    });

    it('allows the consumption and lookup of additional digests', () => {
     let ctx = axus
      .require('./test/resources/testModule')
      .addToContext({console: console})
      .dependsOn('./test/resources/RequiredDocsTable')
      .useLocal();
     ctx.testCustomTableProviderDependency();
    });
  });

  describe('defrost', () => {
    it('automatically defrosts resources, when we have their DD', () => {
      let pkm = axus.defrost('./test/resources/pkm.json');
      expect(pkm.reopenCount).to.be.a('number');
    });
  });

  describe('registerV310Type', () => {
    it('can register new types', () => {
      const parcelTrackerDesign = require('./resources/designs/parcel-tracker.json');
      axus.registerV310Type('$ParcelTrackerS1', parcelTrackerDesign);
      const parcelTrackerInstance = axus.defrost('./test/resources/parcel-tracker.json');
      expect(parcelTrackerInstance.dateCreated).to.be.a('date');
    });
  });

  describe('register API version', () => {
    it('can default contextualized API binding', () => {
      let ctx = axus.require('./test/resources/testModule').useLocal();
      expect(ctx.Providers.bridge.apiVersion).to.equal('310');
    });

    it('can register contextualized API bindings', () => {
      let ctx1 = axus.require('./test/resources/testModule').useApiVersion('3.1.0').useLocal();
      let ctx2 = axus.require('./test/resources/testModule').useApiVersion('3.2.0').useRest();

      expect(ctx1.Providers.bridge.apiVersion).to.equal('3.1.0');
      expect(ctx2.Providers.bridge.apiVersion).to.equal('3.2.0');
    });
  });

});
