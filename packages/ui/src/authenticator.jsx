/**
 *   Defines the Authenticator component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import AuthContext from './auth-context';
import authenticate from '@the-dash/common/authenticate';
import config from '@the-dash/common/app-config';
import {getCredentialCookie} from './common';
import React, {useContext, useEffect, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';

const navigateAway = (
  <Navigate to='/'/>
);

/**
 * Verifies the token from the URL hash
 *
 * @param {String} tokenStr Encoded token from URL hash
 * @return {Boolean}
 */
async function verifyToken(tokenStr) {
  const token = tokenStr.split('=')[1];
  const isAuthenticated = authenticate(token);
  if (isAuthenticated) {
    document.cookie = `${config.CREDENTIAL_COOKIE}=${token}`;
  }
  return isAuthenticated;
}

/**
 * Verifies a client's cookie
 *
 * @return {Boolean}
 */
async function verifyCookie() {
  const cookie = getCredentialCookie();
  return await authenticate(cookie);
}

/**
 * Verify a client
 *
 * @param {Object}  location  Window.location object
 * @return {Boolean}
 */
async function verifyClient(location) {
  if (await verifyCookie()) {
    return true;
  }
  
  const hash = location.hash.slice(1);
  const [ idTokenParam,
          accessTokenParam,
          expireTimeParam,
          bearerParam ] = hash.split('&');

  if (idTokenParam && accessTokenParam && expireTimeParam && bearerParam) {
    return await verifyToken(idTokenParam);
  } else {
    return false;
  }
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
    auth.credentials.isLoggedIn = await verifyClient(location);
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

