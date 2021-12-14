/**
 *   Defines the function for DELETE /site/<website>
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { deleteWebsite } = require('./website-handling');

/**
 * Entry into Netlify function
 */
module.exports = async function(event) {
  return deleteWebsite(event);
}
