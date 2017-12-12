const Profile = require('./profile');
const ConnectionProfiles = require('./connection-profiles');
const ProfilePrompt = require('../profile-prompt');
const Streams = require('../../stream/streams');

const CREATE_NEW_FILE_MSG =
`
It looks like you don't have a connection-profile file.

If you know you do, please quit axus and make sure it is located at:
~/.appxpress/connection-profiles.json

Otherwise, lets create one!\n\n`;

class ProfileCreationPrompt extends ProfilePrompt {

    static newPrompt(outstream) {
        return new ProfileCreationPrompt(Streams.getMutableInterface(outstream));
    }

    constructor(iface) {
        super(iface);
        this._askToNameProfile = askToNameProfile.bind(this);
    }

    prompt(connectionProfiles) {
        return this.createNew(connectionProfiles);
    }

    createNew(connectionProfiles) {
        if(connectionProfiles.hasProfiles()) {
          this.iface.output.write(`Lets create a new profile.\n`);
        } else {
          this.iface.output.write(CREATE_NEW_FILE_MSG);
        }
        connectionProfiles.current = new Profile();
        return this.completeProfile(connectionProfiles)
            .then(this._askToNameProfile)
            .then((prObj) => {
                return createAndSetCurrent(connectionProfiles, prObj);
            });
    }
}

function askToNameProfile(prObj) {
    return new Promise((resolve) => {
        this.iface.question('Profile Name: ', (name) => {
            const fqp = name.split(':');
            if(fqp.length < 2) {
              this.iface.output.write('Name must be qualified. Please try something like ${envType}:${envName}\n');
              resolve(this._askToNameProfile(prObj));
              return;
            }
            prObj.fqp = fqp;
            resolve(prObj);
        });
    });
}

function createAndSetCurrent(connectionProfiles, prObj) {
    return new Promise((resolve) => {
        const {
            fqp,
            url,
            username,
            dataKey,
            password
        } = prObj;
        const profile = new Profile(fqp, url, username, dataKey);
        profile.password = password;
        connectionProfiles.addProfile(profile);
        connectionProfiles.current = profile;
        connectionProfiles.write();
        resolve(connectionProfiles);
    });
}

module.exports = ProfileCreationPrompt;
