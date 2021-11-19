/**
 *   Defines the BubbleContainer component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './bubble-container.css';
import {getColorFromCss} from './common';
import React from 'react';

/**
 * Renders the BubbleContainer to the DOM
 *
 * @param {React.Props} props Properties of this container (children, color)
 * @return {React.Component}
 */
function BubbleContainer(props) {
  const bubbleClassName = `bubble-container ${props.size}`;
  const containerClassName = `bubble-container-container ${props.size}`;

  return(
    <div className={containerClassName}>
      <div className={bubbleClassName}
           style={{backgroundColor:getColorFromCss(props.color)}}>
        <div>{props.children}</div>
      </div>
    </div>
  );
}

export default BubbleContainer;

