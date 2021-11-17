/**
 *   Defines the index page
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { LoginButton } from './login-button';
import { LogoutButton } from './logout-button';

ReactDOM.render(
  <React.StrictMode>
    <LoginButton />
    <LogoutButton />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//import reportWebVitals from './reportWebVitals';
//reportWebVitals();
