/**
 *   Defines the index page
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './index.css';
import DeleteUrlButton from './delete-url-button';
import React from 'react';
import ReactDOM from 'react-dom';
import RefreshUrlButton from './refresh-url-button';
import UrlStatusLight from './url-status-light';

ReactDOM.render(
  <React.StrictMode>
    <DeleteUrlButton />
    <div style={{
      marginTop:'10rem',
      backgroundColor: 'white',
      height: '100px',
      padding: '100px',
    }}>
      <RefreshUrlButton isLoading={true}/>
      <UrlStatusLight isDown={true}/>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//import reportWebVitals from './reportWebVitals';
//reportWebVitals();
