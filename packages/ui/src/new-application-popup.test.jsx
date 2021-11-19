/**
 *   Defines tests for the NewApplicationPopup
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import NewApplicationPopup from './new-application-popup';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders correctly', () => {

  // Add 'mock' submit that takes form data
  let submittedContent;
  const onSubmit = (event) => {
    event.preventDefault();
    submittedContent = event.target.elements['new-app'].value;
  };

  const mockCancel = jest.fn();

  render(
    <NewApplicationPopup onSubmit={onSubmit} onCancel={mockCancel}/>
  );

  // Add text to input
  const expectedInputValue = 'hello';
  const input = screen.getByLabelText('Name');
  input.value = expectedInputValue;
  
  // Click all the buttons and make sure they worked
  screen.getByText('Cancel').click();
  screen.getByText('Submit').click();
  expect(mockCancel).toHaveBeenCalledTimes(1);
  expect(submittedContent).toEqual(expectedInputValue);
});
