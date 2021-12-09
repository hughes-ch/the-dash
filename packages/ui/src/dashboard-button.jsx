/**
 *   Defines the DashboardButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './dashboard-button.css';
import React from 'react';

/**
 * Renders the DashboardButton to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function DashboardButton(props) {
  return(
    <button className='dashboard-button'
            onClick={props.onClick}
            name={props.name}>
      {props.name}
    </button>
  );
}

export default DashboardButton;

