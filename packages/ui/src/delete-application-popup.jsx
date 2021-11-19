/**
 *   Defines the DeleteApplicationPopup component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import PopupFormButton from './popup-form-button.jsx';
import PopupSubmitButton from './popup-submit-button.jsx';
import PopupWindow from './popup-window.jsx';
import React from 'react';

/**
 * Renders the DeleteApplicationPopup to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function DeleteApplicationPopup(props) {
  return(
    <PopupWindow onSubmit={props.onSubmit}>
      <h3>Delete This Application?</h3>
      <span>{props.app}</span>
      <div>
        <PopupSubmitButton text='Yup' color='--all-clear-color'/>
        <PopupFormButton text='Oops, nope'
                         onClick={props.onCancel}
                         color='--alarm-color'/>
      </div>
    </PopupWindow>
  );
}

export default DeleteApplicationPopup;

