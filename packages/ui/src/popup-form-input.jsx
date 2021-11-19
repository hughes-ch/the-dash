/**
 *   Defines the PopupFormInput component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './popup-form-input.css';
import React from 'react';

/**
 * Renders the PopupFormInput to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function PopupFormInput(props) {
  const id = props.name.toLowerCase();
  
  return(
    <div className='popup-form-input'>
      <label htmlFor={id}>{props.name}</label>
      <input type={props.type} id={id} name={id}></input>
    </div>
  );
}

export default PopupFormInput;

