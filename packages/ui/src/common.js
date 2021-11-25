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

/**
 * Returns the absolute URL of a relative URL
 *
 * @param {String} url Relative URL
 * @return {String}
 */
function absoluteUrl(url) {
  const protocol = window.location.protocol;
  const host = window.location.host;

  return `${protocol}//${host}${url}`;
}

/**
 * Returns a request for an application delete
 *
 * @param {String} app App to delete
 * @return {String} 
 */
export function getApplicationDeleteRequest(app) {
  
  return {
    url: absoluteUrl(`/sites/${app}`),
    data: {
      method: 'DELETE',
    },
  };
}

/**
 * Returns a request to get status of single application
 *
 * @param {String} app Requested app
 * @return {String} 
 */
export function getApplicationRequest(app) {
  return {
    url: absoluteUrl(`/sites/${app}`),
    data: {},
  };
}

/**
 * Returns a request to PUT new application
 *
 * @param {String} app New app
 * @return {String} 
 */
export function getApplicationPutRequest(app) {
  return {
    url: absoluteUrl(`/sites/${app}`),
    data: {
      method: 'PUT',
      body: JSON.stringify({
        url: app,
      }),
    },
  };
}

/**
 * Returns a request to GET all sites
 *
 * @return {String} 
 */
export function getSiteListRequest() {
  return {
    url: absoluteUrl(`/sites`),
    data: {},
  };
}

/**
 * Dynamically colors border on hover, focus
 *
 * Can be used like {...dynamicBorder()}
 *
 * @param {String}   backgroundColor Object background color  
 * @param {Function} setBorderColor  Function to set border color
 * @return {Object} 
 */
export function dynamicBorder(backgroundColor, setBorderColor) {
  const useFocusedBorder = (event) => {
    setBorderColor(getColorFromCss('--focus-color'));
  };
  const useUnfocusedBorder = (event) => {
    setBorderColor(getColorFromCss(backgroundColor));
  };
  return {
    onFocus: useFocusedBorder,
    onBlur: useUnfocusedBorder,
    onMouseOver: useFocusedBorder,
    onMouseOut: useUnfocusedBorder
  };
}
