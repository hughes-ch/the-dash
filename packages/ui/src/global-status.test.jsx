/**
 *   Defines tests for the GlobalStatus
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import GlobalStatus from './global-status';
import React from 'react';
import {render, screen} from '@testing-library/react';

import { JSDOM } from 'jsdom';

/**
 * Global setup
 */
let root;

beforeEach(() => {
  root = window.document.createElement('div');
  const style = window.document.createElement('style');
  style.innerHTML = `
    html {
      --alarm-color: red;
      --all-clear-color: green;
    }
  `;

  window.document.head.appendChild(style);
  document.body.appendChild(root);
});

expect.extend({
  /**
   * Custom alarm matcher
   */
  toHaveAlarm(received, alarm) {
    if (screen.queryByText(alarm)) {
      return {
        pass: true,
        message: () => `Expected alarm not to say: ${alarm}`,
      };
    } else {
      return {
        pass: false,
        message: () => `Expected alarm to say: ${alarm}`,
      };
    }
  },

  /**
   * Custom style matcher
   */
  toHaveBackgroundColor(received, color) {
    const expectedColor = window.getComputedStyle(document.documentElement)
          .getPropertyValue(color);
    
    if (!expectedColor) {
      return {
        pass: false,
        message: `Expected ${color} to be a valid CSS property value`,
      };
    }

    const backgroundColor = received.firstChild.style.backgroundColor;
    if (backgroundColor === expectedColor) {
      return {
        pass: true,
        message: () => `Expected not ${expectedColor}. Got ${backgroundColor}`,
      };
    } else {
      return {
        pass: false,
        message: () => `Expected ${expectedColor}. Got ${backgroundColor}`,
      };
    }
  },
});

/**
 * Unit tests
 */
it('correctly renders with no alarms', () => {
  const {container} = render(
    (
      <GlobalStatus numAlarms={0}/>
    ),
    {
      container: root,
    });
  
  expect(container).toHaveAlarm('No Alarms');
  expect(container).toHaveBackgroundColor('--all-clear-color');
});

it('correctly renders with 1 alarm', () => {
  const numAlarms = 1;
  const {container} = render(
    (
      <GlobalStatus numAlarms={numAlarms}/>
    ),
    {
      container: root,
    });
  
  expect(container).toHaveAlarm(`${numAlarms} Alarm`);
  expect(container).toHaveBackgroundColor('--alarm-color');
});

it('correctly renders with multiple alarms', () => {
  const numAlarms = 45;
  const {container} = render(
    (
      <GlobalStatus numAlarms={numAlarms}/>
    ),
    {
      container: root,
    });
  
  expect(container).toHaveAlarm(`${numAlarms} Alarms`);
  expect(container).toHaveBackgroundColor('--alarm-color');
});

it('handles undefined number of alarms', () => {

  const {container} = render(
    (
      <GlobalStatus numAlarms={undefined}/>
    ),
    {
      container: root,
    });

  expect(container).toHaveBackgroundColor('--all-clear-color');
});

