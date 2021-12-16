/**
 *   Defines tests for get-website
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
require('./website-handling.test');
const config = require('@the-dash/common/app-config');
const getWebsite = require('./get-website');

/**
 * Unit tests
 */
describe('the GET /site/<website> endpoint', () => {
  it('returns 500 if the app name is dangerous', async () => {
    await expect(getWebsite).toHandleDangerousPathNames();
  });
  
  it('returns 500 if the app name is empty', async () => {
    await expect(getWebsite).toHandleEmptyAppName();
  });

  it('returns 404 if the app name is not in the database', async () => {
    await expect(getWebsite).toReturn404WhenNotFound();
  });

  it('detects when websites are up', async () => {
    await expect(getWebsite).toDetectWorkingWebsites();
  });

  it('detects down websites', async () => {
    await expect(getWebsite).toDetectDownWebsites();
  });

  it('responds with 500 if internal error encountered', async () => {
    await expect(getWebsite).toHandleInternalErrors();
  });

  it('declares timed-out websites down', async () => {
    await expect(getWebsite).toHandleWebsiteTimeouts();
  }, config.LONG_RUNNING_FETCH_TIMEOUT * 2);
}); 
