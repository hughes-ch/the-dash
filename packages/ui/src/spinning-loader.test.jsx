/**
 *   Defines tests for the SpinningLoader
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import SpinningLoader from './spinning-loader';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders without throwing', () => {
  render(<SpinningLoader />);
});
