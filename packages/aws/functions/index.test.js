/**
 *   Defines tests for index.js
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const { getApplicationRequest,
        getSiteListRequest } = require('@the-dash/common/requests');
const { handler } = require('./index');
const { rest } = require('msw');
const { setupServer } = require('msw/node');

/**
 * Define constants
 */
let longPromises;
const mock401 = jest.fn();
const mockEmail = jest.fn();
const mockGetApp = jest.fn();
const mockGetSites = jest.fn();
let responseDelay;
let statusNewlyChanged;

const sites = [
  {
    name: 'my.web.site',
    isDown: true,
    lastStatusChange: '2020-04-04 10:49:00 EST',
    lastStatusUpdate: '2020-04-04 10:49:00 EST',
    nextAutomatedUpdate: '2020-04-04 10:49:00 EST',
  },
  {
    name: 'i.like.pizza',
    isDown: false,
    lastStatusChange: '2020-04-04 10:49:00 EST',
    lastStatusUpdate: '2020-04-04 10:49:00 EST',
    nextAutomatedUpdate: '2020-04-04 10:49:00 EST',
  },
];

const server = setupServer(
  rest.get(getSiteListRequest().url, async (req, res, ctx) => {
    if (!hasBearerToken(req)) {
      return res(ctx.status(401));
    }
    
    mockGetSites();
    await sleep(responseDelay);
    
    return res(
      ctx.status(200),
      ctx.json({
        sites: sites,
      }),
    );
  }),
  rest.get(getApplicationRequest(':name').url, async (req, res, ctx) => {
    if (!hasBearerToken(req)) {
      return res(ctx.status(401));
    }

    const { name } = req.params;
    const site = sites.find(e => name == e.name);
    if (!site) {
      return res(ctx.status(404));
    }

    mockGetApp();
    const now = (new Date()).toUTCString();
    await sleep(responseDelay);
    
    return res(
      ctx.status(200),
      ctx.json({
        name: name,
        isDown: site.isDown,
        lastStatusChange: statusNewlyChanged ? now : site.lastStatusChange,
        lastStatusUpdate: now,
        nextAutomatedUpdate: now,
      }),
    );
  }),
  rest.post(config.AUTH_ENDPOINT, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        AuthenticationResult: {
          IdToken: 'token',
        },
      }),
    );
  }),
  rest.post('https://email.us-east-1.amazonaws.com/', (req, res, ctx) => {
    mockEmail();
    return res(
      ctx.status(200),
      ctx.xml(`
<SendEmailResponse xmlns="https://email.amazonaws.com/doc/2010-03-31/">
  <SendEmailResult>
    <MessageId>000001271b15238a-fd3ae762-2563-11df-8cd4-6d4e828a9ae8-000000</MessageId>
  </SendEmailResult>
  <ResponseMetadata>
    <RequestId>fd3ae762-2563-11df-8cd4-6d4e828a9ae8</RequestId>
  </ResponseMetadata>
</SendEmailResponse>
     `),
    );
  }),
);

/**
 * Helper functions
 */
function hasBearerToken(req) {
  const isBearerTokenPresent = req.headers.get('authenticate') &&
        req.headers.get('authenticate').includes('Bearer');
  if (!isBearerTokenPresent) {
    mock401();
  }
  return isBearerTokenPresent;
}

async function sleep(ms) {
  function _sleep() {
    return new Promise(resolve => setTimeout(resolve, ms));  
  }
  const promise = _sleep();
  longPromises.push(promise);
  return promise;
}

/**
 * Initial setup and teardown
 */
beforeAll(() => {
  server.listen();
});
beforeEach(() => {
  longPromises = [];
  responseDelay = 0;
  statusNewlyChanged = false;
});
afterEach(async () => {
  mock401.mockReset();
  mockGetApp.mockReset();
  mockGetSites.mockReset();
  server.resetHandlers();

  return Promise.all(longPromises);
});
afterAll(() => {
  server.close();
}); 

/**
 * Unit tests
 */
describe('the automated email service', () => {
  it('uses an token to make calls to the API', async () => {
    await handler();
    expect(mock401).not.toHaveBeenCalled();
  });

  it('updates the status of each site in the database', async () => {
    await handler();
    expect(mockGetApp).toHaveBeenCalledTimes(sites.length);
  });

  it('can handle long-running API requests', async () => {
    responseDelay = config.LONG_RUNNING_FETCH_TIMEOUT * 1.5;
    await handler();
    expect(mockGetSites).toHaveBeenCalled();
    
  }, config.LONG_RUNNING_FETCH_TIMEOUT * 2);

  it('sends an email to users when a site goes down', async () => {
    process.env.MY_AWS_ACCESS_KEY_ID='test';
    process.env.MY_AWS_SECRET_ACCESS_KEY='test';
    process.env.MY_AWS_REGION='us-east-1';
    
    statusNewlyChanged = true;
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
