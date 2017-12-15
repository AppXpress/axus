/*jshint expr: true*/
const expect = require('chai').expect;
const sync = require('synchronize');
const RestScriptEngineApiRequest = require('../../lib/providers/api/rest-script-engine-api-request');
//const conf = require('../../lib/connection/connection-params').readConfig();


describe.skip('RestScriptEngineApiRequest', () => {
  it('can hit the api', function(done) {
    this.timeout(10000);
    const request = new RestScriptEngineApiRequest('rest/310/MasterData/city', {
      config: conf
    });
    sync.fiber(() => {
      const result = request
        .withParameter('oql', 'city="QUEBEC"')
        .execute();
      expect(result).to.be.ok;
      done();
    });

  });
});
