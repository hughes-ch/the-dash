/**
 *   Defines tests for the Authenticator
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import AuthContext from './auth-context';
import Authenticator from './authenticator';
import { BrowserRouter as Router } from 'react-router-dom';
import config from '@the-dash/common/app-config';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { requestValidApiToken,
         requestValidExcept,
         requestValidTokens,
         utAuthServer } from '@the-dash/common/ut-auth-server';

/**
 * Initial setup and teardown
 */
beforeAll(() => {
  utAuthServer.listen();
});

afterEach(() => {
  delete window.location;
  const mockLocation = {
    hash: '',
    host: 'localhost',
    href: 'http:/localhost',
    protocol: 'http:',
  };
  window.location = mockLocation;

  utAuthServer.resetHandlers();
  document.cookie = `${config.CREDENTIAL_COOKIE}=''`;
});

afterAll(() => {
  utAuthServer.close();
});

/**
 * Unit tests
 */
describe('the authenticator', () => {
  it('renders contents when correct URL credentials provided', async () => {
    window.location.hash = requestValidTokens();
    const protectedContents = 'Hello world!';
    render(
      <Router>
        <Authenticator>
          <p>
            {protectedContents}
          </p>
        </Authenticator>
      </Router>
    );

    expect(await screen.findByText(protectedContents)).toBeInTheDocument();

    const idToken = window.location.hash.split('&')[0].split('=')[1];
    expect(document.cookie).toContain(idToken);
  });
  
  it('renders contents when correct cookie credentials provided', async () => {
    document.cookie = `${config.CREDENTIAL_COOKIE}=${requestValidApiToken()}`;
    const protectedContents = 'Hello world!';
    render(
      <Router>
        <Authenticator>
          <p>
            {protectedContents}
          </p>
        </Authenticator>
      </Router>
    );

    expect(await screen.findByText(protectedContents)).toBeInTheDocument();
  });

  test.each([
    [requestValidExcept({audience: 'wrong'}), 'incorrect credentials provided'],
    ['#id_token=a&access_token=b', 'credentials are missing'],
    ['#invalid=asdkfjsdklfj', 'credentials are malformed'],
  ])('navigates away when %s', async (desc, hash) => {
    window.location.hash = hash;
    const protectedContents = 'Hello world!';
    render(
      <Router>
        <Authenticator>
          <p>
            {protectedContents}
          </p>
        </Authenticator>
      </Router>
    );

    const baseUrl = config.AUTH_BASE_URL;
    const clientId = config.AUTH_CLIENT_ID;
    const responseType = config.AUTH_RESPONSE_TYPE;
    const scope = config.AUTH_SCOPE;
    const redirectUrl = window.location.href;
    const expectedHref = `${baseUrl}login?client_id=${clientId}&` +
          `response_type=${responseType}&scope=${scope}&` +
          `redirect_uri=${redirectUrl}`;

    await waitFor(() => expect(window.location.href).toEqual(expectedHref));
  });
});
