/**
 *   Defines the function for GET /sites
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const authenticate = require("@the-dash/common/authenticate"); 
const { DynamoDBClient,
        ScanCommand } = require("@aws-sdk/client-dynamodb");

/**
 * Authorizes client for API request
 *
 * @param {Object}  headers  Headers from request
 * @return {Boolean}
 */
async function isAuthorized(headers) {
  if (!headers.authenticate) {
    return false;
  }

  const [bearer, token] = headers.authenticate.split(' ');
  if (bearer !== 'Bearer') {
    return false;
  }

  return authenticate(token);
}

/**
 * Creates a DynamoDb client
 *
 * @return {DynamoDBClient}
 */
function createDynamoClient() {
  let clientConfig = {
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.MY_AWS_REGION,
  };

  if (process.env.AWS_ENDPOINT) {
    clientConfig.endpoint = process.env.AWS_ENDPOINT;
    clientConfig.sslEnabled = false;
  }
  
  return new DynamoDBClient(clientConfig);
}

/**
 * Gets all entries in the database
 *
 * This function will throw if connection refused
 *
 * @return {Array}
 */
async function getAllEntriesInDb() {
  const scanCommand = new ScanCommand({
    TableName: process.env.AWS_SITE_TABLE,
  });

  const client = createDynamoClient();
  const items = await client.send(scanCommand);
  return items.Items ? items.Items : [];
}

/**
 * Entry point into the Netlify function
 */
module.exports = async function(event) {
  // Verify credentials
  if (!await isAuthorized(event.headers)) {
    return {
      statusCode: 401,
      body: 'Not authorized',
    };
  }
  
  // Build response
  try {
    const dbEntries = await getAllEntriesInDb();
    const sites = dbEntries.map(e => {
      return {
        name: e['SiteUrl'].S,
        isDown: e['IsDown'].BOOL,
        lastStatusChange: e['TimeLastStatusChange'].S,
        lastStatusUpdate: e['TimeLastStatusUpdate'].S,
        nextAutomatedUpdate: e['TimeNextAutomatedUpdate'].S,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        sites: sites,
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
