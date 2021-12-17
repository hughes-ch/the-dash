/**
 *   Defines routines for working with API
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const { absoluteUrl,
        fetchWithTimeout,
        getSiteListRequest } = require('@the-dash/common/requests');

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
exports.getApiToken = async function () {
  const [username, pass] = getCredentials();
  const response = await fetchWithTimeout(
    absoluteUrl(config.AUTH_ENDPOINT),
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
exports.getSites = async function (token) {
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
