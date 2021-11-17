/**
 *   Defines tests for the LoginButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import config from './app-config';
import LoginButton from './login-button';
import {render, screen} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';

/**
 * Initial setup and teardown
 */
const server = setupServer(
  rest.get(config.AUTH_BASE_URL, (req, res, ctx) => {
    console.log(req);
  }),
);

let windowHrefMockValue = 'test.html';

beforeEach(() => {
  // Mock window to prevent actual redirects
  delete window.location;
  window.location = { href: windowHrefMockValue };
});

/**
 * Unit tests
 */
it('logs in on click', async () => {
  render(<LoginButton/>);
  screen.getByRole('button').click();
  
  const baseUrl = config.AUTH_BASE_URL;
  const clientId = config.AUTH_CLIENT_ID;
  const responseType = config.AUTH_RESPONSE_TYPE;
  const scope = config.AUTH_SCOPE;
  const thisUrl = windowHrefMockValue;
  const authUrl = `${baseUrl}login?client_id=${clientId}&` +
        `response_type=${responseType}&scope=${scope}&redirect_uri=${thisUrl}`;

  expect(clientId).toEqual('test-client-id');
  expect(window.location.href).toEqual(authUrl);
});
