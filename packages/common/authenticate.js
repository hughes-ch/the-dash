/**
 *   Defines the authenticate method
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { absoluteUrl, getJwksRequest } = require('./requests.js');
const config = require('./app-config');
const fetch = require('node-fetch');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');

/**
 * Decodes a Base64 string (works in node and browser)
 *
 * @param {String}  string  String to decode
 * @return {String}
 */
function base64Decode(string) {
  try {
    return atob(string);
  } catch(err) {
    const buf = Buffer.from(string, 'base64');
    return buf.toString();
  }
}

/**
 * Gets the JWK from AWS
 *
 * @return {Object} 
 */
async function fetchJwks() {
  try {
    const jwksRequest = getJwksRequest();
    const response = await fetch(jwksRequest.url);
    if (!response.ok) {
      return null;
    }

    return await response.json();
    
  } catch(err) {
    console.log(err);
    return null;
  }
}

/**
 * Authenticates the token 
 *
 * @param {String}  token  Encoded bearer token 
 * @return {Boolean}
 */
async function authenticate(token) {
  // Split token to verify structure
  if (!token) {
    return false;
  }
  
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    return false;
  }

  // Verify base64 encoding
  let decodedHeader;
  let decodedPayload;
  try {
    decodedHeader = JSON.parse(base64Decode(header));
    decodedPayload = JSON.parse(base64Decode(payload));
  } catch (err) {
    return false;
  }

  // Verify KID 
  const jwks = await fetchJwks();
  if (!jwks) {
    return false;
  }

  const jwk = jwks.keys.find(e => e.kid === decodedHeader.kid);
  if (!jwk) {
    return false;
  }

  // Verify signature
  const pem = jwkToPem(jwk);
  try {
    jwt.verify(token, pem, { algorithms: [jwk.alg] });
  } catch (err) {
    return false;
  }

  // Verify time hasn't expired
  if (decodedPayload.exp <= (new Date()).valueOf()/1000) {
    return false;
  }

  // Verify aud matches app client ID
  if (decodedPayload.aud !== config.AUTH_CLIENT_ID) {
    return false;
  }
  
  // Verify iss matches user pool
  if (decodedPayload.iss !== config.AUTH_ISSUER) {
    return false;
  }
  
  // Verify token_use as either id or access
  return decodedPayload.token_use === 'id';
}

module.exports = authenticate;
