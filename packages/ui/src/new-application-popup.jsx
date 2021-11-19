/**
 *   Defines the NewApplicationPopup component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './new-application-popup.css';
import React from 'react';

/**
 * Renders the NewApplicationPopup to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function NewApplicationPopup(props) {
  return(
    <React.Fragment>
      <div className='new-application-popup'>
        <form onSubmit={props.onSubmit} className='new-application-popup'>
          <h3>New Application</h3>
          <div>
            <label htmlFor='new-app'>Name</label>
            <input type='text' id='new-app' name='new-app'></input>
          </div>
          <div>
            <input type='submit' value='Submit'/>
            <button onClick={props.onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}

export default NewApplicationPopup;

