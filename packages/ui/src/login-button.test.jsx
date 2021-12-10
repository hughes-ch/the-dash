/**
 *   Defines tests for the LoginButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import config from '@the-dash/common/app-config';
import LoginButton from './login-button';
import {render, screen} from '@testing-library/react';

/**
 * Initial setup and teardown
 */
let windowHrefMockValue = 'test.html/';

beforeEach(() => {
  // Mock window to prevent actual redirects
  delete window.location;
  window.location = { href: windowHrefMockValue };
});

/**
 * Unit tests
 */
it('logs in on click', () => {
  render(<LoginButton/>);
  screen.getByText('Log in').click();
  
  const baseUrl = config.AUTH_BASE_URL;
  const clientId = config.AUTH_CLIENT_ID;
  const responseType = config.AUTH_RESPONSE_TYPE;
  const scope = config.AUTH_SCOPE;
  const callback = `${windowHrefMockValue}${config.DASHBOARD_URL}`;
  const authUrl = `${baseUrl}login?client_id=${clientId}&` +
        `response_type=${responseType}&scope=${scope}&redirect_uri=${callback}`;

  expect(clientId).toEqual('test-client-id');
  expect(window.location.href).toEqual(authUrl);
});
