/**
 *   Defines the function for periodically polling sites 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const { fetchWithTimeout,
        getApplicationRequest } = require('@the-dash/common/requests');
const { getApiToken, getSites } = require('./api');
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
      throw Error(`Error getting ${name} [${response.status}]`);
    }

    return response.json();

  } catch(err) {
    console.log(`Error getting ${name}: ${err}`);
    return {
      name: name,
      isDown: true,
    };
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

  return client.send(command);
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
  const updates = await Promise.all(entries.map(async e => {
    return getStatusOf(e, apiToken);
  }));

  const promises = [];
  for (const update of updates) {
    if (update && update.isDown) {
      promises.push(notifyOfDownApp(update.name));
    }
  }
  return Promise.all(promises);
};
