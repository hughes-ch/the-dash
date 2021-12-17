/**
 *   Defines tests for the LogoutButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import config from '@the-dash/common/app-config';
import { getCredentialCookie } from '@the-dash/common/requests';
import LogoutButton from './logout-button';
import { render, screen } from '@testing-library/react';

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
  document.cookie = `${config.CREDENTIAL_COOKIE}=cookie`;
  render(<LogoutButton/>);
  screen.getByText('Log out').click();
  
  const authBaseUrl = config.AUTH_BASE_URL;
  const clientId = config.AUTH_CLIENT_ID;
  const appBaseUrl = windowOriginMockValue + '/';
  
  const logoutUrl = `${authBaseUrl}logout?client_id=${clientId}&` +
        `logout_uri=${appBaseUrl}`;

  expect(clientId).toEqual('test-client-id');
  expect(window.location.href).toEqual(logoutUrl);
  expect(getCredentialCookie()).toBeFalsy();
});
