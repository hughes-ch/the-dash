/**
 *   Defines common request utilities
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { AbortController } = require('abort-controller');
const config = require('./app-config');
const fetch = require('node-fetch').default;

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
      
  const protocol = typeof window !== 'undefined' ?
        window.location.protocol : 'https:';
  const host = typeof window !== 'undefined' ?
        window.location.host : config.APP_NAME;
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

/**
 * Returns a cookie that contains the site credentials
 *
 * @return {String}
 */
exports.getCredentialCookie = () => {
  const cookies = document.cookie.split(';');
  const creds = cookies.find(
    e => e.split('=')[0].trim() === config.CREDENTIAL_COOKIE);

  return creds ? creds.split('=')[1] : '';
}

/**
 * Returns a request to GET all sites
 *
 * @param {String}  heldToken  API token
 * @return {String} 
 */
exports.getSiteListRequest = heldToken => {
  const apiToken = heldToken ? heldToken : exports.getCredentialCookie();
  return {
    url: exports.absoluteUrl(`/sites`),
    data: {
      method: 'GET',
      headers: {
        authenticate: `Bearer ${apiToken}`,
      },
    },
  };
}

/**
 * Returns a request to get status of single application
 *
 * @param {String}  app        Requested app
 * @param {String}  heldToken  API token
 * @return {String} 
 */
exports.getApplicationRequest = (app, heldToken) => {
  const apiToken = heldToken ? heldToken : exports.getCredentialCookie();
  return {
    url: exports.absoluteUrl(`/site/${app}`),
    data: {
      method: 'GET',
      headers: {
        authenticate: `Bearer ${apiToken}`,
      },
    },
  };
}

/**
 * Fetches with a timeout
 *
 * @param {String}  url   URL to fetch
 * @param {Object}  data  Request parameters
 * @return {Object}
 */
exports.fetchWithTimeout = async (url, data) => {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, config.LONG_RUNNING_FETCH_TIMEOUT);
  
  const fetchParams = data ? data : {};
  fetchParams.signal = abortController.signal;
  const response = await fetch(url, fetchParams);
  clearTimeout(timeoutId);
  return response;
}

