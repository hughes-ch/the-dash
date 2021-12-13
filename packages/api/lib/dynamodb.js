/**
 *   Defines common functions around the DynamoDB
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { CreateTableCommand,
        DynamoDBClient,
        GetItemCommand,
        PutItemCommand,
        ScanCommand } = require("@aws-sdk/client-dynamodb");

/**
 * Creates a DynamoDb client
 *
 * @return {DynamoDBClient}
 */
exports.createDynamoClient = function() {
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
exports.getAllEntriesInDb = async function() {
  const scanCommand = new ScanCommand({
    TableName: process.env.AWS_SITE_TABLE,
  });

  const client = exports.createDynamoClient();
  const items = await client.send(scanCommand);
  return items.Items ? items.Items.map(stripItem) : [];
}

/**
 * Gets a single item in a database or null
 *
 * This function will throw if connection refused
 *
 * @param {String} key Primary key of object
 * @return {Object}
 */
exports.getItem = async function(key) {
  const getItemCommand = new GetItemCommand({
    Key: { 
      SiteUrl : {S: key},
    },
    TableName: process.env.AWS_SITE_TABLE,
  });

  client = exports.createDynamoClient();
  const item = await client.send(getItemCommand);
  const returnVal = item.Item ? stripItem(item.Item) : null;
  return returnVal;
}

/**
 * Puts a single item in a database
 *
 * This function will throw if connection refused
 *
 * @param {Object} item Object to store
 * @return {undefined}
 */
exports.putItem = async function(item) {
  const putItemCommand = new PutItemCommand({
    Item: exports.addDynamoTypeInfo(item),
    TableName: process.env.AWS_SITE_TABLE,
  });

  client = exports.createDynamoClient();
  return client.send(putItemCommand);
}

/**
 * Strips an item of its dynamodb-ness and returns regular object
 *
 * @param {Object}  item  Item to strip
 * @return {Object}
 */
function stripItem(item) {
  const stripped = {
    name: item.SiteUrl.S,
  };

  stripped.isDown = item.IsDown ?
    item.IsDown.BOOL : undefined;
  stripped.lastStatusChange = item.TimeLastStatusChange ?
    item.TimeLastStatusChange.S : undefined;
  stripped.lastStatusUpdate = item.TimeLastStatusUpdate ?
    item.TimeLastStatusUpdate.S : undefined;
  stripped.nextAutomatedUpdate = item.TimeNextAutomatedUpdate ?
    item.TimeNextAutomatedUpdate.S : undefined;

  return stripped;
}

/**
 * Adds DynamoDB type information to the item
 *
 * @param {Object}  item  Item to add typing
 * @return {Object}
 */
exports.addDynamoTypeInfo = function(item) {
  return {
    SiteUrl: {S: item.name},
    IsDown: {BOOL: item.isDown},
    TimeLastStatusChange: {S: item.lastStatusChange},
    TimeLastStatusUpdate: {S: item.lastStatusUpdate},
    TimeNextAutomatedUpdate: {S: item.nextAutomatedUpdate},
  };
}

/**
 * Setups up AWS test environment
 *
 * @param {Object}  client  Dynamo DB client
 * @return {Promise}
 */
exports.setupAwsTestEnv = async function(client) {
  process.env.AWS_SITE_TABLE = 'test';
  process.env.MY_AWS_ACCESS_KEY_ID = 'test';
  process.env.MY_AWS_SECRET_ACCESS_KEY = 'test';
  process.env.MY_AWS_REGION = 'local';

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

  client.mockReset();
  return client.send(tableCommand);
}
