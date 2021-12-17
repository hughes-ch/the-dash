/**
 *   Defines tests for the heroku-ping service
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const handler = require('./heroku-ping');
const { rest } = require('msw');
const { server, sleep } = require('./test-server');
const { sites } = require('./test-inputs');

/**
 * Initial setup and teardown
 */
const mockPing = jest.fn();
let delay;

beforeAll(() => {
  process.env.MY_AWS_ACCESS_KEY_ID='test';
  process.env.MY_AWS_SECRET_ACCESS_KEY='test';
  process.env.MY_AWS_REGION='us-east-1';
  server.listen();
});
beforeEach(() => {
  delay = 0;
  for (const site of sites) {
    server.use(
      rest.get(`https://${site.name}`, (req, res, ctx) => {
        mockPing();
        sleep(delay);
        return res(ctx.status(200));
      }),
    );
  }
});
afterEach(async () => {
  mockPing.mockReset();
  return server.reset();
});
afterAll(() => {
  server.close();
});

/**
 * Unit tests
 */
describe('the heroku-ping service', () => {
  it('pings each website in the database', async () => {
    await handler();
    expect(mockPing).toHaveBeenCalledTimes(sites.length);
  });

  it('can handle long-running fetches', async () => {
    delay = config.LONG_RUNNING_FETCH_TIMEOUT * 1.5;
    await handler();
    // Passes as long as this test doesn't time out

  }, config.LONG_RUNNING_FETCH_TIMEOUT * 2);

  it('authenticates with the API service', async () => {
    const mock401 = jest.fn();
    server.invokeMockOnStatus(mock401);
    await handler();
    expect(mock401).not.toHaveBeenCalled();
  });
});
