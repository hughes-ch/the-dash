/**
 *   Sets up local dev API environment 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { CreateTableCommand,
        DynamoDBClient,
        PutItemCommand } = require("@aws-sdk/client-dynamodb");

module.exports = {
  async init() {
    // Create client
    const client = new DynamoDBClient({
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.MY_AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
      sslEnabled: false,
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
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    });

    try {
      await client.send(tableCommand);
    } catch (err) {
      console.log(err);
      return;
    }

    const newItemCommand = new PutItemCommand({
      TableName: tableName,
      Item: {
        SiteUrl: {S: 'blog.chrishughesdev.com'},
        IsDown: {BOOL: true},
        TimeLastStatusChange: {S: '2020-04-04 10:49:00 EST'},
        TimeLastStatusUpdate: {S: '2020-04-04 10:49:00 EST'},
        TimeNextAutomatedUpdate: {S: '2020-04-04 10:49:00 EST'},
      },
    });

    try {
      return client.send(newItemCommand);
    } catch (err) {
      console.log(err);
      return;
    }
  },
};


