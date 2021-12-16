/**
 *   Defines tests for delete-website
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
require('./website-handling.test');
const config = require('@the-dash/common/app-config');
const deleteWebsite = require('./delete-website');

/**
 * Unit tests
 */
describe('the DELETE /site/<website> endpoint', () => {
  it('returns 500 if the app name is dangerous', async () => {
    await expect(deleteWebsite).toHandleDangerousPathNames();
  });
  
  it('returns 500 if the app name is empty', async () => {
    await expect(deleteWebsite).toHandleEmptyAppName();
  });

  it('returns 404 if the app name is not in the database', async () => {
    await expect(deleteWebsite).toReturn404WhenNotFound();
  });

  it('responds with 500 if internal error encountered', async () => {
    await expect(deleteWebsite).toHandleInternalErrors();
  });

  it('deletes websites that are found in DB', async () => {
    await expect(deleteWebsite).toDeleteWebsites();
  });
}); 
