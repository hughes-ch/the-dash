/**
 *   Defines tests for the email service
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const { getApplicationRequest,
        getSiteListRequest } = require('@the-dash/common/requests');
const handler = require('./email-service');
const { rest } = require('msw');
const { server, endpoints } = require('./test-server');
const { sites } = require('./test-inputs');

/**
 * Initial setup and teardown
 */
beforeAll(() => {
  process.env.MY_AWS_ACCESS_KEY_ID='test';
  process.env.MY_AWS_SECRET_ACCESS_KEY='test';
  process.env.MY_AWS_REGION='us-east-1';
  server.listen();
});
afterEach(async () => {
  return server.reset();
});
afterAll(() => {
  server.close();
}); 

/**
 * Unit tests
 */
describe('the automated email service', () => {
  it('uses a token to make calls to the API', async () => {
    const mock401 = jest.fn();
    server.invokeMockOnStatus(mock401);
    await handler();
    expect(mock401).not.toHaveBeenCalled();
  });

  it('updates the status of each site in the database', async () => {
    const mockGetApp = jest.fn();
    server.addMockToEndpoint(mockGetApp, endpoints.singleSite);
    await handler();
    expect(mockGetApp).toHaveBeenCalledTimes(sites.length);
  });

  it('can handle long-running API requests', async () => {
    const mockEmail = jest.fn();
    server.addMockToEndpoint(mockEmail, endpoints.email);
    server.addDelay(config.LONG_RUNNING_FETCH_TIMEOUT * 1.5);
    await handler();
    expect(mockEmail).toHaveBeenCalled();
    
  }, config.LONG_RUNNING_FETCH_TIMEOUT * 2);

  it('sends an email to users when a site goes down', async () => {
    const mockEmail = jest.fn();
    server.addMockToEndpoint(mockEmail, endpoints.email);
    server.mockChangeInState();

    await handler();

    expect(mockEmail).toHaveBeenCalled();
  });

  it('can handle bad responses from GET /sites API', async () => {
    server.use(
      rest.get(getSiteListRequest().url, async (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );
    await handler();
    // Passes if there's no crash
  });

  it('can handle bad responses from GET /site/website API', async () => {
    server.use(
      rest.get(getApplicationRequest(':name').url, async (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );
    await handler();
    // Passes if there's no crash
  });
}); 
