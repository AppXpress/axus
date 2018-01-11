module.exports = class Token {

  constructor(token, creationDate = new Date()) {
    this.token = token;
    this.creationDate = creationDate;
  }

  isValid(profile) {
    return new Promise((resolve, reject) => {
      if (!this.token) {
        resolve(false); //or reject?
      }
      return pingWithProfile(profile, true);
    }).catch((err) => {
      resolve(false);
    });

  }

  static createFrom(headers) {
    const {
      authorization,
      date: dateString
    } = headers;
    if (!authorization) {
      throw new Error('Cannot create Session Token from Header without \'authorization\'');
    }
    return new Token(parseToken(authorization), convertDateString(dateString));
  }
};

function parseToken(authorization) {
  const authParts = authorization.split(' ');
  if (authParts[0] !== 'Token') {
    console.log(authParts[0]);
    throw new Error('authorization Header is missing Token');
  }
  return authParts[1];
}

function convertDateString(dateString) {
  if (!dateString) {
    return new Date();
  }
  try {
    return new Date(dateString);
  } catch (e) {
    return null;
  }
}
