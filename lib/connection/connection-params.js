const ConnectionProfiles = require('./profile/connection-profiles');
const ConnectionParamValidator = require('./validate');
const ConnectionPrompt = require('./connection-prompt');
const fs = require('fs');
const ProfileCreationPrompt = require('./profile/profile-creation-prompt');
const ProfileSelectionPrompt = require('./profile/profile-selection-prompt');
const StaticConnectionConfig = require('./static-connection-configuration');

class ConnectionParams {

    static load(out) {
        return ConnectionProfiles
            .load()
            .then((connectionProfiles) => {
                const prompt = connectionProfiles.hasProfiles() ?
                    ProfileSelectionPrompt.newPrompt(out) :
                    ProfileCreationPrompt.newPrompt(out);
                const p = prompt.prompt(connectionProfiles);
                return p.then((result) => {
                    return new Promise((resolve) => {
                        prompt.close();
                        resolve(result);
                    });
                }).catch((reason) => {
                  prompt.close();
                  throw reason;
                });
            });
    }

    static readConfig() {
        const f = StaticConnectionConfig.findConfig();
        const config = StaticConnectionConfig.parseConfig(f);
        ConnectionParams.validate(config);
        return config;
    }

    static validate(conf) {
        return ConnectionParamValidator.validate(conf);
    }

}

module.exports = ConnectionParams;
