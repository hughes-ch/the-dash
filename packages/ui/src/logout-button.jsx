/**
 *   Defines the LogoutButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import AuthContext from './auth-context';
import NavButton from './nav-button';
import React, {useContext} from 'react';

/**
 * Renders the LogoutButton to the DOM
 *
 * @return {React.Component}
 */
function LogoutButton() {
  const auth = useContext(AuthContext);
  
  return(
    <NavButton text='Log out' onClick={auth.actions.logout}/>
  );
}

export default LogoutButton;
