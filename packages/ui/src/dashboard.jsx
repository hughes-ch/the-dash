/**
 *   Defines the Dashboard component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './dashboard.css';
import ApplicationCard from './application-card';
import config from './app-config';
import DashboardButton from './dashboard-button';
import DeleteApplicationPopup from './delete-application-popup';
import DetailedStatusBubble from './detailed-status-bubble';
import ErrorBar from './error-bar';
import {getApplicationDeleteRequest,
        getApplicationPutRequest,
        getApplicationRequest,
        getSiteListRequest} from './common';
import fetch from 'node-fetch';
import GlobalStatus from './global-status';
import NavigationBar from './nav-bar';
import NewApplicationPopup from './new-application-popup';
import React, {useEffect, useState} from 'react';

/**
 * Checks response for valid parameters
 *
 * @param {Object} response Response from API
 * @return {Object}
 */
function parseSingleAppResponse(response) {
  if (response.isDown === undefined ||
      response.lastStatusChange === undefined ||
      response.lastStatusUpdate === undefined ||
      response.nextAutomatedUpdate === undefined) {

    throw Error('Invalid JSON response');
  }
  
  return {
    name: response.name,
    isDown: response.isDown,
    lastStatusChange: new Date(response.lastStatusChange),
    lastStatusUpdate: new Date(response.lastStatusUpdate),
    nextAutomatedUpdate: new Date(response.nextAutomatedUpdate),
  };
}

/**
 * Sorts the app list
 *
 * @param {String} left  Name of one application to sort
 * @param {String} right Name of other application to sort
 * @return {Number}
 */
