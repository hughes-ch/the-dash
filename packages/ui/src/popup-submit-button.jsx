/**
 *   Defines the PopupSubmitButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import {getColorFromCss} from './common';
import React from 'react';

/**
 * Renders the PopupSubmitButton to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function PopupSubmitButton(props) {
  return(
    <input className='popup-form-button'
           style={{backgroundColor: getColorFromCss(props.color)}}
           value={props.text}
           type='submit'/>
  );
}

export default PopupSubmitButton;

