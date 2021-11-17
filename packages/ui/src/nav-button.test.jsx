/**
 *   Defines tests for the NavButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import NavButton from './nav-button';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders with correct props', () => {
  const expectedText = 'hello';
  const mockOnClick = jest.fn();
  render(<NavButton text={expectedText} onClick={mockOnClick}/>);
  screen.getByText(expectedText).click();

  expect(mockOnClick).toBeCalledTimes(1);
});
