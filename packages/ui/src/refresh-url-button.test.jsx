/**
 *   Defines tests for the RefreshUrlButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import RefreshUrlButton from './refresh-url-button';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders correctly when not loading', () => {
  const expectedText = 'Refresh';
  const mockOnClick = jest.fn();
  render(<RefreshUrlButton isLoading={false} onClick={mockOnClick}/>);
  
  screen.getByText(expectedText).click();
  expect(mockOnClick).toBeCalledTimes(1);
});

it('renders correctly when loading', () => {
  render(<RefreshUrlButton isLoading={true}/>);
  
  const button = screen.getByRole('button');
  expect(button.textContent).toEqual('');
  expect(button.disabled).toBe(true);
});
