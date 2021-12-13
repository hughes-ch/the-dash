/**
 *   Defines the function for GET/PUT/POST /sites
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const authenticatedFunction = require('@the-dash/api/lib/authenticated-function');
const getSites = require('@the-dash/api/lib/get-sites');

exports.handler = authenticatedFunction(async (event) => {
  if (event.httpMethod === 'GET') {
    return getSites(event);
  } else {
    return {
      statusCode: 405,
      body: 'Invalid method for URL',
    };
  }
});
