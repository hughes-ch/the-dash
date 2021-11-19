/**
 * Defines common functions and constants
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */

/**
 * Returns the color or looks up the specified variable from the stylesheet
 *
 * @param {String} color Color to look up
 * @return {String}
 */
export function getColorFromCss(color) {
  let returnVal = color;
  if (color.includes('--')) {
    returnVal = window.getComputedStyle(document.documentElement)
      .getPropertyValue(color);
  }
  return returnVal;
}
