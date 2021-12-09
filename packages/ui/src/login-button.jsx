/**
 *   Defines the LoginButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import AuthContext from './auth-context';
import NavButton from './nav-button';
import React, {useContext} from 'react';

/**
 * Renders the LoginButton to the DOM
 *
 * @return {React.Component}
 */
function LoginButton() {
  const auth = useContext(AuthContext);

  return(
    <NavButton text='Log in' onClick={auth.actions.login}/>
  );
}

export default LoginButton;

