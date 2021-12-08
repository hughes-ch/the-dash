/**
 *   Defines tests for the App component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import App from './app';
import AuthContext from './auth-context';
import { render, screen } from '@testing-library/react';

/**
 * Initial setup and teardown
 */
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: (props) => (<h1>{props.to}</h1>),
}));

afterEach(() => {
  mockNavigate.mockReset();
});

/**
 * Unit tests
 */
it('renders index page', () => {
  window.history.replaceState({}, '', '/');
  render(<App/>);
  expect(screen.queryByText('Log in')).toBeInTheDocument();
});

it('renders dashboard when logged in', async () => {
  const auth = {
    actions: {
      checkCredentials: () => undefined
    },
    credentials: {
      isLoggedIn: true,
    }
  };

  window.history.replaceState({}, '', '/dashboard');  
  render(
    <AuthContext.Provider value={auth}>
      <App/>
    </AuthContext.Provider>
  );

  expect(await screen.findByText('Add Another URL')).toBeInTheDocument();
});

it('does not render dashboard when logged out', async () => {
  window.history.replaceState({}, '', '/dashboard');  
  render(<App/>);
  expect(await screen.findByText('/')).toBeInTheDocument();
});

it('navigates back to index page when page is missing', async () => {
  window.history.replaceState({}, '', '/not/a/path');  
  render(<App/>);
  expect(await screen.findByText('/')).toBeInTheDocument();
});
