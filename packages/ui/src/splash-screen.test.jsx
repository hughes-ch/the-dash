/**
 *   Defines tests for the SplashScreen
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import SplashScreen from './splash-screen';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders everything correctly', () => {
  render(<SplashScreen/>);

  screen.getAllByText('The Dash');
  screen.getByAltText('Dashing man logo');
});
