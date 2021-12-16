/**
 *   Defines tests for the dynamodb wrapper
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { createDynamoClient,
        getAllEntriesInDb,
        getItem,
        putItem,
        setupAwsTestEnv,
        stripItem } = require('./dynamodb');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');

/**
 * Initial setup and teardown
 */
let dynamoClient;
const siteUrls = [
  'my.site.app',
  'hello.world.com',
  'i.like.pizza',
];

beforeEach(async () => {
  dynamoClient = createDynamoClient();
  await setupAwsTestEnv(dynamoClient);

  const tableName = process.env.AWS_SITE_TABLE;
  siteUrls.forEach(async (url) => {
    const newItemCommand = new PutItemCommand({
      TableName: tableName,
      Item: { SiteUrl: {S: url} },
    });

    await dynamoClient.send(newItemCommand);
  });
});

afterEach(() => {
  dynamoClient.mockReset();
}); 

/**
 * Unit tests
 */
describe('the getAllEntriesInDb function', () => {
  it('gets all entries in the database', async () => {
    const entries = await getAllEntriesInDb();
    siteUrls.forEach(url => {
      expect(entries.map(e => e.name)).toContain(url);
    });
  }); 
});

describe('the getItem function', () => {
  it('gets a single item from a database', async () => {
    const item = await getItem(siteUrls[1]);
    expect(item.name).toEqual(siteUrls[1]);
  });

  it('returns null if nothing found', async () => {
    const item = await getItem('not.an.app');
    expect(item).toBe(null);
  }); 
});

describe('the putItem function', () => {
  it('adds a single item to a database', async () => {
    const item = {
      name: 'my.new.app',
    };

    await putItem(item);
    const entries = await getAllEntriesInDb();
    expect(entries.map(e => e.name)).toContain(item.name);
  });
});
