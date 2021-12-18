/**
 *   Defines tests for the SplashScreen
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import { BrowserRouter as Router } from 'react-router-dom';
import SplashScreen from './splash-screen';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders everything correctly', () => {
  render(
    <Router>
      <SplashScreen/>
    </Router>
  );

  screen.getAllByText('The Dash');
  screen.getByAltText('Dashing man logo');
});
