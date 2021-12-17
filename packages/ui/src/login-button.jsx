/**
 *   Defines the LoginButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import config from '@the-dash/common/app-config';
import { Link } from 'react-router-dom';
import NavButton from './nav-button';
import React from 'react';

/**
 * Renders the LoginButton to the DOM
 *
 * @return {React.Component}
 */
function LoginButton() {
  return(
    <Link to={`/${config.DASHBOARD_URL}`}>
      <NavButton text='Log in'/>
    </Link>
  );
}

export default LoginButton;

