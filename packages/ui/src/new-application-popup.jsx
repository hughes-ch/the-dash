/**
 *   Defines the NewApplicationPopup component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import PopupFormButton from './popup-form-button';
import PopupFormInput from './popup-form-input';
import PopupSubmitButton from './popup-submit-button';
import PopupWindow from './popup-window';
import React from 'react';

/**
 * Renders the NewApplicationPopup to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function NewApplicationPopup(props) {
  return(
    <PopupWindow onSubmit={props.onSubmit}>
      <h3>New Application</h3>
      <PopupFormInput type='text' name='Name'/>
      <div>
        <PopupSubmitButton text='Submit' color='--all-clear-color'/>
        <PopupFormButton text='Cancel'
                         onClick={props.onCancel}
                         color='--alarm-color'/>
      </div>
    </PopupWindow>
  );
}

export default NewApplicationPopup;

