/**
 *   Defines tests for the NavigationBar
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import AuthContext, {createAuthContext} from './auth-context';
import NavigationBar from './nav-bar';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders correctly when logged in', () => {
  const expectedButtonText = 'Log out';
  const authContextVal = createAuthContext();
  authContextVal.credentials.isLoggedIn = true;
  
  render(
    <AuthContext.Provider value={authContextVal}>
      <NavigationBar />
    </AuthContext.Provider>
  );
  
  expect(screen.getByRole('navigation')).toHaveTextContent('The Dash');
  expect(screen.getByRole('button')).toHaveTextContent(expectedButtonText);
});

it('renders correctly when logged out', () => {
  const expectedButtonText = 'Log in';
  const authContextVal = createAuthContext();
  authContextVal.credentials.isLoggedIn = false;
  
  render(
    <AuthContext.Provider value={authContextVal}>
      <NavigationBar />
    </AuthContext.Provider>
  );
  
  expect(screen.getByRole('navigation')).toHaveTextContent('The Dash');
  expect(screen.getByRole('button')).toHaveTextContent(expectedButtonText);
});
