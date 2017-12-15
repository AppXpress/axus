class Profile {

    constructor(fqp, url, username, dataKey) {
        this.fqp = fqp;
        this.url = url;
        this.username = username;
        this.dataKey = dataKey;
        this.password = null;
    }

    toString() {
        return `Profile :: ${this.fqp} -> ${this.url} -> ${this.username} -> ${this.dataKey}`;
    }

    name() {
        return this.fqp.join(':');
    }

    fullyQualifiedPath() {
        return this.fqp;
    }

    localPath() {
      return this.fqp.length >= 2 ?
        this.fqp.slice(this.fqp.length -2)
        : this.fqp; // if we're smaller than two, its probably illegal,
               // but we'll let connection-profiles handle that.
    }

    directionsToLocalPath() {
      return this.fqp.length >= 2 ?
        this.fqp.slice(0, this.fqp.length -2)
        : []; // in this case u dont need directions. empty array is ok.
    }

    validate() {
        return ConnectionParams.validate(this, ['url', 'username', 'dataKey']);
    }

    toConnectionParams() {
        return {
            url: this.url,
            username: this.username,
            dataKey: this.dataKey,
            password: this.password
        };
    }

}

Profile.Dummy = new Profile();
module.exports = Profile;
