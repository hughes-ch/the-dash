/**
 *   Defines the ErrorBar component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './error-bar.css';
import React from 'react';

/**
 * Renders the ErrorBar to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function ErrorBar(props) {
  return(
    <div className='error-bar' role='alert'>
      <div>
        <span>{props.text}</span>
      </div>
    </div>
  );
}

export default ErrorBar;

