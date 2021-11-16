/**
 *   Defines the function for GET/PUT/POST /sites
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const getSites = require('@the-dash/api/lib/get-sites');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'GET') {
    return getSites(event);
  } else {
    return {
      statusCode: 405,
      body: 'Invalid method for URL',
    };
  }
};
