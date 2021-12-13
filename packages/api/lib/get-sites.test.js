/**
 *   Defines the tests for GET /sites
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { createDynamoClient, setupAwsTestEnv } = require('./dynamodb');
const getSites = require('./get-sites');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { requestValidApiToken } = require('@the-dash/common/ut-auth-server');

/**
 * Initial setup and teardown
 */
let dynamoClient = createDynamoClient();

beforeEach(async () => {
  return setupAwsTestEnv(dynamoClient);
});

afterEach(() => {
  dynamoClient.mockReset();
});

/**
 * Unit tests
 */
describe('for a client requesting GET /sites', () => {
  const authenticatedEvent = {
    headers: {
      authenticate: `Bearer ${requestValidApiToken()}`,
    },
  };
  
  it('responds with empty list when none are in database', async () => {
    const response = await getSites(authenticatedEvent);
    expect(response.statusCode).toEqual(200);
    
    const json = JSON.parse(response.body);
    expect(json.sites.length).toEqual(0);
  });

  it('responds correctly when database is populated', async () => {
    const tableName = process.env.AWS_SITE_TABLE;
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

    await dynamoClient.send(newItemCommand);
    
    const response = await getSites(authenticatedEvent);
    expect(response.statusCode).toEqual(200);
    
    const json = JSON.parse(response.body);
    expect(json.sites.length).toEqual(1);
    expect(json.sites[0].name).toEqual('blog.chrishughesdev.com');
  });

  it('responds with 500 when internal error reported', async () => {
    // Remove table so connection will fail
    dynamoClient.mockReset();
    const response = await getSites(authenticatedEvent);
    expect(response.statusCode).toEqual(500);
  });
});
