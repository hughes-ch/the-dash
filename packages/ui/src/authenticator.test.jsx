/**
 *   Defines tests for the Authenticator
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import AuthContext from './auth-context';
import Authenticator from './authenticator';
import React from 'react';
import {render, screen} from '@testing-library/react';

/**
 * Initial setup and teardown
 */
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: () => '',
}));

afterEach(() => {
  mockNavigate.mockReset();
});

/**
 * Unit tests
 */
it('renders nothing when user is not logged in', () => {
  const protectedText = 'Hello World!';
  render(
    <Authenticator>
      <h1>{protectedText}</h1>
    </Authenticator>
  );

  expect(screen.queryByText(protectedText)).not.toBeInTheDocument();
});

it('renders content when user is logged in', () => {
  const protectedText = 'Hello World!';
  const auth = {
    actions: {
      checkCredentials: () => undefined
    },
    credentials: {
      isLoggedIn: true,
    }
  };
  
  render(
    <AuthContext.Provider value={auth}>
      <Authenticator>
        <h1>{protectedText}</h1>
      </Authenticator>
    </AuthContext.Provider>
  );

  expect(screen.queryByText(protectedText)).toBeInTheDocument();
});
