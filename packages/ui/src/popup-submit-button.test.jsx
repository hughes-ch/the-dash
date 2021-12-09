/**
 *   Defines tests for the PopupSubmitButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import {buttonFocusMatchers} from './common.test';
import PopupSubmitButton from './popup-submit-button';
import {fireEvent, render, screen} from '@testing-library/react';
import {getColorFromCss} from './common';

/**
 * Global setup
 */
expect.extend(buttonFocusMatchers);

/**
 * Unit tests
 */
it('is rendered correctly', () => {
  const buttonText = 'buttonText';
  render(<PopupSubmitButton color='red' text={buttonText}/>);
  const button = screen.getByRole('button');
  button.value = buttonText;
});

it('uses the correct border on focus', () => {
  expect(<PopupSubmitButton color='red' text='Submit'/>)
    .toHaveFocusBorderOnEvent('focus');
});

it('uses the correct border on blur', () => {
  expect(<PopupSubmitButton color='red' text='Submit'/>)
    .not.toHaveFocusBorderOnEvent('blur');
});

it('uses the correct border on mouseOver', () => {
  expect(<PopupSubmitButton color='red' text='Submit'/>)
    .toHaveFocusBorderOnEvent('mouseOver');
});

it('uses the correct border on mouseOut', () => {
  expect(<PopupSubmitButton color='red' text='Submit'/>)
    .not.toHaveFocusBorderOnEvent('mouseOut');
});

it('can be disabled', () => {
  render(<PopupSubmitButton
           color='red'
           text='submit'
           isDisabled={true}/>);
  const button = screen.getByRole('button');
  expect(button.disabled).toBe(true);
});
