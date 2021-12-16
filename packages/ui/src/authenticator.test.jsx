/**
 *   Defines tests for the Authenticator
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import AuthContext from './auth-context';
import Authenticator from './authenticator';
import config from '@the-dash/common/app-config';
import React from 'react';
import { render, screen } from '@testing-library/react';
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
  mockNavigate.mockReset();
  utAuthServer.resetHandlers();
  document.cookie = `${config.CREDENTIAL_COOKIE}=''`;
});

afterAll(() => {
  utAuthServer.close();
});

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

/**
 * Unit tests
 */
describe('the authenticator', () => {
  it('renders contents when correct URL credentials provided', async () => {
    window.location.hash = requestValidTokens();
    const protectedContents = 'Hello world!';
    render(
      <Authenticator>
        <p>
          {protectedContents}
        </p>
      </Authenticator>
    );

    expect(await screen.findByText(protectedContents)).toBeInTheDocument();

    const idToken = window.location.hash.split('&')[0].split('=')[1];
    expect(document.cookie).toContain(idToken);
  });
  
  it('renders contents when correct cookie credentials provided', async () => {
    document.cookie = `${config.CREDENTIAL_COOKIE}=${requestValidApiToken()}`;
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

  test.each([
    [requestValidExcept({audience: 'wrong'}), 'incorrect credentials provided'],
    ['#id_token=a&access_token=b', 'credentials are missing'],
    ['#invalid=asdkfjsdklfj', 'credentials are malformed'],
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
