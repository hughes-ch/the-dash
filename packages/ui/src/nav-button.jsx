/**
 *   Defines the NavButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './nav-button.css';
import React from 'react';

/**
 * Renders the NavButton to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function NavButton(props) {
  return(
    <button className='nav-button' onClick={props.onClick}>
      {props.text}
    </button>
  );
}

export default NavButton;

