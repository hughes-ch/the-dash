/**
 *   Defines tests for the Authenticator
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import AuthContext from './auth-context';
import Authenticator from './authenticator';
import {getJwksRequest} from './common';
import config from './app-config';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';

/**
 * Initial setup and teardown
 */

// Setup mock JWK server
// note these JWKs are for test only
const jwks = require('./jwks.test.json');
const server = setupServer(
  rest.get(getJwksRequest().url, (req, res, ctx) => {
    return res(ctx.json(jwks));
  }),
);

// Mock the window location
delete window.location;
const mockLocation = {
  hash: '',
  host: 'localhost',
  protocol: 'http:',
};
window.location = mockLocation;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: (props) => (<h1>{props.to}</h1>),
  useLocation: () => mockLocation,
}));

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  mockNavigate.mockReset();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

/**
 * Helper functions
 */
function buildHeader(kid, alg) {
  return {
    kid: kid || jwks.keys[0].kid,
    alg: alg || jwks.keys[0].alg,
  };
}

function buildPayload(expiresIn=3600, use='id') {
  return {
    token_use: use,
    exp: Math.round((new Date()).valueOf()/1000) + expiresIn,
  };
}

function buildCredentials(header, payload, options={}, expiresIn=3600) {
  const tokenPayload = payload || buildPayload(expiresIn);
  const tokenKey = options.key || jwks.keys[0];
  const idToken = jwt.sign(
    tokenPayload,
    jwkToPem(tokenKey, { private: true }),
    {
      algorithm: options.algorithm || header.alg,
      audience: options.audience || config.AUTH_CLIENT_ID,
      issuer: options.issuer || config.AUTH_ISSUER,
      header: header,
    }
  );

  return `#id_token=${idToken}&` +
    `access_token=b&` +
    `expires_in=${expiresIn}&` +
    `token_type=d`;
}

function buildValidToken(expiresIn=3600) {
  const header = buildHeader();
  const payload = buildPayload(expiresIn);
  return buildCredentials(header, payload, expiresIn);
}

function buildValidExcept(options) {
  return buildCredentials(buildHeader(), buildPayload(), options);
}

/**
 * Unit tests
 */
describe('the authenticator', () => {
  
  it('renders contents when correct credentials provided', async () => {
    window.location.hash = buildValidToken();
    const protectedContents = 'Hello world!';
    render(
      <Authenticator>
        <p>
          {protectedContents}
        </p>
      </Authenticator>
    );

    expect(await screen.findByText(protectedContents)).toBeInTheDocument();
  });
  
  const noCredentials = '';
  const invalidCredentials = '#invalid=adklsfjasdkjf';
  const missingCredentials = '#id_token=a&access_token=b&token_type=b';
  const invalidIdToken = '#id_token=a&access_token=b&expires_in=c&token_type=d';
  const invalidKid = buildCredentials(buildHeader('invalid'));
  const invalidSignature = buildValidExcept({key: jwks.keys[1]});
  const incorrectAudience = buildValidExcept({audience: 'wrong'});
  const incorrectIssuer = buildValidExcept({issuer: 'wrong'});
  const incorrectTokenUse = buildCredentials(buildHeader(), {token_use: 'wrong'});
  const expiredToken = buildValidToken(-0);
  
  test.each([
    ['no credentials are given', noCredentials],
    ['invalid credentials are given', invalidCredentials],
    ['credentials are missing', missingCredentials],
    ['invalid id_token is given', invalidIdToken],
    ['invalid kid is given', invalidKid],
    ['signature is invalid', invalidSignature],
    ['audience is incorrect', incorrectAudience],
    ['issuer is incorrect', incorrectIssuer],
    ['token_use is incorrect', incorrectTokenUse],
    ['token is expired', expiredToken],
  ])('navigates away when %s', async (desc, hash) => {
    window.location.hash = hash;
    const protectedContents = 'Hello world!';
    render(
      <Authenticator>
        <p>
          {protectedContents}
        </p>
      </Authenticator>
    );

    expect(await screen.findByText('/')).toBeInTheDocument();
  });
});
