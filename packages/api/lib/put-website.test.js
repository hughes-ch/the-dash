/**
 *   Defines tests for put-website
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
require('./website-handling.test');
const config = require('@the-dash/common/app-config');
const putWebsite = require('./put-website');

describe('the PUT /site/<website> endpoint', () => {
  it('returns 500 if the app name is dangerous', async () => {
    await expect(putWebsite).toHandleDangerousPathNames();
  });
  
  it('returns 500 if the app name is empty', async () => {
    await expect(putWebsite).toHandleEmptyAppName();
  });

  it('adds new websites', async () => {
    await expect(putWebsite).toCreateNewWebsites();
  }, config.LONG_RUNNING_FETCH_TIMEOUT * 2);

  it('responds with 500 if internal error encountered', async () => {
    await expect(putWebsite).toHandleInternalErrors();
  });

  it('declares timed-out websites down', async () => {
    await expect(putWebsite).toHandleWebsiteTimeouts();
  }, config.LONG_RUNNING_FETCH_TIMEOUT * 2);
}); 
