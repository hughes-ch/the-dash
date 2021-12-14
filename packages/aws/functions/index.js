/**
 *   Defines the function for periodically polling sites 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const fetch = require('node-fetch');

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
  const response = await fetch(
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
 * Entry point into AWS lambda
 */
exports.handler = async function(event, context) {
  const apiToken = await getApiToken();
  if (!apiToken) {
    console.log('Could not get AWS access token');
    return;
  }

  console.log(apiToken);
  
  // Get all sites
  // For each site
  //   GET/POST the site
  //   If site is newly down
  //     Send email
};
