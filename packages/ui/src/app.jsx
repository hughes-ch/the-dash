/**
 * Defines the App component
 */
import Authenticator from './authenticator';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navigate, Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard';
import React from 'react';
import SplashScreen from './splash-screen';

function App() {
  const dashboardAuthenticator = (
    <Authenticator>
      <Dashboard/>
    </Authenticator>
  );

  return (
    <Router>
      <Routes>
        <Route path='/' element={<SplashScreen/>}/>
        <Route path='/dashboard' element={dashboardAuthenticator}/>
        <Route path='*' element={<Navigate to='/' />}/>
      </Routes>
    </Router>
  );
}

export default App;
