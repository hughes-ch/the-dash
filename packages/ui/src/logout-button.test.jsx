/**
 *   Defines tests for the LogoutButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import config from './app-config';
import LogoutButton from './logout-button';
import {render, screen} from '@testing-library/react';

/**
 * Initial setup and teardown
 */
let windowHrefMockValue = 'test.html';
let windowOriginMockValue = 'http://localhost:3000';

beforeEach(() => {
  // Mock window to prevent actual redirects
  delete window.location;
  window.location = {
    href: windowHrefMockValue,
    origin: windowOriginMockValue,
  };
});

/**
 * Unit tests
 */
it('logs out on click', () => {
  render(<LogoutButton/>);
  screen.getByText('Log out').click();
  
  const authBaseUrl = config.AUTH_BASE_URL;
  const clientId = config.AUTH_CLIENT_ID;
  const appBaseUrl = windowOriginMockValue + '/';
  
  const logoutUrl = `${authBaseUrl}logout?client_id=${clientId}&` +
        `logout_uri=${appBaseUrl}`;

  expect(clientId).toEqual('test-client-id');
  expect(window.location.href).toEqual(logoutUrl);
});
