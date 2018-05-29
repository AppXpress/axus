const expect = require('chai').expect;

const Token = require('../../lib/connection/token');

describe.only('Token', function () {
    describe('createFrom', function () {
        it('correctly creates a Token from a unirest response headers obj', function () {
            const tokenStr = 'dXNyPWpvaG4uZG9ub3ZhbkBndG5leHVzLCB0b2tlbj1DQzoxMC9mNDcyYjk4NmNlMDUzNDlkMzYyNzc0OTFhMDNiZDUwZDQzNTA3OGZi';
            const headers = {
                authorization: `Token ${tokenStr}`
            };
            const token = Token.createFrom(headers);
            expect(token.token).to.equal(tokenStr);
        });
    });
});