/**
 *   Defines tests for get-website
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { addDynamoTypeInfo,
        createDynamoClient,
        setupAwsTestEnv } = require('./dynamodb');
const getWebsite = require('./get-website');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { rest } = require('msw');
const { setupServer } = require('msw/node');

/**
 * Initial setup and teardown
 */
let dynamoClient = createDynamoClient();
const goodWebsite = {
  name: 'good.website.com',
  isDown: false,
  lastStatusChange: '2020-04-04 10:49:00 EST',
  lastStatusUpdate: '2020-04-04 10:49:00 EST',
  nextAutomatedUpdate: '2020-04-04 10:49:00 EST',
};
const downWebsite = {
  name: 'down.website.com',
  isDown: false,
  lastStatusChange: '2020-04-04 10:49:00 EST',
  lastStatusUpdate: '2020-04-04 10:49:00 EST',
  nextAutomatedUpdate: '2020-04-04 10:49:00 EST',
};

const server = setupServer(
  rest.get(`https://${goodWebsite.name}`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get(`https://${downWebsite.name}`, (req, res, ctx) => {
    return res(ctx.status(404));
  }),
);

beforeAll(() => {
  server.listen();
});

beforeEach(async () => {
  await setupAwsTestEnv(dynamoClient);

  const tableName = process.env.AWS_SITE_TABLE;
  const createGoodWebsite = new PutItemCommand({
    TableName: tableName,
    Item: addDynamoTypeInfo(goodWebsite),
  });
  const createDownWebsite = new PutItemCommand({
    TableName: tableName,
    Item: addDynamoTypeInfo(downWebsite),
  });
  await dynamoClient.send(createGoodWebsite);
  await dynamoClient.send(createDownWebsite);
});

afterEach(() => {
  dynamoClient.mockReset();
});

afterAll(() => {
  server.close();
});

/**
 * Unit tests
 */
describe('the GET /site/<website> endpoint', () => {
  it('returns 500 if the app name is dangerous', async () => {
    event = {
      path: '/site/name@().html',
    };

    const response = await getWebsite(event);
    expect(response.statusCode).toEqual(500);
  });
  
  test.each([
    ['/site/'],
    ['/site']
  ])('returns 500 if the app name is empty', async (path) => {
    event = {
      path: path,
    };

    const response = await getWebsite(event);
    expect(response.statusCode).toEqual(404);
  });

  it('returns 404 if the app name is not in the database', async () => {
    event = {
      path: '/site/not.an.app',
    }
    const response = await getWebsite(event);
    expect(response.statusCode).toEqual(404);
  });

  it('detects when websites are up', async () => {
    event = {
      path: `/site/${goodWebsite.name}`,
    };
    
    const response = await getWebsite(event);
    expect(response.statusCode).toEqual(200);

    const json = JSON.parse(response.body);
    expect(json.name).toEqual(goodWebsite.name);
    expect(json.isDown).toBe(false);

    const timeElapsedSinceChange = new Date() - new Date(json.lastStatusChange);
    expect(timeElapsedSinceChange).toBeGreaterThan(1000);

    const timeElapsedSinceUpdate = new Date() - new Date(json.lastStatusUpdate);
    expect(timeElapsedSinceUpdate).toBeLessThan(1000);

    const timeSinceAutoUpdate = new Date() - new Date(json.nextAutomatedUpdate);
    expect(timeSinceAutoUpdate).toBeLessThan(1000);
  });

  it('detects down websites', async () => {
    event = {
      path: `/site/${downWebsite.name}`,
    };
    
    const response = await getWebsite(event);
    expect(response.statusCode).toEqual(200);

    const json = JSON.parse(response.body);
    expect(json.name).toEqual(downWebsite.name);
    expect(json.isDown).toBe(true);
    
    const timeElapsedSinceChange = new Date() - new Date(json.lastStatusChange);
    expect(timeElapsedSinceChange).toBeLessThan(1000);
  });

  it('responds with 500 if internal error encountered', async () => {
    event = {
      path: `/site/${goodWebsite.name}`,
    };

    dynamoClient.mockReset();
    const response = await getWebsite(event);
    expect(response.statusCode).toEqual(500);
  });
}); 
