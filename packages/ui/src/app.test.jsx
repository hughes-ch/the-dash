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

it('does not render dashboard when logged out', async () => {
  const origLocation = window.location;
  delete window.location;
  const mockLocation = {
    hash: '',
    host: 'localhost',
    href: 'http:/localhost',
    protocol: 'http:',
  };
  window.location = mockLocation;
  
  window.history.replaceState({}, '', '/dashboard');  
  render(<App/>);
  expect(screen.queryByText('Last Status Update:')).not.toBeInTheDocument();
  window.location = origLocation;
});

it('navigates back to index page when page is missing', async () => {
  window.history.replaceState({}, '', '/not/a/path');  
  render(<App/>);
  expect(await screen.findByText('/')).toBeInTheDocument();
});
