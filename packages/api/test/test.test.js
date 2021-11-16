/**
 *   Tests get-sites.js
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const getSites = require('@the-dash/api/lib/get-sites');
const db = require('@the-dash/api/scripts/setup-test-db');

beforeAll(async () => {
  process.env.AWS_ENDPOINT = process.env.MOCK_DYNAMODB_ENDPOINT;
  process.env.AWS_SITE_TABLE = 'test';
  process.env.MY_AWS_ACCESS_KEY_ID = 'test';
  process.env.MY_AWS_REGION = 'local';
  process.env.MY_AWS_SECRET_ACCESS_KEY = 'test';
  await db.init();
});

it('pings the database', async () => {
  const event = {};
  const response = await getSites(event);
  
  expect(response.statusCode).toEqual(200);
  expect(response.body).toContain('2020');
});
