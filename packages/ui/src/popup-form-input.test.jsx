/**
 *   Defines tests for the PopupFormInput
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import PopupFormInput from './popup-form-input';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders correctly', () => {
  const name = 'Name';
  render(<PopupFormInput name={name} type='text'/>);
        
  const expectedInputText = 'hello';
  const input = screen.getByLabelText(name);
  input.value = expectedInputText;

  const textBox = screen.getByRole('textbox');
  expect(textBox.value).toEqual(expectedInputText);
});
