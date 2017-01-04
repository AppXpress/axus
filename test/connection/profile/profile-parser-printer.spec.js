const expect = require('chai').expect;
const ConnectionProfiles = require('../../../lib/connection/profile/connection-profiles');
const Parser = require('../../../lib/connection/profile/profile-parser');
const Printer = require('../../../lib/connection/profile/profile-printer');

const profileFileContents = {
    "qa": {
        "supq": {
            "url": "https://commerce-supportq.qa.gtnexus.com/rest/",
            "profiles": {
                "supq-admin": {
                    "username": "john.donovan@gtnexus",
                    "dataKey": "86f169071a3c5a16812fa8d089f871d0f4d7cc4d"
                }
            }
        }
    }
};

describe('ProfileParse and ProfileWriter', () => {
    const profiles = Parser.parse(profileFileContents, ConnectionProfiles.newCollection());
    describe('ProfileParser', () => {
        describe('parse', () => {
            it('can parse a single profile', () => {
                expect(profiles.hasProfiles()).to.equal(true);
                expect(profiles.size).to.equal(1);
                expect(profiles.hasAProfileWithFqp(['qa', 'supq', 'supq-admin'])).to.equal(true);
            });
        });
    });
    describe('ProfileWriter', () => {
      describe('write', () => {
        it('can rewrite the single profile that was parsed', () => {
          expect(Printer.print(profiles.profiles)).to.deep.equal(profileFileContents);
        });
      });
    });
});
