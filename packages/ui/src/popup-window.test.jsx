/**
 *   Defines tests for the PopupWindow
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import PopupSubmitButton from './popup-submit-button';
import PopupWindow from './popup-window';
import {fireEvent, render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('submits a form', () => {
  const mockSubmit = jest.fn();
  render(
    <PopupWindow onSubmit={mockSubmit}>
      <PopupSubmitButton color='red' text='submit'/>
    </PopupWindow>
  );

  fireEvent.submit(document.getElementsByName('popup-form')[0]);
  expect(mockSubmit).toHaveBeenCalledTimes(1);
});
