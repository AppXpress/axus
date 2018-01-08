const expect = require('chai').expect;

const ConnectionParams = require('../../lib/connection/connection-params');

describe('ConnectionParams', () => {
    describe('validate', () => {
        it('does not throw on correct params obj', () => {
            const params = {
                username: 'John',
                password: '432bf30cec437eca88c2c356ee77dfdcd042ea0d',
                dataKey: '2ab257c0355d75294f54cd40b8aa224bc569eac3',
                url: 'https://commerce-demo.gtnexus.com/rest/'
            };
            ConnectionParams.validate(params);
        });
        it('throws error when params is missing value', () => {
          const params = {
              password: '432bf30cec437eca88c2c356ee77dfdcd042ea0d',
              dataKey: '2ab257c0355d75294f54cd40b8aa224bc569eac3',
              url: 'https://commerce-demo.gtnexus.com/rest/'
          };
          const validFn = ConnectionParams.validate.bind(null, params);
          expect(validFn).to.throw(/profile is missing the following:/);
        });
    });
});
