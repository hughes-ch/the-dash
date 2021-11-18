/**
 *   Defines tests for the GlobalStatus
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import UrlStatusLight from './url-status-light';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('correctly renders when good', () => {
  render(<UrlStatusLight isDown={false}/>);
  const expectedColor = window.getComputedStyle(
    document.documentElement).getPropertyValue('--all-clear-color');
  
  const element = screen.getByText('Good');
  expect(element.style.backgroundColor).toEqual(expectedColor);
});

it('correctly renders when down', () => {
  render(<UrlStatusLight isDown={true}/>);
  const expectedColor = window.getComputedStyle(
    document.documentElement).getPropertyValue('--alarm-color');
  
  const element = screen.getByText('Down');
  expect(element.style.backgroundColor).toEqual(expectedColor);
});
