const REQUIRED_ATTRIBUTES = ['username', 'password', 'dataKey', 'url'];

const getMissingAttributes = (c, req = REQUIRED_ATTRIBUTES) => {
  return req.filter((item) => {
      const v =  !(c.hasOwnProperty(item) && c[item]);
      return v;
  });
};

const validate = (c, req = REQUIRED_ATTRIBUTES) => {
  if(!c) {
    throw new Error('Cannot validate null connection parameter');
  }
  const missing = getMissingAttributes(c, req);
  if (missing.length) {
      throw new Error('appx.config is missing the following:\n' +
          JSON.stringify(missing));
  }
};

exports.REQUIRED_ATTRIBUTES = REQUIRED_ATTRIBUTES;
exports.getMissingAttributes = getMissingAttributes;
exports.validate = validate;
