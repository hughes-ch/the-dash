/**
 *   Defines the UT authentication server
 *
 *   Not used in production, just in tests to make testing easier
 *   around authentication.
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('./app-config');
const {getJwksRequest} = require('./requests');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const {rest} = require('msw');
const {setupServer} = require('msw/node');

// note these JWKs are for test only
const jwks = require('./jwks.test.json');
exports.utAuthServer = setupServer(
  rest.get(getJwksRequest().url, (req, res, ctx) => {
    return res(ctx.json(jwks));
  }),
);

/**
 * Returns a header with specified params
 *
 * @param {String}  kid  Key ID
 * @param {String}  alg  Algorithm to use
 * @return {Object}
 */
exports.requestHeader = (kid, alg) => {
  return {
    kid: kid || jwks.keys[0].kid,
    alg: alg || jwks.keys[0].alg,
  };
}

/**
 * Requests a payload with the specified params
 *
 * @param {Number}  expiresIn  Time key expires
 * @param {String}  use        Use of key (id)
 * @return {Object}
 */
exports.requestPayload = (expiresIn=3600, use='id') => {
  return {
    token_use: use,
    exp: Math.round((new Date()).valueOf()/1000) + expiresIn,
  };
}

/**
 * Requests full credentials object
 *
 * @param {Object}  header     Header object
 * @param {Object}  payload    Payload object
 * @param {Object}  options    Options (algorithm, audience, issuer, header)
 * @param {Number}  expiresIn  Time this key expires
 * @return {Object}
 */
exports.requestCredentials = (header, payload, options={}, expiresIn=3600) => {
  const tokenPayload = payload || exports.requestPayload(expiresIn);
  const tokenKey = options.key || jwks.keys[0];
  const idToken = jwt.sign(
    tokenPayload,
    jwkToPem(tokenKey, { private: true }),
    {
      algorithm: options.algorithm || header.alg,
      audience: options.audience || config.AUTH_CLIENT_ID,
      issuer: options.issuer || config.AUTH_ISSUER,
      header: header,
    }
  );

  return `#id_token=${idToken}&` +
    `access_token=b&` +
    `expires_in=${expiresIn}&` +
    `token_type=d`;
}

/**
 * Requests a valid token with given expiration time
 *
 * @param {Number}  expiresIn  Expire time
 * @return {Object}
 */
exports.requestValidTokens = (expiresIn=3600) => {
  const header = exports.requestHeader();
  const payload = exports.requestPayload(expiresIn);
  return exports.requestCredentials(header, payload, expiresIn);
}

/**
 * Requests a valid API token
 *
 * @param {Number}  expiresIn  Expire time
 * @return {Object}
 */
exports.requestValidApiToken = () => {
  const header = exports.requestHeader();
  const payload = exports.requestPayload();
  const credentials = exports.requestCredentials(header, payload);
  return credentials.split('&')[0].split('=')[1];
}

/**
 * Requests a valid token EXCEPT for the one option specified
 *
 * @param {Object}  options  Options to break validity of token
 * @return {Object}
 */
exports.requestValidExcept = (options) => {
  if (options.signature) {
    options.key = jwks.keys[1];
  }
  
  return exports.requestCredentials(
    exports.requestHeader(),
    exports.requestPayload(),
    options);
}
