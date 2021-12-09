/**
 *   Defines tests for the DashboardButton
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import DashboardButton from './dashboard-button';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders correctly', () => {
  const mockDoTheThing = jest.fn();
  render(<DashboardButton onClick={mockDoTheThing}/>);
  screen.getByRole('button').click();
  expect(mockDoTheThing).toHaveBeenCalledTimes(1);
});
