/**
 * Defines the App component
 */
import Authenticator from './authenticator';
import { BrowserRouter as Router } from 'react-router-dom';
import config from './app-config';
import { Navigate, Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard';
import React from 'react';
import SplashScreen from './splash-screen';

function App() {
  const dashboardPath = '/' + config.DASHBOARD_URL;
  const dashboardAuthenticator = (
    <Authenticator>
      <Dashboard/>
    </Authenticator>
  );

  return (
    <Router>
      <Routes>
        <Route path='/' element={<SplashScreen/>}/>
        <Route path={dashboardPath} element={dashboardAuthenticator}/>
        <Route path='*' element={<Navigate to='/' />}/>
      </Routes>
    </Router>
  );
}

export default App;
