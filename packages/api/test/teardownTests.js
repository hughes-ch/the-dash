/**
 *   Tears down local dev API environment 
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
let shell = require('shelljs');
let config = require('@the-dash/common/config.json');

const containerName = config['test-db-container-name'];

shell.exec(`docker rm -f ${containerName}`);
