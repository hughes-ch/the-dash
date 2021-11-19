/**
 *   Defines tests for the PopupFormButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import PopupFormButton from './popup-form-button';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('uses properties correctly', () => {
  const buttonText = 'buttonText';
  const mockOnClick = jest.fn();
  render(<PopupFormButton onClick={mockOnClick}
                          color='red'
                          text={buttonText}/>);

  screen.getByText(buttonText).click();
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});
