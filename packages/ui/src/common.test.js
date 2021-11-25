/**
 *   Defines tests for the common module
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './root.css';
import config from './app-config';
import {getApplicationRequest,
        getApplicationDeleteRequest,
        getApplicationPutRequest,
        getColorFromCss,
        getSiteListRequest} from './common';
import {fireEvent, render, screen} from '@testing-library/react';

/**
 * Common infrastructure
 */
export const buttonFocusMatchers = {
  /**
   * Matcher to check border color on focus
   */
  toHaveFocusBorderOnEvent(received, event) {
    const root = window.document.createElement('div');
    const style = window.document.createElement('style');
    style.innerHTML = `
    html {
      --focus-color: blue;
    }
  `;

    window.document.head.appendChild(style);
    document.body.appendChild(root);

    const {container, getByRole} = render(received, {container: root});

    const expected = getColorFromCss('--focus-color');
    const button = getByRole('button');
    fireEvent[event](button);
    if (button.style.borderColor === expected) {
      return {
        pass: true,
        message: () => `Expected border color not to match ${expected}`,
      };
    } else {
      return {
        pass: false,
        message: () => `Expected border color to match ${expected}`,
      };
    }
  },
};

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

it('provides params to get delete application API', () => {
  const appToDelete = 'my.app';
  const apiParams = getApplicationDeleteRequest(appToDelete);

  expect(apiParams.data.method).toEqual('DELETE');
  expect(apiParams.url).toMatch(
    new RegExp(`http://localhost(:\d+)?/sites/${appToDelete}`));
});

it('tests getApplicationRequest', () => {
  const appToGet = 'my.app';
  const apiParams = getApplicationRequest(appToGet);

  expect(apiParams.url).toMatch(
    new RegExp(`http://localhost(:\d+)?/sites/${appToGet}`));
});

it('tests getApplicationPutRequest', () => {
  const appToPut = 'my.app';
  const apiParams = getApplicationPutRequest(appToPut);

  expect(apiParams.data.method).toEqual('PUT');
  expect(apiParams.url).toMatch(
    new RegExp(`http://localhost(:\d+)?/sites/${appToPut}`));

  expect(apiParams.data.body).toEqual(JSON.stringify({
    url: appToPut
  }));
});

it('tests getSiteListRequest', () => {
  const apiParams = getSiteListRequest();
  expect(apiParams.url).toMatch(new RegExp('http://localhost(:\d+)?/sites'));
});

