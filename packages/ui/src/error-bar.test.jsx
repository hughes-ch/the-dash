/**
 *   Defines tests for the ErrorBar
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import ErrorBar from './error-bar';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders correctly', () => {
  const errorText = 'error';
  render(<ErrorBar text={errorText}/>);
  expect(screen.getByRole('alert').textContent).toEqual(errorText);
});
