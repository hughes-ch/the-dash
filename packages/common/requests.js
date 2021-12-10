/**
 *   Defines common request utilities
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('./app-config');

/**
 * Returns the absolute URL of a relative URL
 *
 * @param {String} url Relative URL
 * @return {String}
 */
exports.absoluteUrl = (url) => {
  if (url.includes('http')) {
    return url; 
  }
      
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}${url}`;
}

/**
 * Returns a request to GET JWKs from AWS
 *
 * @return {Object}
 */
exports.getJwksRequest = () => {
  return {
    url: exports.absoluteUrl(`${config.AUTH_ISSUER}/.well-known/jwks.json`),
    data: {},
  };
}

