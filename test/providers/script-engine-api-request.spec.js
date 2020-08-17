/*jshint expr: true*/
const expect = require('chai').expect;
//const sync = require('synchronize');
const Bridge = require('../../lib/providers/bridge');
const Providers = require('../../lib/providers/providers');
const RestScriptEngineApiRequest = require('../../lib/providers/api/rest-script-engine-api-request');
const conf = require('../../lib/connection/connection-params').readConfig();

const apiVersion = '3.1.0'
const seed = {
  local: {
    "rest/310/MasterData/ShipmentMethod/data/query?oql=code='S'": {
      "data": {
        "__metadata": {
          "apiVersion": "3.1",
          "type": "MasterData",
          "fingerprint": "db679fff9cb375c6dfb6cfdd25ea6235",
          "self": "https://...gtnexus.com/rest/3.1.0/MasterData/ShipmentMethod/data/query?oql=code%3D%27S%27"
        },
        "dataType": "ShipmentMethod",
        "name": "ShipmentMethod",
        "lang": "en_US",
        "field": {
          "code": 0,
          "name": 1
        },
        "value": {
          "S": {
            "value": [
              "S",
              "Ocean"
            ]
          }
        }
      }
    },
    "rest/3.1/MasterData2/ShipmentMethod/data?oql=code='S'": {
      "data": {
        "__metadata": {
          "apiVersion": "3.1",
          "type": "ShipmentMethod",
          "fingerprint": "a17386ea8c39143915f4e1726c46b41d",
          "self": "https://...gtnexus.com/rest/3.1.0/MasterData2/ShipmentMethod/data/query"
        },
        "values": [
          {
            "code": "S",
            "name": "Ocean"
          }
        ]
      }
    },
    "rest/310/OrganizationDetail/0000000000000001": {
      "organizationId": "0000000000000001",
      "division": [
        {
          "divisionUid": "00001",
          "name": "OrganizationDivisionName",
          "legalName": "Legal Name",
          "organizationUid": "00000001"
        }
      ],
      "organizationTypeCode": "TradeCustomer",
      "name": "OrganizationName",
      "organizationStatusCode": "Enabled",
      "notes": "notes",
      "contact": {
        "emailAddress": "nobody@gtnexus.com"
      },
      "address": {
        "addressLine1": "Street 1",
        "city": "CITY",
        "countryCode": "US"
      },
      "locale": "en_US",
      "organizationProperty": {
        "AdminUserId": "00000001",
        "SecurityProfileType": "defaultProfile",
        "IsSellerRole": "true",
        "IsPostExportRequestRequired": "false",
        "SiteHome": "gtnexus"
      },
      "secondFactorRequirementLevel": "Optional",
      "allowedSecondFactorTypes": [
        "PhysicalEid",
        "VirtualEid"
      ],
      "defaultSecondFactorType": "VirtualEid",
      "__metadata": {
        "apiVersion": "3.1",
        "type": "OrganizationDetail",
        "uid": "0000000000000001",
        "createTimestamp": "YYYY-MM-DD HH:MM:SS.sss",
        "modifyTimestamp": "YYYY-MM-DD HH:MM:SS.sss",
        "fingerprint": "XXXXXXX",
        "self": "https://...gtnexus.com/rest/3.1.0/OrganizationDetail/0000000000000001"
      }
    },
    "rest/3.1/OrderDetail/00000001/actionHistory": {
      "__metadata": {
        "apiVersion": "3.1",
        "type": "OrderDetail",
        "self": "https://...gtnexus.com/rest/3.1.0/OrderDetail/00000001/actionHistory"
      },
      "resultInfo": {
        "count": 3,
        "hasMore": false,
        "offset": 0,
        "firstRowNumber": 1,
        "estimatedTotalCount": 3
      },
      "result": [
        {
          "uid": "00000001",
          "action": "create",
          "createDateTime": "YYYY-MM-DDTHH:MM:SSZ",
          "userId": "user",
          "userLogin": "user",
          "userFullName": "user",
          "memberId": "0000000000000001"
        },
        {
          "uid": "00000002",
          "action": "modify",
          "createDateTime": "YYYY-MM-DDTHH:MM:SSZ",
          "userId": "user",
          "userLogin": "user",
          "userFullName": "user",
          "memberId": "0000000000000001"
        },
        {
          "uid": "00000003",
          "action": "sign",
          "createDateTime": "YYYY-MM-DDTHH:MM:SSZ",
          "userId": "user",
          "userLogin": "user",
          "userFullName": "user",
          "memberId": "0000000000000001"
        }
      ]
    }
  }
}

const lProviders = new Providers(
  new Bridge(seed, apiVersion)
);

