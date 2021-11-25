/**
 *   Defines tests for the PopupFormButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import {buttonFocusMatchers} from './common.test';
import PopupFormButton from './popup-form-button';
import {render, screen} from '@testing-library/react';

/**
 * Global setup
 */
expect.extend(buttonFocusMatchers);

const buttonText = 'buttonText';
const mockOnClick = jest.fn();

afterEach(() => {
  jest.restoreAllMocks();
});

/**
 * Unit tests
 */
it('uses properties correctly', () => {
  render(<PopupFormButton onClick={mockOnClick}
                          color='red'
                          text={buttonText}/>);

  screen.getByText(buttonText).click();
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});

it('uses the correct border on focus', () => {
  expect(<PopupFormButton
           onClick={mockOnClick}
           color='red'
           text={buttonText}/>).toHaveFocusBorderOnEvent('focus');
});

it('uses the correct border on blur', () => {
  expect(<PopupFormButton
           onClick={mockOnClick}
           color='red'
           text={buttonText}/>).not.toHaveFocusBorderOnEvent('blur');
});

it('uses the correct border on mouseOver', () => {
  expect(<PopupFormButton
           onClick={mockOnClick}
           color='red'
           text={buttonText}/>).toHaveFocusBorderOnEvent('mouseOver');
});

it('uses the correct border on mouseOut', () => {
  expect(<PopupFormButton
           onClick={mockOnClick}
           color='red'
           text={buttonText}/>).not.toHaveFocusBorderOnEvent('mouseOut');
});
