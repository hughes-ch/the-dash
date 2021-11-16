/**
 *   Sets up local dev API environment 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/config.json');
const { CreateTableCommand,
        DynamoDBClient,
        PutItemCommand } = require("@aws-sdk/client-dynamodb");

module.exports = {
  init: async function() {

    // Create client with local credentials
    const client = new DynamoDBClient({
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.MY_AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
    });

    // Create site table
    const tableName = process.env.AWS_SITE_TABLE;
    const tableCommand = new CreateTableCommand({
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: 'SiteUrl',
          KeyType: 'HASH',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'SiteUrl',
          AttributeType: 'S',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10,
      },
    });

    try {
      await client.send(tableCommand);
    } catch (err) {
      console.log(err);
      return;
    }

    // Add data to table
    const newItemCommand = new PutItemCommand({
      TableName: tableName,
      Item: {
        SiteUrl: {S: 'blog.chrishughesdev.com'},
        IsDown: {BOOL: true},
        TimeLastStatusChange: {S: '2020-04-04 10:49:00 EST'},
        TimeLastStatusPoll: {S: '2020-04-04 10:49:00 EST'},
      },
    });

    try {
      await client.send(newItemCommand);
    } catch (err) {
      console.log(err);
      return;
    }
  }
};


