/*jshint expr: true*/
const expect = require('chai').expect;
const Bridge = require('../../lib/providers/bridge');
const BaseFetchRequest = require('../../lib/providers/fetch/fetch-request');
const LocalFetchRequest = require('../../lib/providers/fetch/local-fetch-request');
const RestFetchRequest = require('../../lib/providers/fetch/rest-fetch-request');
//const sync = require('synchronize');

describe('Base FetchRequest', () => {
  it('exposes resource()', () => {
    const fetchReq = new BaseFetchRequest();
    expect(fetchReq.resource('')).to.deep.equal(fetchReq);
  });
});

describe.skip('restful fetch request', () => {
    const bridge = new Bridge({
      rest: {
        "username": "",
        "password": "",
        "dataKey": "",
        "url": "https://commerce-supportq.qa.gtnexus.com/rest/"
      }
    }, []);
  it('can fetch', function(done) {
    this.timeout(10000); //give api some time
    const req = new RestFetchRequest(
      bridge,
      '$DocumentPouchC1',
      310,
      '404477900'
    );
    sync.fiber(() => {
      const response = req.execute();
      expect(response).to.be.ok;
      expect(response.__metadata.uid).to.equal('404477900');
      done();
    });
  });
  it('can fetch all attachments', function(done) {
    this.timeout(10000); //give api some time
    const req = new RestFetchRequest(
      bridge,
      '$DocumentPouchC1',
      310,
      '404477900'
    );
    req.resource('attachments');
    sync.fiber(() => {
      const response = req.execute();
      expect(response).to.be.ok;
      expect(response.result.length).to.equal(2);
      done();
    });
  });
  it('can fetch an attachment', function(done) {
    this.timeout(10000); //give api some time
    const req = new RestFetchRequest(
      bridge,
      '$DocumentPouchC1',
      310,
      '404477900'
    );
    req.resource('attachment', '404583599');
    sync.fiber(() => {
      const response = req.execute();
      expect(response).to.be.ok;
      expect(response).to.not.equal(undefined);
      done();
    });
  });
});

describe('local fetch request', () => {
  it('throws 404 on not found', (done) => {
    const req = new LocalFetchRequest({
      store: {}
    }, '$GlobalType', 310, 123);
    expect(req.execute).to.throw(Error);
    done();
  });

  it('reveals resource()', () => {
    const req = new LocalFetchRequest({
      store: {}
    }, '$GlobalType', 310, 123);
    expect(req.resource).to.be.a('function');
  });

  it('returns correctly when type and uid specified', (done) => {
    const bridge = new Bridge({
      local: {
        '$GlobalType': {
          123: {
            attr: 'value'
          }
        }
      }
    }, []);
    const req = new LocalFetchRequest(bridge, '$GlobalType', 310, 123);
    const resp = req.execute();
    expect(resp.attr).to.equal('value');
    done();
  });

  it('supports resource("attachments")', (done) => {
    const bridge = new Bridge({
      local: {
        '$GlobalType': {
          '123/attachments': [{
              "attachmentUid": "1",
          }, {
              "attachmentUid": "2",
          }, {
              "attachmentUid": "3",
          }, {
              "attachmentUid": "4",
          }]
        }
      }
    }, []);
    const req = new LocalFetchRequest(bridge, '$GlobalType', 310, 123);
    req.resource('attachments');
    const resp = req.execute();
    expect(resp.result.length).to.equal(4);
    done();
  });
});