describe.skip('RestScriptEngineApiRequest', () => {
  it('can hit the api', function (done) {
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
describe('LocalScriptEngineApiRequest', () => {
  it('can hit a local api store', function (done) {
    const result1 = lProviders.getDataApiProvider().get('rest/310/MasterData/ShipmentMethod/data/query').withParameter('oql', "code='S'").execute();
    const result2 = lProviders.getDataApiProvider().get('rest/3.1/MasterData2/ShipmentMethod/data').withParameter('oql', "code='S'").execute();
    const result3 = lProviders.getDataApiProvider().get('rest/310/OrganizationDetail/0000000000000001').execute();
    const result4 = lProviders.getDataApiProvider().get('rest/3.1/OrderDetail/00000001/actionHistory').execute();
    expect(result1).to.deep.equal({
      "data": {
        "__metadata": {
          "apiVersion": "3.1",
          "type": "MasterData",
          "fingerprint": "db679fff9cb375c6dfb6cfdd25ea6235",
          "self": "https://...gtnexus.com/rest/3.1.0/MasterData/ShipmentMethod/data/query?oql=code%3D%27S%27"
        },
        "dataType": "ShipmentMethod",
        "name": "ShipmentMethod",
        "lang": "en_US",
        "field": {
          "code": 0,
          "name": 1
        },
        "value": {
          "S": {
            "value": [
              "S",
              "Ocean"
            ]
          }
        }
      }
    });
    expect(result2).to.deep.equal({
      "data": {
        "__metadata": {
          "apiVersion": "3.1",
          "type": "ShipmentMethod",
          "fingerprint": "a17386ea8c39143915f4e1726c46b41d",
          "self": "https://...gtnexus.com/rest/3.1.0/MasterData2/ShipmentMethod/data/query"
        },
        "values": [
          {
            "code": "S",
            "name": "Ocean"
          }
        ]
      }
    });
    expect(result3).to.deep.equal({
      "organizationId": "0000000000000001",
      "division": [
        {
          "divisionUid": "00001",
          "name": "OrganizationDivisionName",
          "legalName": "Legal Name",
          "organizationUid": "00000001"
        }
      ],
      "organizationTypeCode": "TradeCustomer",
      "name": "OrganizationName",
      "organizationStatusCode": "Enabled",
      "notes": "notes",
      "contact": {
        "emailAddress": "nobody@gtnexus.com"
      },
      "address": {
        "addressLine1": "Street 1",
        "city": "CITY",
        "countryCode": "US"
      },
      "locale": "en_US",
      "organizationProperty": {
        "AdminUserId": "00000001",
        "SecurityProfileType": "defaultProfile",
        "IsSellerRole": "true",
        "IsPostExportRequestRequired": "false",
        "SiteHome": "gtnexus"
      },
      "secondFactorRequirementLevel": "Optional",
      "allowedSecondFactorTypes": [
        "PhysicalEid",
        "VirtualEid"
      ],
      "defaultSecondFactorType": "VirtualEid",
      "__metadata": {
        "apiVersion": "3.1",
        "type": "OrganizationDetail",
        "uid": "0000000000000001",
        "createTimestamp": "YYYY-MM-DD HH:MM:SS.sss",
        "modifyTimestamp": "YYYY-MM-DD HH:MM:SS.sss",
        "fingerprint": "XXXXXXX",
        "self": "https://...gtnexus.com/rest/3.1.0/OrganizationDetail/0000000000000001"
      }
    });
    expect(result4).to.deep.equal({
      "__metadata": {
        "apiVersion": "3.1",
        "type": "OrderDetail",
        "self": "https://...gtnexus.com/rest/3.1.0/OrderDetail/00000001/actionHistory"
      },
      "resultInfo": {
        "count": 3,
        "hasMore": false,
        "offset": 0,
        "firstRowNumber": 1,
        "estimatedTotalCount": 3
      },
      "result": [
        {
          "uid": "00000001",
          "action": "create",
          "createDateTime": "YYYY-MM-DDTHH:MM:SSZ",
          "userId": "user",
          "userLogin": "user",
          "userFullName": "user",
          "memberId": "0000000000000001"
        },
        {
          "uid": "00000002",
          "action": "modify",
          "createDateTime": "YYYY-MM-DDTHH:MM:SSZ",
          "userId": "user",
          "userLogin": "user",
          "userFullName": "user",
          "memberId": "0000000000000001"
        },
        {
          "uid": "00000003",
          "action": "sign",
          "createDateTime": "YYYY-MM-DDTHH:MM:SSZ",
          "userId": "user",
          "userLogin": "user",
          "userFullName": "user",
          "memberId": "0000000000000001"
        }
      ]
    });
    done();
  });
});
