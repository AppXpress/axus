const expect = require('chai').expect;

const ConnectionProfiles = require('../../../lib/connection/profile/connection-profiles');
const Profile = require('../../../lib/connection/profile/profile');

describe('ConnectionProfiles', () => {

    const p = new Profile(['a', 'b', 'c'], 'url', 'name', 'dataKey');
    const p2 = new Profile(['a', 'b', 'd'], 'url', 'name2', 'dataKey2');

    const connectionProfiles = ConnectionProfiles
        .newCollection()
        .addProfile(p)
        .addProfile(p2);

    it('can report on the nodes it has', () => {
        expect(connectionProfiles.size).to.equal(2);
        expect(connectionProfiles.hasProfile(p)).to.equal(true);
        expect(connectionProfiles.hasProfile(p2)).to.equal(true);
    });

    it('can return a flattened array of its prefix tree', () => {
        const allProfiles = connectionProfiles.getProfiles();
        expect(allProfiles).to.be.a('array');
        expect(allProfiles).to.have.length(2);
        expect(allProfiles[0]).to.deep.equal(p);
        expect(allProfiles[1]).to.deep.equal(p2);
    });

    it('errors on duplicates', () => {
      const p3 = new Profile(['a', 'b', 'd'], 'url', 'name', 'dataKey');
      const attempt = () => connectionProfiles.addProfile(p3);
      expect(attempt).to.throw(/^Profile/);
    });

    it('errors on different urls in the same neighborhood', () => {
      const p3 = new Profile(['a', 'b', 'e'], 'url2', 'name', 'dataKey');
      const attempt = () => connectionProfiles.addProfile(p3);
      expect(attempt).to.throw(/^Nested namespaces/);
    });

    it('errors on illegal nesting', () => {
      const p3 = new Profile(['a', 'b'], 'url', 'name', 'dataKey');
      const attempt = () => connectionProfiles.addProfile(p3);
      expect(attempt).to.throw(/^Illegal Nesting Structure/);
    });

    describe('toWritable', () => {
        const expectedTree = {
            'a': {
                'b': {
                    'url': 'url',
                    'profiles': {
                        'c': {
                          'username': 'name',
                          'dataKey': 'dataKey'
                        },
                        'd': {
                          'username': 'name2',
                          'dataKey': 'dataKey2'
                        }
                    }
                }
            }
        };
        it('can write', () => {
            const result = connectionProfiles.toWritable();
            expect(expectedTree).to.deep.equal(result);
        });
    });

});
