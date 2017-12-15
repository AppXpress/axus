const ProfileCreationPrompt = require('./profile-creation-prompt');
const Profile = require('./profile');
const Streams = require('../../stream/streams');

const NEW_PROFILE_TOKEN = '#';

/**
 * ProfileSelectionPrompt requires an Interface (as defined by node/readline).
 *
 * This allows the class to leverage a running repl's interface, or create
 * a new one to use on the fly (i.e. before REPL start up).
 *
 */
class ProfileSelectionPrompt extends ProfileCreationPrompt {

  static newPrompt(outstream) {
    return new ProfileSelectionPrompt(Streams.getMutableInterface(outstream));
  }

  constructor(iface) {
    super(iface);
    this._selectProfile = selectProfile.bind(this);
  }

  selectFrom(connectionProfiles) {
    if (!Streams.interfaceIsMutable(this.iface)) {
      throw new TypeError('Interface\'s output stream must be mutable.');
    }
    if (!connectionProfiles || !connectionProfiles.hasProfiles()) {
      return Promise.reject(new Error('No profiles found.'));
    }
    return this._selectProfile(connectionProfiles);
  }

  selectAndComplete(connectionProfiles) {
    return this.selectFrom(connectionProfiles)
      .then(connectionProfiles => {
        if (connectionProfiles.current === Profile.Dummy) {
            return Promise.resolve(connectionProfiles);
        }
        return this.completeProfile(connectionProfiles);
      });
  }

  prompt(connectionProfiles) {
    return this.selectAndComplete(connectionProfiles);
  }

}

function selectProfile(connectionProfiles) {
  const profiles = connectionProfiles.getProfiles();
  const prompt = createPrompt(profiles);
  return new Promise((resolve, reject) => {
    this.iface.question(prompt, (selection) => {
      if (selection === NEW_PROFILE_TOKEN) {
        resolve(this.createNew(connectionProfiles));
      } else if (selection === '!') {
          resolve(this.createDummy(connectionProfiles));
      } else if (isWithinRange(selection, profiles)) {
        connectionProfiles.current = profiles[selection - 1];
        resolve(connectionProfiles);
      } else {
        resolve(this._selectProfile(connectionProfiles));
      }
    });
  });
}

function createPrompt(profiles) {
  const genLine = (text, i) => `${i})\t${text}`;
  const genLineFromProfile = (profile, i) => genLine(profile.name(), i + 1);
  const trailer = [
    genLine('Create New Profile', NEW_PROFILE_TOKEN),
    genLine('Proceed without a profile', '!'),
    ''
  ];
  return profiles.map(genLineFromProfile).concat(trailer).join('\n');
}

function isWithinRange(index, list) {
  const maybeInt = parseInt(index);
  return Number.isInteger(maybeInt) &&
    maybeInt > 0 &&
    maybeInt < (list.length + 1);
}

module.exports = ProfileSelectionPrompt;
