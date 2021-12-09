/**
 *   Defines the NavigationBar component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './nav-bar.css';
import AuthContext from './auth-context';
import LoginButton from './login-button';
import LogoutButton from './logout-button';
import React, {useContext, useEffect, useState} from 'react';

const authButtons = {
  login: LoginButton,
  logout: LogoutButton,
};

/**
 * Renders the NavigationBar to the DOM
 *
 * @return {React.Component}
 */
function NavigationBar() {
  // Select Login/Logout button based on current Auth status
  const auth = useContext(AuthContext);
  const [authButtonType, setAuthButtonType] = useState('login');
  useEffect(() => {
    setAuthButtonType(auth.credentials.isLoggedIn ? 'logout' : 'login');
    
  }, [auth.credentials.isLoggedIn]);

  const AuthButton = authButtons[authButtonType];

  // Render navigation bar
  return(
    <nav className='navigation-bar'>
      <span>The Dash</span>
      <AuthButton />
    </nav>
  );
}

export default NavigationBar;

