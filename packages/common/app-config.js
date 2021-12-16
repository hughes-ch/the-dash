/**
 *   Defines common application configuration settings
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const testSettings = {
  APP_NAME: 'the-dash.chrishughesdev.com',
  AUTH_BASE_URL: '/test-login/',
  AUTH_CLIENT_ID: 'test-client-id',
  AUTH_ENDPOINT: '/local',
  AUTH_ISSUER: '/local',
  AUTH_POOL_ID: 'us-east-1_DGiGx38U5',
  AUTH_POOL_REGION: 'us-east-1',
  AUTH_RESPONSE_TYPE: 'token',
  AUTH_SCOPE: 'email+openid',
  AUTOMATED_PING_RATE: 12, // hours
  CREDENTIAL_COOKIE: 'creds',
  DASHBOARD_ERROR_TIMEOUT: 300, // ms
  DASHBOARD_URL: 'dashboard',
  EMAIL_DESTINATION: 'contact@chrishughesdev.com',
  EMAIL_SOURCE: 'contact@chrishughesdev.com',
  EXT_URL_EMAIL: 'mailto:contact@chrishughesdev.com',
  EXT_URL_LINKEDIN: 'https://www.linkedin.com/in/hughes-ch/',
  EXT_URL_GITHUB: 'https://github.com/',
  EXT_URL_WEBSITE: 'https://blog.chrishughesdev.com',
  LONG_RUNNING_FETCH_TIMEOUT: 5000,
};
  
const devSettings = { ...testSettings };
devSettings.APP_NAME = 'dev.the-dash.chrishughesdev.com';
devSettings.AUTH_BASE_URL = `https://auth.${devSettings.APP_NAME}/`;
devSettings.AUTH_CLIENT_ID = 'nvoaf8eqn01hkqi9gq9odpktb';
devSettings.DASHBOARD_ERROR_TIMEOUT = 5000; // ms
devSettings.AUTH_ENDPOINT = `https://cognito-idp.` +
  `${devSettings.AUTH_POOL_REGION}.amazonaws.com/`;
devSettings.AUTH_ISSUER = `${devSettings.AUTH_ENDPOINT}` +
  `${devSettings.AUTH_POOL_ID}`;

const prodSettings = { ...devSettings};
prodSettings.APP_NAME = 'the-dash.chrishughesdev.com';
prodSettings.AUTH_BASE_URL = `https://auth.${prodSettings.APP_NAME}/`;
prodSettings.AUTH_CLIENT_ID = '1grtt9jk49pl1uju9aitn6vkq3';
prodSettings.AUTH_POOL_ID = 'us-east-1_uMWG347YQ';
prodSettings.AUTH_ENDPOINT = `https://cognito-idp.` +
  `${prodSettings.AUTH_POOL_REGION}.amazonaws.com/`;
prodSettings.AUTH_ISSUER = `${prodSettings.AUTH_ENDPOINT}` +
  `${prodSettings.AUTH_POOL_ID}`;

let config;
if (process.env.REACT_APP_DEPLOY_ENVIRONMENT === 'production') {
  config = prodSettings;
} else if (process.env.REACT_APP_DEPLOY_ENVIRONMENT === 'test') {
  config = testSettings;
} else {
  config = devSettings;
}

module.exports = config;
