/**
 *   Defines common application configuration settings
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const testSettings = {
  AUTH_BASE_URL: 'https://the-dash-dev-gj34z.auth.us-east-1.amazoncognito.com/',
  AUTH_CLIENT_ID: '6t0lgt1qeo30rto61ma9k1obpi',
  AUTH_RESPONSE_TYPE: 'token',
  AUTH_SCOPE: 'email+openid',
};
const developmentSettings = { ...testSettings };
developmentSettings.AUTH_BASE_URL = 'https://auth.dev.the-dash.chrishughesdev.com/';
const productionSettings = developmentSettings;

let config;
if (process.env.REACT_APP_DEPLOY_ENVIRONMENT === 'production') {
  config = productionSettings;
} else if (process.env.REACT_APP_DEPLOY_ENVIRONMENT === 'development') {
  config = developmentSettings;
} else {
  config = testSettings;
}

export default config;
