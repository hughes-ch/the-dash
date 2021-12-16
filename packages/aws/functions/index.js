/**
 *   Defines the function for periodically polling sites 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const { fetchWithTimeout,
        getApplicationRequest,
        getSiteListRequest } = require('@the-dash/common/requests');
const { SESClient,
        SendEmailCommand } = require("@aws-sdk/client-ses");
/**
 * Checks if a website was recently changed
 *
 * @param {Date}    startOfPoll  Start time of this function
 * @param {Object}  update       Latest update on the website
 * @return {Boolean} 
 */
function isNewlyChanged(startOfPoll, update) {
  const lastChangeDate = new Date(update.lastStatusChange);
  return (startOfPoll - lastChangeDate) < 1000;
}

/**
 * Get credentials from ENV
 *
 * @return {Array}
 */
function getCredentials() {
  const username = process.env.AWS_COGNITO_USER;
  const pass = process.env.AWS_COGNITO_PASS;
  return [username, pass];
}

/**
 * Gets token to ping API (or null)
 * 
 * @return {String} 
 */
async function getApiToken() {
  const [username, pass] = getCredentials();
  const response = await fetchWithTimeout(
    config.AUTH_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'Content-Type': 'application/x-amz-json-1.1',
      },
      body: JSON.stringify({
        AuthParameters: {
          USERNAME: username,
          PASSWORD: pass,
        },
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: config.AUTH_CLIENT_ID,
      }),
    }
  );

  if (!response.ok) {
    console.log(`Could not get token [${response.status}]`);
    return null;
  }

  const json = await response.json();
  return json.AuthenticationResult.IdToken;
}

/**
 * Gets all the sites through the GET /sites API
 *
 * @param {String}  token  API token
 * @return {Array}
 */
async function getSites(token) {
  const fetchParams = getSiteListRequest(token);
  try {
    const response = await fetchWithTimeout(fetchParams.url, fetchParams.data);
    if (!response.ok) {
      console.log(`Error getting sites [${response.status}]`);
      return [];
    }

    const json = await response.json();
    return json.sites.map(e => e.name);

  } catch(err) {
    console.log(`Error getting sites: ${err}`);
    return [];
  }
}

/**
 * Gets an update for a single website
 *
 * @param {String}  name   Name of website
 * @param {String}  token  API token
 * @return {Object}
 */
async function getStatusOf(name, token) {
  const fetchParams = getApplicationRequest(name, token);
  try {
    const response = await fetchWithTimeout(fetchParams.url, fetchParams.data);
    if (!response.ok) {
      console.log(`Error getting ${name} [${response.status}]`);
      return null;
    }

    return response.json();

  } catch(err) {
    console.log(`Error getting ${name}: ${err}`);
    return null;
  }
}

/**
 * Notifies listeners of down website with AWS SES
 *
 * @param {String}  websiteName
 * @return {Promise}
 */
async function notifyOfDownApp(websiteName) {
  const client = new SESClient({
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.MY_AWS_REGION,
    logger: null,
  });

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [
        config.EMAIL_DESTINATION,
      ],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `URL https://${websiteName} is down. ` +
            `Login for more details: https://${config.APP_NAME}/`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `${websiteName} is down`,
      },
    },
    Source: config.EMAIL_SOURCE,
  });

  const response = await client.send(command);
  return response;
}

/**
 * Entry point into AWS lambda
 */
exports.handler = async function(event, context) {
  const apiToken = await getApiToken();
  if (!apiToken) {
    console.log('Could not get AWS access token');
    return;
  }

  const startOfPoll = new Date();
  const entries = await getSites(apiToken);
  const updates = await Promise.all(entries.map(async e => {
    return getStatusOf(e, apiToken);
  }));

  const promises = [];
  for (const update of updates) {
    if (update && update.isDown && isNewlyChanged(startOfPoll, update)) {
      promises.push(notifyOfDownApp(update.name));
    }
  }
  return Promise.all(promises);
};
