/**
 *   Defines the function for GET/PUT/POST /sites
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const authenticatedFunction = require('@the-dash/api/lib/authenticated-function');
const deleteWebsite = require('@the-dash/api/lib/delete-website');
const getWebsite = require('@the-dash/api/lib/get-website');
const putWebsite = require('@the-dash/api/lib/put-website');

exports.handler = authenticatedFunction(async (event) => {
  if (event.httpMethod === 'GET') {
    return getWebsite(event);
  } else if (event.httpMethod === 'PUT') {
    return putWebsite(event);
  } else if (event.httpMethod === 'DELETE') {
    return deleteWebsite(event);
  } else  {
    return {
      statusCode: 405,
      body: 'Invalid method for URL',
    };
  }
});
