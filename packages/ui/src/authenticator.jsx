/**
 *   Defines the Authenticator component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import AuthContext from './auth-context';
import {getJwksRequest} from './common';
import config from './app-config';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import React, {useContext, useEffect, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';

const navigateAway = (
  <Navigate to='/'/>
);

/**
 * Gets the expire time from the expires_in parameter in the URL hash
 *
 * @param {String} expireParam From the URL hash
 * @return {Date}
 */
function getExpireTime(expireParam) {
  const numSeconds = expireParam.split('=')[1];
  const now = new Date();
  const expireTime = now.setSeconds(now.getSeconds() + numSeconds);
  return expireTime;
}

/**
 * Gets the JWK from AWS
 *
 * @return {Object} 
 */
async function fetchJwks() {
  try {
    const jwksRequest = getJwksRequest();
    const response = await fetch(jwksRequest.url);
    if (!response.ok) {
      return null;
    }

    return await response.json();
    
  } catch(err) {
    console.log(err);
    return null;
  }
}

/**
 * Verifies the token from the URL hash
 *
 * @param {String} tokenStr Encoded token from URL hash
 * @param {Date} expireTime Time this token expires
 * @return {Boolean}
 */
async function verifyToken(tokenStr, expireTime) {
  // Split token to verify structure
  const token = tokenStr.split('=')[1];
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    return false;
  }

  // Verify base64 encoding
  let decodedHeader;
  let decodedPayload;
  try {
    decodedHeader = JSON.parse(atob(header));
    decodedPayload = JSON.parse(atob(payload));
  } catch (err) {
    return false;
  }

  // Verify KID 
  const jwks = await fetchJwks();
  if (!jwks) {
    return false;
  }

  const jwk = jwks.keys.find(e => e.kid === decodedHeader.kid);
  if (!jwk) {
    return false;
  }

  // Verify signature
  const pem = jwkToPem(jwk);
  try {
    jwt.verify(token, pem, { algorithms: [jwk.alg] });
  } catch (err) {
    return false;
  }

  // Verify time hasn't expired
  if (decodedPayload.exp <= (new Date()).valueOf()/1000) {
    return false;
  }

  // Verify aud matches app client ID
  if (decodedPayload.aud !== config.AUTH_CLIENT_ID) {
    return false;
  }
  
  // Verify iss matches user pool
  if (decodedPayload.iss !== config.AUTH_ISSUER) {
    return false;
  }
  
  // Verify token_use as either id or access
  return decodedPayload.token_use === 'id';
}

/**
 * Renders the Authenticator to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function Authenticator(props) {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const [authorizedContent, setAuthorizedContent] = useState('');

  // eslint-disable-next-line 
  useEffect(async () => {
    const hash = location.hash.slice(1);
    const [ idTokenParam,
            accessTokenParam,
            expireTimeParam,
            bearerParam ] = hash.split('&');

    if (idTokenParam && accessTokenParam && expireTimeParam && bearerParam) {
      const expireTime = getExpireTime(expireTimeParam);
      auth.credentials.isLoggedIn = await verifyToken(idTokenParam, expireTime);
    } else {
      auth.credentials.isLoggedIn = false;
    }
    
    if (!auth.credentials.isLoggedIn) {
      setAuthorizedContent(navigateAway);
      
    } else {
      setAuthorizedContent(props.children);
    }
  }, [auth, location, props.children]);
  
  return(
    <React.Fragment>
      {authorizedContent}
    </React.Fragment>
  );
}

export default Authenticator;

