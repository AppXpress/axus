const range  = (start, end) => {
  const length = Math.abs(end - start) + 1;
  const step = start <= end ? 1 : -1;
  return Array.from({length}, (v, i) => start + step * i);
};

const inAscRange = (range, elem) =>
  elem >= range[0] && elem <= range[range.length -1];

const SUCCESFUL    = range(200, 299);
const REDIRECTION  = range(300, 399);
const CLIENT_ERROR = range(400, 499);
const SERVER_ERROR = range(500, 599);

const isSuccesful   = (statusCode) => inAscRange.bind(null, SUCCESFUL);
const isRedirection = (statusCode) => inAscRange.bind(null, REDIRECTION);
const isClientError = (statusCode) => inAscRange.bind(null, CLIENT_ERROR);
const isServerError = (statusCode) => inAscRange.bind(null, SERVER_ERROR);

const errorMessageMap = new Map([
  [400, '400 Bad Request: This is either a problem with your profile, or an issue with axus itself'],
  [401, '401 Unauthorized: are you sure your profile has the right credentials?'],
  [404, '404 Not Found: The requested resource was not found on this server']
]);

const hasSpecificErrorMsg = errorMessageMap.has.bind(errorMessageMap);
const getSpecificErrorMsg = errorMessageMap.get.bind(errorMessageMap);

exports.errorMessage = (statusCode) => {
  if(hasSpecificErrorMsg(statusCode)) {
    return getSpecificErrorMsg(statusCode);
  }
  if(isClientError(statusCode)) {
    return `${statusCode}: Client Error`;
  }
  if(isServerError(statusCode)) {
    return `${statusCode}: Server Error`;
  }
};
