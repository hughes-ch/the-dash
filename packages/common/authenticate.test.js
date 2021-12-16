/**
 *   Defines tests for the authenticate function
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const authenticate = require('./authenticate');
const { requestCredentials,
        requestHeader,
        requestPayload,
        requestValidApiToken,
        requestValidExcept,
        requestValidTokens,
        utAuthServer } = require('./ut-auth-server');

/**
 * Initial setup and teardown
 */
beforeAll(() => {
  utAuthServer.listen();
});

afterEach(() => {
  utAuthServer.resetHandlers();
});

afterAll(() => {
  utAuthServer.close();
});

/**
 * Unit tests
 */
describe('the authenticate function', () => {
  it('returns true when correct credentials provided', async () => {
    expect(await authenticate(requestValidApiToken())).toBe(true);
  });
  
  const noCredentials = '';
  const invalidIdToken = '#id_token=a&access_token=b&expires_in=c&token_type=d';
  const invalidKid = requestCredentials(requestHeader('invalid'));
  const invalidSignature = requestValidExcept({signature: 'wrong'});
  const incorrectAudience = requestValidExcept({audience: 'wrong'});
  const incorrectIssuer = requestValidExcept({issuer: 'wrong'});
  const incorrectTokenUse = requestCredentials(requestHeader(), {token_use: 'wrong'});
  const expiredToken = requestValidTokens(-10);
  
  test.each([
    ['no credentials are given', noCredentials],
    ['invalid id_token is given', invalidIdToken],
    ['invalid kid is given', invalidKid],
    ['signature is invalid', invalidSignature],
    ['audience is incorrect', incorrectAudience],
    ['issuer is incorrect', incorrectIssuer],
    ['token_use is incorrect', incorrectTokenUse],
    ['token is expired', expiredToken],
  ])('returns false when %s', async (desc, credentials) => {
    let token = '';
    if (credentials) {
      token = credentials.split('&')[0].split('=')[1];
    }
    expect(await authenticate(token)).toBe(false);
  });
});
