/**
 *   Defines tests for the NewApplicationPopup
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import NewApplicationPopup from './new-application-popup';
import {fireEvent, render, screen} from '@testing-library/react';

/**
 * Initial setup
 */
const mockOnSubmit = jest.fn();
const mockCancel = jest.fn();

beforeEach(() => {
  jest.restoreAllMocks();
}); 

/**
 * Unit tests
 */
it('renders correctly', () => {

  let submittedContent;
  const onSubmit = (event) => {
    event.preventDefault();
    submittedContent = event.target.elements['name'].value;
  };

  render(
    <NewApplicationPopup
      apps={[]}
      onSubmit={onSubmit}
      onCancel={mockCancel}/>
  );

  // Add text to input
  const expectedInputValue = 'hello';
  const input = screen.getByLabelText('Name');
  input.value = expectedInputValue;
  
  // Click all the buttons and make sure they worked
  screen.getByText('Cancel').click();
  fireEvent.submit(document.getElementsByName('popup-form')[0]);
  expect(mockCancel).toHaveBeenCalledTimes(1);
  expect(submittedContent).toEqual(expectedInputValue);
});

it('disallows malformed new application names', () => {
  render(
    <NewApplicationPopup
      apps={[]}
      onSubmit={mockOnSubmit}
      onCancel={mockCancel}/>
  );
  
  const input = screen.getByLabelText('Name');
  fireEvent.change(input, {target: {value: 'email@email.com'}});
  expect(screen.queryByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('Submit').disabled).toBe(true);
});

it('does not allow multiple apps with same name', () => {
  const apps = [
    'blog.example.com',
    'my.awesome.app',
  ];

  render(
    <NewApplicationPopup
      apps={apps}
      onSubmit={mockOnSubmit}
      onCancel={mockCancel}/>
  );
  
  const input = screen.getByLabelText('Name');
  fireEvent.change(input, {target: {value: apps[1]}});
  expect(screen.queryByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('Submit').disabled).toBe(true);
});
