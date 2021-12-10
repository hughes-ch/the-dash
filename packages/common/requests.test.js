/**
 *   Defines tests for common request functions
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { absoluteUrl, getJwksRequest } = require('./requests');

describe('the absoluteUrl function', () => {
  it('returns URL untouched if it is already absolute', () => {
    const url = 'http://my.website.com';
    expect(absoluteUrl(url)).toEqual(url);
  });

  it('turns relative URLs into absolute', () => {
    const url = '/relative/path';
    const protocol = 'http:';
    const host = 'my.website.com';

    delete window.location;
    window.location = {
      protocol: protocol,
      host: host,
    };
    
    expect(absoluteUrl(url)).toEqual(`${protocol}//${host}${url}`);
  });
});

describe('the getJwksRequest function', () => {
  it('returns the absolute URL of the jwks.json file', () => {
    const config = require('@the-dash/common/app-config');
    config.AUTH_ISSUER = 'http://the.issuer.com';
    expect(getJwksRequest().url)
      .toBe(`${config.AUTH_ISSUER}/.well-known/jwks.json`);
  }); 
}); 
