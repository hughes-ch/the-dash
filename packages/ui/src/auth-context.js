/**
 *   Defines the context for handling login/logout
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import config from '@the-dash/common/app-config';
import React from 'react';

/**
 * Creates the AuthContext
 *
 * @return {Object} representing AuthContext.value
 */
export function createAuthContext() {
  return({
    credentials: {
      username: undefined,
      email: undefined,
      permissions: undefined,
      isLoggedIn: false,
    },
    actions: {
      /**
       * Starts the initial login request by redirecting the client to
       * AWS cognito.
       *
       * @return {undefined}
       */
      login: () => {
        // Define login parameters
        const baseUrl = config.AUTH_BASE_URL;
        const clientId = config.AUTH_CLIENT_ID;
        const responseType = config.AUTH_RESPONSE_TYPE;
        const scope = config.AUTH_SCOPE;
        const redirectUrl = window.location.href;

        // Redirect to AWS cognito
        const authUrl = `${baseUrl}login?client_id=${clientId}&` +
              `response_type=${responseType}&scope=${scope}&` +
              `redirect_uri=${redirectUrl}`;
        
        window.location.href = authUrl;
      },

      /**
       * Starts the logout process
       *
       * @return {undefined}
       */
      logout: () => {
        const authBaseUrl = config.AUTH_BASE_URL;
        const clientId = config.AUTH_CLIENT_ID;
        const appBaseUrl = window.location.origin + '/';
        
        const logoutUrl = `${authBaseUrl}logout?client_id=${clientId}&` +
              `logout_uri=${appBaseUrl}`;

        window.location.href = logoutUrl;
      },
    }
  });
}

/**
 * Creates the context to handle sign in, sign out, etc
 *
 * Two objects are defined here:
 *   Credentials: Holds current logged-in user's info
 *   Actions: Methods for sign in/sign out 
 */
const AuthContext = React.createContext(createAuthContext());
export default AuthContext;
