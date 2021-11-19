/**
 *   Defines the PopupWindow component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './popup-window.css';
import React from 'react';

/**
 * Renders the PopupWindow to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function PopupWindow(props) {
  return(
    <div className='popup-window'>
      <form onSubmit={props.onSubmit} name='popup-form'>
        {props.children}
      </form>
    </div>
  );
}

export default PopupWindow;

