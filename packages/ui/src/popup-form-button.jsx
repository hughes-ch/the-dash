/**
 *   Defines the PopupFormButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './popup-form-button.css';
import {dynamicBorder, getColorFromCss} from './common';
import React, {useState} from 'react';

/**
 * Renders the PopupFormButton to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function PopupFormButton(props) {
  const [borderColor, setBorderColor] = useState(getColorFromCss(props.color));

  return(
    <button className='popup-form-button'
            onClick={props.onClick}
            style={{
              backgroundColor: getColorFromCss(props.color),
              borderColor: borderColor,
            }}
            type='button'
            {...dynamicBorder(props.color, setBorderColor)} >
      {props.text}
    </button>
  );
}

export default PopupFormButton;

