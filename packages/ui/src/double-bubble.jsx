/**
 *   Defines the DoubleBubble component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './double-bubble.css';
import React from 'react';

/**
 * Renders the DoubleBubble component to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function DoubleBubble(props) {
  return(
    <div className='double-bubble'>
      { props.children }
    </div>
  );
}

export default DoubleBubble;

