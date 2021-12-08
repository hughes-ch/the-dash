/**
 *   Defines the Authenticator component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import AuthContext from './auth-context';
import React, {useContext, useEffect, useState} from 'react';
import {Navigate, useParams} from 'react-router-dom';

const navigateAway = (
  <Navigate to='/'/>
);

/**
 * Renders the Authenticator to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function Authenticator(props) {
  const auth = useContext(AuthContext);
  const urlParams = useParams();
  const [authorizedContent, setAuthorizedContent] = useState(navigateAway);
  
  useEffect(() => {
    auth.actions.checkCredentials(urlParams);
    if (!auth.credentials.isLoggedIn) {
      setAuthorizedContent(navigateAway);
      
    } else {
      setAuthorizedContent(props.children);
    }
  }, [auth, props.children, urlParams]);
  
  return(
    <React.Fragment>
      {authorizedContent}
    </React.Fragment>
  );
}

export default Authenticator;

