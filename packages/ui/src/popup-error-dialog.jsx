/**
 *   Defines the PopupErrorDialog component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './popup-error-dialog.css';
import React from 'react';

/**
 * Renders the PopupErrorDialog to the DOM
 *
 * @param {React.Props} props Properties of this component
 * @return {React.Component}
 */
function PopupErrorDialog(props) {
  if (props.text) {
    return(
      <div className='popup-error-dialog' role='alert'>
        {props.text}
      </div>
    );
  } else {
    return(
      <React.Fragment>
      </React.Fragment>
    );
  }
}

export default PopupErrorDialog;

