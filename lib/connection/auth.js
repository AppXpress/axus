  const {
    ping
  } = require('./ping');

  const doAuth = (connectionProfiles) => {
    return ping(connectionProfiles.current.toConnectionParams())
      .then((response) => {
        const {
          code,
          error,
          statusType,
          headers
        } = response;
        const token = Token.createFrom(headers);
        connectionProfiles.current.setToken(token);
      });
  };
