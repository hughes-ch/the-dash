/**
 *   Defines the function for GET /sites
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { getAllEntriesInDb, stripItem } = require('./dynamodb');

module.exports = async function(event) {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        sites: await getAllEntriesInDb(),
      }),
    };

  // Error encountered when establishing connection to database
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
};