function sortAppList(left, right) {
  if (left.name < right.name) {
    return -1; 
  } else if (left.name > right.name) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * Parses a full application list
 *
 * @param {Object} response  Json response
 * @return {Object}
 */
function parseFullAppList(response, state) {
  if (response.sites === undefined) {
    state.error.set('Could not get site list. Malformed response');
    return state.applications.val;
  }

  const appList = response.sites.map(parseSingleAppResponse);
  appList.sort(sortAppList);
  return appList;
}

/**
 * Gets the initial application list
 *
 * @param {Object} state State of the dashboard
 * @return {undefined}
 */
async function getInitialApplicationList(state) {
  let response;
  try {
    const fetchParams = getSiteListRequest();
    response = await fetch(fetchParams.url, fetchParams.data);
  } catch (err) {
    state.error.set(`Could not get app list: Internal app error [${err}]`);
    return;
  }

  if (response.status !== 200) {
    state.error.set(`Could not get app list. Status [${response.status}]`);
    return;
  }

  let appList; 
  try {
    const parsedJson = await response.json();
    appList = parseFullAppList(parsedJson, state);
    
  } catch(err) {
    state.error.set(`Could not get app list: ${err}.`);
    return;
  }
  
  state.applications.set(appList);
}

/**
 * Gets the time of the last update from application list
 *
 * @param {Array} appList List of applications
 * @return {String} in format X moment/hour/day ago
 */
function getLastUpdateTime(appList) {
  if (appList.length === 0) {
    return 'Never';
  }
  
  const dateList = appList.map((elem) => elem.lastStatusUpdate);
  dateList.sort((a, b) => {
    return b.valueOf() - a.valueOf();
  });

  const currentTime = new Date();
  const hourDiff = Math.round(
    (currentTime.valueOf() - dateList[0].valueOf()) / 1000 / 60 / 60);

  if (hourDiff < 1) {
    return `A few minutes ago`;
  } else if (hourDiff < 24) {
    const hourStr = hourDiff === 1 ? 'hour' : 'hours';
    return `${hourDiff} ${hourStr} ago`;
  } else {
    const numDays = Math.round(hourDiff/24);
    const dayStr = numDays === 1 ? 'day' : 'days';
    return `${numDays} ${dayStr} ago`;
  }
}

/**
 * Estimates the time of the next update 
 *
 * @param {Array} appList List of applications
 * @return {String} in format "In X moment/hour/day"
 */
function getNextUpdateTime(appList) {
  if (appList.length === 0) {
    return 'Never';
  }
  
  const dateList = appList.map((elem) => elem.nextAutomatedUpdate);
  dateList.sort((a, b) => {
    return a.getTime() - b.getTime();
  });

  const currentTime = new Date();
  const hourDiff = Math.round(
    (dateList[0].getTime() - currentTime.getTime()) / 1000 / 60 / 60);
  if (hourDiff < 1) {
    return `Imminent`;
  } else if (hourDiff < 24) {
    const hourStr = hourDiff === 1 ? 'hour' : 'hours';
    return `${hourDiff} ${hourStr}`;
  } else {
    const numDays = Math.round(hourDiff/24);
    const dayStr = numDays === 1 ? 'day' : 'days';
    return `${numDays} ${dayStr}`;
  }
}

/**
 * Create the delete handler for the specified application
 *
 * @param {Object} state Dashboard state
 * @param {Object} app   Application state
 * @return {function}
 */
function createDeleteHandler(state, app) {
  return () => {
    state.popupType.set(`delete:${app.name}`);
  };
}

/**
 * Fetches single application status
 *
 * @param {Object} state  Dashboard state
 * @param {Number} appIdx Application index
 * @return {undefined}
 */
async function fetchSingleAppStatus(state, appIdx) {
  if (state.applications.val === undefined) {
    return;
  }
  
  let response;
  const appName = state.applications.val[appIdx].name;
  try {
    const fetchParams = getApplicationRequest(appName);
    response = await fetch(fetchParams.url, fetchParams.data);
  } catch (err) {
    state.error.set(`Could not get ${appName}. Internal app error [${err}]`);
    return;
  }

  if (response.status !== 200) {
    state.error.set(`Could not get ${appName} status [${response.status}]`);
    return;
  }

  let parsedResponse;
  try {
    let parsedJson = await response.json();
    parsedResponse = parseSingleAppResponse(parsedJson);
    
  } catch(err) {
    state.error.set(`Could not get ${appName}: ${err}.`);
    return;
  }
  
  state.applications.val[appIdx] = parsedResponse;
  state.applications.set(state.applications.val);
}

/**
 * Creates functions to handle application refresh
 *
 * @param {Object} state Dashboard state
 * @return {Array}
 */
function createRefreshFunctions(state) {
  if (state.applications.val === undefined) {
    return [];
  }
  
  const refreshFunctions = new Array(state.applications.val.length);
  for (let ii = 0; ii < state.applications.val.length; ii++) {
    refreshFunctions[ii] = async () => {
      const loadingState = Array.from(state.applications.val);
      loadingState[ii].isLoading = true;
      state.applications.set(loadingState);
      
      await fetchSingleAppStatus(state, ii);
      
      const refreshedState = Array.from(state.applications.val);
      refreshedState[ii].isLoading = false;
      state.applications.set(refreshedState);
    };
  }
  return refreshFunctions;
}

/**
 * Creates application card JSX elements
 *
 * @param {Object} state        Dashboard state
 * @param {Array}  refreshFuncs Refresh functions
 * @return {React.Component}
 */
function createApplicationCards(state, refreshFuncs) {
  if (state.applications.val === undefined) {
    return [];
  }
  
  const applicationCards = new Array(state.applications.val.length);
  for (let ii = 0; ii < state.applications.val.length; ii++) {
    applicationCards[ii] = (
      <ApplicationCard
        app={state.applications.val[ii].name}
        isDown={state.applications.val[ii].isDown}
        isLoading={state.applications.val[ii].isLoading}
        key={state.applications.val[ii].name}
        lastStatusChange={state.applications.val[ii].lastStatusChange}
        onDeleteClick={createDeleteHandler(state, state.applications.val[ii])}
        onRefreshClick={refreshFuncs[ii]} />
    );
  }
  return applicationCards;
}

/**
 * Handler for the "Add Another" button
 *
 * @param {Object} state State of dashboard
 * @return {function}
 */
function createOnAddAnotherHandler(state) {
  return () => {
    state.popupType.set('new');
  };
}

/**
 * Handler for the "Refresh All" button
 *
 * @param {Array} refreshFuncs List of refresh functions
 * @return {function}
 */
function createOnRefreshAllHandler(refreshFuncs) {
  return () => {
    refreshFuncs.forEach(async (elem) => await elem());
  };
}

/**
 * Creates handler for popup windows
 *
 * @param {function} setPopupType Function to update state
 * @param {function} func         Function to execute on event
 * @return {undefined}
 */
function createPopupEventHandler(setPopupType, func) {
  return (event) => {
    event.preventDefault();
    setPopupType('none');
    func(event);
  };
}

/**
 * Generates a new popup window based on current state
 *
 * @param {Object} state Dashboard state
 * @return {React.Component}
 */
function generatePopupType(state) {

  // Handle requests to delete apps
  const deletePopupMatch = state.popupType.val.match(/delete:(?<app>.*)/);
  if (deletePopupMatch) {
    const appName = deletePopupMatch.groups.app;

    const deleteApp = async (event) => {
      if (/[^.\w-]/.test(appName)) {
        state.error.set(`Could not delete ${appName}: Invalid chars in name`);
        return;
      }

      let response;
      const fetchParams = getApplicationDeleteRequest(appName);
      try {
        response = await fetch(fetchParams.url, fetchParams.data);
      } catch (err) {
        state.error.set(`Could not delete ${appName}: ` +
                        `Internal app error [${err}]`);
        return;
      }
      
      if (response.status !== 200) {
        state.error.set(`Could not delete ${appName}: ` +
                        `Error from service [${response.status}]`);
        return;
      }

      let appList;
      try {
        const parsedJson = await response.json();
        appList = parseFullAppList(parsedJson, state);
        
      } catch(err) {
        state.error.set(`Could not delete ${appName}: ${err}.`);
        return;
      }
      
      state.applications.set(appList);
    };
    
    return (
      <DeleteApplicationPopup
        app={appName}
        onCancel={createPopupEventHandler(state.popupType.set, (e)=>{})}
        onSubmit={createPopupEventHandler(state.popupType.set, deleteApp)}/>
    );

  // Handle requests to add new apps
  } else if (state.popupType.val === 'new') {
    const createApp = async(event) => {
      const newAppName = event.target.elements['name'].value;

      let response;
      const fetchParams = getApplicationPutRequest(newAppName);
      try {
        response = await fetch(fetchParams.url, fetchParams.data);
      } catch (err) {
        state.error.set(`Could not add ${newAppName}: ` +
                        `Internal app error [${err}]`);
        return;
      }
      
      if (response.status !== 200) {
        state.error.set(`Could not add ${newAppName}: ` +
                        `Error from service [${response.status}]`);
        return;
      }

      try {
        const parsedJson = await response.json();
        const parsedResponse = parseSingleAppResponse(parsedJson);
        const newState = state.applications.val === undefined ? [] :
              Array.from(state.applications.val);
        
        newState.push(parsedResponse);
        newState.sort(sortAppList);
        state.applications.set(newState);

      } catch (err) {
        state.error.set(`Could not add ${newAppName}: Problem parsing response`);
        return;
      }
    };

    const appNameList = state.applications.val === undefined ? [] :
          state.applications.val.map((app) => app.name);
    
    return (
      <NewApplicationPopup
        apps={appNameList}
        onCancel={createPopupEventHandler(state.popupType.set, (e)=>{})}
        onSubmit={createPopupEventHandler(state.popupType.set, createApp)} />
    );

  // Handle invalid requests for popups
  } else {
    return (
      <React.Fragment>
      </React.Fragment>
    );
  }
}

/**
 * Renders the Dashboard to the DOM
 *
 * @return {React.Component}
 */
function Dashboard(props) {

  // Define current application state
  const [applications, setApplications] = useState(undefined);
  const [error, setError] = useState('');
  const [popupType, setPopupType] = useState('none');
  const state = {
    applications: {
      set: setApplications,
      val: applications,
    },
    error: {
      set: setError,
      val: error,
    },
    popupType: {
      set: setPopupType,
      val: popupType,
    }
  };

  useEffect(() => {
    getInitialApplicationList(state);
  }, []);
  
  useEffect(() => {
    const timeout = setTimeout(
      (e) => setError(''),
      config.DASHBARD_ERROR_TIMEOUT);

    return () => clearTimeout(timeout); 
  }, [error]);

  // Display the error bar                     
  let errorBar = (
    <React.Fragment>
    </React.Fragment>
  );
  if (error) {
    errorBar = (<ErrorBar text={error}/>);
  }

  // Calculate detailed status
  const numAlarms = applications === undefined ?
        undefined : applications.filter((elem) => elem.isDown).length;
  const numApps = applications === undefined ?
        'Unknown' : applications.length;
  const lastUpdate = applications === undefined ?
        'N/A' : getLastUpdateTime(applications);
  const nextUpdate = applications === undefined ?
        'N/A' : getNextUpdateTime(applications);

  const refreshFunctions = createRefreshFunctions(state);
  const applicationCards = createApplicationCards(state, refreshFunctions);
  
  return(
    <React.Fragment>
      <NavigationBar />
      {errorBar}
      <div className='dashboard'>
        <div>
          <GlobalStatus numAlarms={numAlarms}/>
          <DetailedStatusBubble numApps={numApps}
                                lastUpdate={lastUpdate}
                                nextUpdate={nextUpdate}/>
        </div>

        {applicationCards}

        <DashboardButton onClick={createOnAddAnotherHandler(state)}
                         name='Add Another URL'/>
        <DashboardButton onClick={createOnRefreshAllHandler(refreshFunctions)}
                         name='Refresh All'/>
      </div>
      {generatePopupType(state)}
    </React.Fragment>
  );
}

export default Dashboard;

