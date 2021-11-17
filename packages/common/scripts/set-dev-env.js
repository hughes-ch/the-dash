/**
 *   Sets development environment variables
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
module.exports = {
  setDevEnv: function() {
    process.env.AUTH0_DOMAIN = 'dev-0j3y1qng.us.auth0.com';
    process.env.AUTH0_CLIENTID = '';
  }
};
