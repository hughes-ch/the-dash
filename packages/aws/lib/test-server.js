/**
 *   Mock server for tests
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const config = require('@the-dash/common/app-config');
const { getApplicationRequest,
        getSiteListRequest } = require('@the-dash/common/requests');
const { rest } = require('msw');
const { setupServer } = require('msw/node');
const { sites } = require('./test-inputs');

/**
 * Define globals
 */
let state = new State();

/**
 * Utility functions
 */
function hasBearerToken(req) {
  return req.headers.get('authenticate') &&
        req.headers.get('authenticate').includes('Bearer');
}

exports.sleep = async function(ms) {
  function _sleep() {
    return new Promise(resolve => setTimeout(resolve, ms));  
  }
  const promise = _sleep();
  state.longPromises.push(promise);
  return promise;
}

function State() {
  this.longPromises = [];
  this.responseDelay = 0;
  this.statusNewlyChanged = false;
  this.mocks = { };
}

function callMock(key) {
  if (state.mocks[key]) {
    state.mocks[key]();
  }
}

function mocked(method, endpoint, handler) {
  return rest[method.toLowerCase()](endpoint, async (req, res, ctx) => {
    const response = await handler(req, res, ctx);
    callMock(response.status);
    if (response.status === 200) {
      callMock(endpoint);
    }
    return response;
  });
}

/**
 * Server definition
 */
exports.endpoints = {
  siteList: getSiteListRequest().url,
  singleSite: getApplicationRequest(':name').url,
  auth: config.AUTH_ENDPOINT,
  email: 'https://email.us-east-1.amazonaws.com/',
};

exports.server = setupServer(
  // GET /sites API
  mocked('GET', exports.endpoints.siteList, async (req, res, ctx) => {
    if (!hasBearerToken(req)) {
      return res(ctx.status(401));
    }

    return res(
      ctx.status(200),
      ctx.json({
        sites: sites,
      }),
    );
  }),

  // GET /site/:name API
  mocked('GET', exports.endpoints.singleSite, async (req, res, ctx) => {
    if (!hasBearerToken(req)) {
      return res(ctx.status(401));
    }

    const { name } = req.params;
    const site = sites.find(e => name == e.name);
    if (!site) {
      return res(ctx.status(404));
    }

    const now = (new Date()).toUTCString();
    await exports.sleep(state.responseDelay);
    
    return res(
      ctx.status(200),
      ctx.json({
        name: name,
        isDown: site.isDown,
        lastStatusChange: state.statusNewlyChanged ?
          now : site.lastStatusChange,
        lastStatusUpdate: now,
        nextAutomatedUpdate: now,
      }),
    );
  }),

  // POST password to COGNITO
  mocked('POST', exports.endpoints.auth, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        AuthenticationResult: {
          IdToken: 'token',
        },
      }),
    );
  }),

  // POST email to AWS SES
  mocked('POST', exports.endpoints.email, (req, res, ctx) => {
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
 * Resets internal state and waits for long-running promises
 *
 * @return {Promise}
 */
exports.server.reset = async function() {
  await Promise.all(state.longPromises);
  state = new State();
  this.resetHandlers();
}

/**
 * Adds a mock to the list of mocks to be called when this endpoint is called
 *
 * @param {Function}  mock      The mock to be called
 * @param {String}    endpoint  The API which the mock will be invoked
 * @return {undefined}
 */
exports.server.addMockToEndpoint = function(mock, endpoint) {
  state.mocks[endpoint] = mock;
}

/**
 * Adds a mock to the list of mocks to be called when status is encountered
 *
 * @param {Function}  mock      The mock to be called
 * @param {Number}    status    The status code when the mock should be called
 * @return {undefined}
 */
exports.server.invokeMockOnStatus = function(mock, status) {
  state.mocks[status] = mock;
}

/**
 * Adds a delay to the API request
 *
 * @param {Number}  ms  Time to wait in ms
 * @return {undefined}
 */
exports.server.addDelay = function(ms) {
  state.responseDelay = ms;
}

/**
 * Mocks a change in state of the websites in the database
 *
 * @param {Number}  ms  Time to wait in ms
 * @return {undefined}
 */
exports.server.mockChangeInState = function() {
  state.statusNewlyChanged = true;
}

