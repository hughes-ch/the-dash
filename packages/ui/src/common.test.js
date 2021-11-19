/**
 *   Defines tests for the common module
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './root.css';
import {getColorFromCss} from './common';

/**
 * Unit tests
 */
it('converts color CSS variables to RGB', () => {
  const inputColor = '--foreground-1';
  const outputColor = getColorFromCss(inputColor);
  expect(outputColor.includes('--')).toBe(false);
  expect(outputColor).not.toEqual(inputColor);
});

it('passes standard hex colors untouched', () => {
  const inputColor = '#ffffff';
  const outputColor = getColorFromCss(inputColor);
  expect(outputColor).toEqual(inputColor);
});
