/**
 *   Defines a website handler 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const fetch = require('node-fetch');
const { getAllEntriesInDb,
        deleteItem,
        getItem,
        putItem } = require('./dynamodb');

/**
 * Parses the resource from the URL
 * 
 * @param {String}  url  URL
 * @return {String}
 */
function parseResource(url) {
  const splitUrl = url.split('/');
  if (splitUrl.length <= 2) {
    splitUrl.push('');
  }
  return splitUrl[splitUrl.length-1];
}

/**
 * Verifies if the string is safe (valid DNS chars only)
 *
 * @param {String}  str  String to test
 * @return {Boolean}
 */
function isDangerousString(str) {
  return !str || /[^.-\w]/.test(str);
}

/**
 * Runs function. Returns 500 status on error
 *
 * @param {Function}  func
 * @return {Object}
 */
async function return500OnErr(func) {
  try {
    return await func();
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
}

/**
 * Gets the app name without any dangerous characters or string literals
 * 
 * @param {String}  path  Relative URL
 * @return {String}
 */
function getSafeAppName(path) {
  const resourceName = parseResource(path);
  if (isDangerousString(resourceName)) {
    throw new Error(`Malformed resource name: ${resourceName}`);
  }
  return resourceName;
}

/**
 * Determines whether the requested resource is down
 * 
 * @param {String}  url  URL to ping
 * @return {Boolean}
 */
async function isSiteDown(url) {
  try {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, config.LONG_RUNNING_FETCH_TIMEOUT);
               
    const response = await fetch(`https://${url}`, {
      signal: abortController.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      console.log(`Site is down. Got ${response.status}`);
    }
    return !response.ok;
    
  } catch (err) {
    console.log(`Site is down. Got ${err}`);
    return true;
  }
}

/**
 * Pings existing website, updates the database, and returns status
 *
 * @param {Object}  event  Event that triggered this function
 * @return {Object}
 */
async function visitWebsite(event, generateKnownContent) {
  return return500OnErr(async () => {
    const appName = getSafeAppName(event.path);
    const item = await generateKnownContent(appName);
    if (!item) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }

    const isCurrentlyDown = item.isDown;
    item.isDown = await isSiteDown(appName);
    item.name = appName;

    const now = new Date();
    item.lastStatusUpdate = now.toUTCString();
    if (isCurrentlyDown !== item.isDown) {
      item.lastStatusChange = now.toUTCString();
    }
    if (!item.nextAutomatedUpdate ||
        new Date(item.nextAutomatedUpdate) - now < 0) {
      
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
  });
}

/**
 * Adds a new website
 * 
 * @param {Object}  event  Event that triggered this function
 * @return {Object}
 */
exports.addNewWebsite = async function(event) {
  return visitWebsite(event, async (appName) => {
    return {
      name: undefined,
      isDown: undefined,
      lastStatusChange: undefined,
      lastStatusUpdate: undefined,
      nextAutomatedUpdate: undefined,
    };
  });
}

/**
 * Updates an existing website
 *
 * @param {Object}  event  Event that triggered this function
 * @return {Object}
 */
exports.updateExisting = async function(event) {
  return visitWebsite(event, async (appName) => {
    return await getItem(appName);
  });
}

/**
 * Deletes an existing website
 * 
 * @param {Object}  event  Event that triggered this function
 * @return {Object}
 */
exports.deleteWebsite = async function(event) {
  return return500OnErr(async () => {
    const appName = getSafeAppName(event.path);
    const item = await getItem(appName);
    if (!item) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }

    await deleteItem(appName);

    return {
      statusCode: 200,
      body: JSON.stringify({
        sites: await getAllEntriesInDb(),
      }),
    };
  });  
};
