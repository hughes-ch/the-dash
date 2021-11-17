/**
 *   Defines the LoginButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './login-button.css';
import AuthContext from './auth-context';
import React, {useContext} from 'react';

/**
 * Renderes the LoginButton to the DOM
 *
 * @return {React.Component}
 */
function LoginButton() {
  const auth = useContext(AuthContext);

  return(
    <button className='nav-button' onClick={auth.actions.login}>
      Log in
    </button>
  );
}

export default LoginButton;

