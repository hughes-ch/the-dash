/**
 *   Defines common application configuration settings
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const testSettings = {
  AUTH_BASE_URL: '/test-login/',
  AUTH_CLIENT_ID: 'test-client-id',
  AUTH_RESPONSE_TYPE: 'token',
  AUTH_SCOPE: 'email+openid',
  DASHBARD_ERROR_TIMEOUT: 300, // ms
  EXT_URL_EMAIL: 'mailto:contact@chrishughesdev.com',
  EXT_URL_LINKEDIN: 'https://www.linkedin.com/in/hughes-ch/',
  EXT_URL_GITHUB: 'https://github.com/',
  EXT_URL_WEBSITE: 'https://blog.chrishughesdev.com',
};
const developmentSettings = { ...testSettings };
developmentSettings.AUTH_BASE_URL = 'https://auth.dev.the-dash.chrishughesdev.com/';
developmentSettings.AUTH_CLIENT_ID = '6t0lgt1qeo30rto61ma9k1obpi';
developmentSettings.DASHBARD_ERROR_TIMEOUT = 5000; // ms

const productionSettings = { ...developmentSettings};
productionSettings.AUTH_BASE_URL = 'https://auth.the-dash.chrishughesdev.com/';
productionSettings.AUTH_CLIENT_ID = 'jo3mat4ds7c0e765v4d3nvjhn';

let config;
if (process.env.REACT_APP_DEPLOY_ENVIRONMENT === 'production') {
  config = productionSettings;
} else if (process.env.REACT_APP_DEPLOY_ENVIRONMENT === 'test') {
  config = testSettings;
} else {
  config = developmentSettings;
}

export default config;
