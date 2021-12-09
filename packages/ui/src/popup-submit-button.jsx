/**
 *   Defines the PopupSubmitButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import {dynamicBorder, getColorFromCss} from './common';
import React, {useState} from 'react';

/**
 * Renders the PopupSubmitButton to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function PopupSubmitButton(props) {
  const [borderColor, setBorderColor] = useState(getColorFromCss(props.color));
  
  return(
    <input className='popup-form-button'
           style={{
             backgroundColor: getColorFromCss(props.color),
             borderColor: borderColor
           }}
           value={props.text}
           type='submit'
           {...dynamicBorder(props.color, setBorderColor)}
           disabled={props.isDisabled}/>
  );
}

export default PopupSubmitButton;

