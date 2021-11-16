/**
 *   Tests get-sites.js
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const getSites = require('@the-dash/api/lib/get-sites');

beforeAll(() => {
  process.env.USE_LOCAL_DB = '1';
});

it('pings the database', async () => {
  const event = {};
  const response = await getSites(event);
  
  expect(response.statusCode).toEqual(200);
  expect(response.body).toContain('2020');
});
