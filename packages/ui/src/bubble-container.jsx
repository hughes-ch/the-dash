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

  return(
    <div className={bubbleClassName}
         style={{backgroundColor:getColorFromCss(props.color)}}>
      {props.children}
    </div>
  );
}

export default BubbleContainer;

