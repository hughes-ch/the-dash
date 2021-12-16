/**
 *   Defines tests for common request functions
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { AbortError } = require('abort-controller');
const { absoluteUrl,
        fetchWithTimeout,
        getApplicationRequest,
        getSiteListRequest,
        getJwksRequest } = require('./requests');
const config = require('./app-config');
const { rest } = require('msw');
const { setupServer } = require('msw/node');

/**
 * Constants
 */
let longPromises;
const fastApi = absoluteUrl('/fast');
const slowApi = absoluteUrl('/slow');
const server = setupServer(
  rest.get(fastApi, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get(slowApi, async (req, res, ctx) => {
    await sleep(config.LONG_RUNNING_FETCH_TIMEOUT * 1.5);
    return res(ctx.status(200));
  }),
);

/**
 * Helper functions
 */
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
  server.resetHandlers();
});
afterEach(async () => {
  return Promise.all(longPromises);
});
afterAll(() => {
  server.close();
});

/**
 * Unit tests
 */
describe('the absoluteUrl function', () => {
  it('returns URL untouched if it is already absolute', () => {
    const url = 'http://my.website.com';
    expect(absoluteUrl(url)).toEqual(url);
  });

  it('turns relative URLs into absolute', () => {
    const url = '/relative/path';
    const protocol = 'http:';
    const host = 'my.website.com';

    delete window.location;
    window.location = {
      protocol: protocol,
      host: host,
    };
    
    expect(absoluteUrl(url)).toEqual(`${protocol}//${host}${url}`);
  });
});

describe('the getJwksRequest function', () => {
  it('returns the absolute URL of the jwks.json file', () => {
    const config = require('@the-dash/common/app-config');
    config.AUTH_ISSUER = 'http://the.issuer.com';
    expect(getJwksRequest().url)
      .toBe(`${config.AUTH_ISSUER}/.well-known/jwks.json`);
  }); 
});

describe('the getSiteListRequest function', () => {
  it('returns absolute URL of GET /sites API', () => {
    expect(getSiteListRequest().url).toContain('http');
    expect(getSiteListRequest().url).toContain('/sites');
  });

  it('adds api token to header', () => {
    const token = 'token';
    expect(getSiteListRequest(token).data.headers.authenticate)
      .toContain(`Bearer ${token}`);
  });
});

describe('the getApplicationRequest function', () => {
  it('returns absolute URL of GET /site/website API', () => {
    const appName = 'app';
    expect(getApplicationRequest(appName).url).toContain('http');
    expect(getApplicationRequest(appName).url).toContain(`/site/${appName}`);
  });

  it('adds api token to header', () => {
    const appName = 'app';
    const token = 'token';
    expect(getApplicationRequest(appName, token).data.headers.authenticate)
      .toContain(`Bearer ${token}`);
  });
});

describe('the fetchWithTimeout function', () => {
  it('returns expected when there is no timeout', async () => {
    const response = await fetchWithTimeout(fastApi);
    expect(response.ok).toBeTruthy();
  });

  it('throws exception during long-running fetch', async () => {
    await expect(fetchWithTimeout(slowApi)).rejects.toThrow(AbortError);
  }, config.LONG_RUNNING_FETCH_TIMEOUT * 2);
});

