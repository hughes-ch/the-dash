/**
 *   Defines the function for GET /sites/<website>
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { updateExisting } = require('./website-handling');

/**
 * Entry into Netlify function
 */
module.exports = async function(event) {
  return updateExisting(event);
}
