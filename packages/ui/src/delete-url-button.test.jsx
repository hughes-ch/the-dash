/**
 *   Defines tests for the DeleteUrlButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import DeleteUrlButton from './delete-url-button';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders correctly', () => {
  render(<DeleteUrlButton />);
  screen.getByRole('button');
});
