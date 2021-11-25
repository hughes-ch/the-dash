/**
 *   Defines tests for the PopupErrorDialog
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import PopupErrorDialog from './popup-error-dialog';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('hides itself when there is no error', () => {
  render(<PopupErrorDialog text=''/>);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('displays error', () => {
  const errorText = 'error';
  render(<PopupErrorDialog text={errorText}/>);
  expect(screen.getByRole('alert').textContent).toEqual(errorText);
});
