/**
 *   Defines tests for the GlobalStatus
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import GlobalStatus from './global-status';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('correctly renders with no alarms', () => {
  render(<GlobalStatus numAlarms='0'/>);
  const expectedBackgroundColor = window.getComputedStyle(
    document.documentElement).getPropertyValue('--all-clear-color');
  
  const element = screen.getByText('No Alarms');
  expect(element.style.backgroundColor).toEqual(expectedBackgroundColor);
});

it('correctly renders with 1 alarm', () => {
  render(<GlobalStatus numAlarms='1'/>);
  const expectedBackgroundColor = window.getComputedStyle(
    document.documentElement).getPropertyValue('--alarm-color');
  
  const element = screen.getByText('1 Alarm');
  expect(element.style.backgroundColor).toEqual(expectedBackgroundColor);
});

it('correctly renders with multiple alarms', () => {
  const numAlarms = 45;
  
  render(<GlobalStatus numAlarms={numAlarms}/>);
  const expectedBackgroundColor = window.getComputedStyle(
    document.documentElement).getPropertyValue('--alarm-color');
  
  const element = screen.getByText(`${numAlarms} Alarms`);
  expect(element.style.backgroundColor).toEqual(expectedBackgroundColor);
});
