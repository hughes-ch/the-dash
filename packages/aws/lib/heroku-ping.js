/**
 *   Defines the function for ping'ing heroku sites to wake them up 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { fetchWithTimeout } = require('@the-dash/common/requests');
const { getApiToken, getSites } = require('./api');

/**
 * Pings a website
 *
 * @param {String}  name   Name of website
 * @return {Object}
 */
async function ping(name) {
  try {
    return fetchWithTimeout(`https://${name}`);

  } catch(err) {
    console.log(`Error pinging ${name}: ${err}`);
  }
}

/**
 * Entry point into AWS lambda
 */
module.exports = async function(event, context) {
  const apiToken = await getApiToken();
  if (!apiToken) {
    console.log('Could not get AWS access token');
    return;
  }

  const entries = await getSites(apiToken);
  return Promise.all(entries.map(async e => ping(e)));
};
