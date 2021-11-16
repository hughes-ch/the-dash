/**
 *   Sets up local dev API environment 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/config.json');
const shell = require('shelljs');
const { CreateTableCommand,
        DynamoDBClient,
        PutItemCommand,
        QueryCommand } = require("@aws-sdk/client-dynamodb");

// Init constants
const dbContainerPort = config['test-db-container-port'];
const dbHostPort = config['test-db-host-port'];
const dbImage = config['test-db-image'];
const containerName = config['test-db-container-name'];

async function setup() {
  // Start local dynamodb instance 
  shell.exec(`docker rm -f ${containerName}`, {silent:true});
  shell.exec(`docker run -p ${dbContainerPort}:${dbHostPort} -d --name ${containerName} ${dbImage}`);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(5000);

  // Create client with local credentials
  const client = new DynamoDBClient({
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    region: 'test',
    endpoint: `http://localhost:${config['test-db-host-port']}`,
  });

  // Create site table
  const tableName = config['test-db-site-table'];
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

setup();

