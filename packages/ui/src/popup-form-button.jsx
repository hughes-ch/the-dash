/**
 *   Defines the PopupFormButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './popup-form-button.css';
import {getColorFromCss} from './common';
import React from 'react';

/**
 * Renders the PopupFormButton to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function PopupFormButton(props) {
  return(
    <button className='popup-form-button'
            onClick={props.onClick}
            style={{backgroundColor: getColorFromCss(props.color)}}
            type='button'>
      {props.text}
    </button>
  );
}

export default PopupFormButton;

