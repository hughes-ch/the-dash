/**
 *   Defines the function for GET /sites
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/config');
const { DynamoDBClient,
        QueryCommand } = require("@aws-sdk/client-dynamodb");

module.exports = async function(event) {
  // Create client. Set endpoint if for local development only.
  let clientConfig = {
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.MY_AWS_REGION,
  };

  if (process.env.AWS_ENDPOINT) {
    clientConfig.endpoint = process.env.AWS_ENDPOINT;
  }
  
  const client = new DynamoDBClient(clientConfig);

  // Get entry from database
  const queryCommand = new QueryCommand({
    ExpressionAttributeValues: {
      ':SiteUrl': {
        'S': 'blog.chrishughesdev.com',
      },
    },
    KeyConditionExpression: 'SiteUrl = :SiteUrl',
    ProjectionExpression: 'TimeLastStatusChange',
    TableName: process.env.AWS_SITE_TABLE,
  });

  try {
    const response = await client.send(queryCommand);

    if (response.Count > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          'message': response.Items[0]['TimeLastStatusChange'].S,
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }

  // Error encountered when establishing connection to database
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
};
