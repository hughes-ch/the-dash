/**
 *   Defines tests for the LoginButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import { BrowserRouter as Router } from 'react-router-dom';
import LoginButton from './login-button';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders without crashing', () => {
  render(
    <Router>
      <LoginButton/>
    </Router>
  );
});
