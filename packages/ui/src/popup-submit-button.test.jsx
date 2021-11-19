/**
 *   Defines tests for the PopupSubmitButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import PopupSubmitButton from './popup-submit-button';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('is rendered correctly', () => {
  const buttonText = 'buttonText';
  render(<PopupSubmitButton color='red' text={buttonText}/>);
  const button = screen.getByRole('button');
  button.value = buttonText;
});
