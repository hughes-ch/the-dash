/**
 *   Defines the function for PUT /site/<website>
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { addNewWebsite } = require('./website-handling');

/**
 * Entry into Netlify function
 */
module.exports = async function(event) {
  return addNewWebsite(event);
}
