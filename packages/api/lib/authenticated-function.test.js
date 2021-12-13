/**
 *   Defines tests for authenticatedFunction
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const authenticatedFunction = require('./authenticated-function');
const { requestValidApiToken,
        utAuthServer } = require('@the-dash/common/ut-auth-server');

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
describe('Authenticated functions', () => {
  it('is delegated to when authenticated', async () => {
    const expectedReturn = 'hello world!';
    const handler = authenticatedFunction(e => expectedReturn);
    const authenticatedEvent = {
      headers: {
        authenticate: `Bearer ${requestValidApiToken()}`,
      },
    };

    expect(await handler(authenticatedEvent)).toEqual(expectedReturn);
  });

  it('is not called and returns 401 when not authenticated', async () => {
    const mockFunction = jest.fn();
    const handler = authenticatedFunction(mockFunction);
    const unauthenticatedEvent = {
      headers: { },
    };

    const response = await handler(unauthenticatedEvent);
    expect(response.statusCode).toEqual(401);
    expect(mockFunction).not.toHaveBeenCalled();
  }); 
}); 
