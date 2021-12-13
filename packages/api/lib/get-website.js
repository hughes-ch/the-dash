/**
 *   Defines the function for GET /sites/<website>
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const fetch = require('node-fetch');
const { getItem, putItem } = require('./dynamodb');

/**
 * Parses the resource from the URL
 * 
 * @param {String}  url  URL
 * @return {String}
 */
function parseResource(url) {
  const splitUrl = url.split('/');
  return splitUrl[splitUrl.length-1];
}

/**
 * Verifies if the string is safe (valid DNS chars only)
 *
 * @param {String}  str  String to test
 * @return {Boolean}
 */
function isDangerousString(str) {
  return /[^.-\w]/.test(str);
}

/**
 * Determines whether the requested resource is down
 * 
 * @param {String}  url  URL to ping
 * @return {Boolean}
 */
async function isSiteDown(url) {
  try {
    const response = await fetch(`https://${url}`);
    return !response.ok;
  } catch (err) {
    return true;
  }
}

/**
 * Entry into Netlify function
 */
module.exports = async function(event) {
  try {
    const resourceName = parseResource(event.path);
    if (isDangerousString(resourceName)) {
      throw new Error(`Malformed resource name: ${resourceName}`);
    }

    const item = await getItem(resourceName);
    if (!item) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }

    const isCurrentlyDown = item.isDown;
    item.isDown = await isSiteDown(item.name);

    const now = new Date();
    item.lastStatusUpdate = now.toUTCString();
    if (isCurrentlyDown !== item.isDown) {
      item.lastStatusChange = now.toUTCString();
    }
    if (new Date(item.nextAutomatedUpdate) - now < 0) {
      const nextUpdateTime = new Date();
      nextUpdateTime.setHours(
        nextUpdateTime.getHours() + config.AUTOMATED_PING_RATE);
      item.nextAutomatedUpdate = nextUpdateTime.toUTCString();
    }

    await putItem(item);

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };

  // Error encountered when establishing connection to database
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
}
