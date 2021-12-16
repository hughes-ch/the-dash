/**
 *   Defines the authenticatedFunction wrapper
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const authenticate = require("@the-dash/common/authenticate"); 

/**
 * Authorizes client for API request
 *
 * @param {Object}  headers  Headers from request
 * @return {Boolean}
 */
async function isAuthorized(headers) {
  if (!headers.authenticate) {
    return false;
  }

  const [bearer, token] = headers.authenticate.split(' ');
  if (bearer !== 'Bearer') {
    return false;
  }

  return authenticate(token);
}

/**
 * Wrapper for functions that need authentication
 *
 * @param {Object}   event   Event to be handled
 * @param {Object}   context Context of event (not used)
 * @param {Function} handler Event handler
 * @return {Object}
 */
module.exports = function(handler) {
  return async (event, context) => {
    if (!await isAuthorized(event.headers)) {
      return {
        statusCode: 401,
        body: 'Not authorized',
      };
    }
    
    return handler(event);
  };
};
