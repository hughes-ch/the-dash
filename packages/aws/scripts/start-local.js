/**
 *   Starts a local version of this function
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { handler } = require('../functions/index');
const prompt = require('password-prompt');

async function run() {
  const username = await prompt('username: ');
  const password = await prompt('password: ');
  process.env.AWS_COGNITO_USER = username;
  process.env.AWS_COGNITO_PASS = password;

  return handler(null, null);
}

run();
