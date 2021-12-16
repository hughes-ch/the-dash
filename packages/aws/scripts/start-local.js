/**
 *   Starts a local version of this function
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const fs = require('fs');
const { handler } = require('../functions/index');

try {
  const data = fs.readFileSync(`${__dirname}/.env`, 'utf8').split('\n');
  data.forEach(e => {
    const [env, val] = e.split('=', 2);
    process.env[env] = val;
  });
  handler(null, null);
  
} catch (err) {
  console.log(err);
}
