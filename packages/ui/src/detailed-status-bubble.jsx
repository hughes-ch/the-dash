/**
 *   Defines the DetailedStatusBubble component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './detailed-status-bubble.css';
import BubbleContainer from './bubble-container';
import React from 'react';

/**
 * Renders the DetailedStatusBubble to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function DetailedStatusBubble(props) {
  return(
    <BubbleContainer size='large' color='--foreground-1'>
      <div className='detailed-status-bubble'>
        <span>Applications:</span>
        <span>{props.numApps}</span>
        <span>Last Status Update:</span>
        <span>{props.lastUpdate}</span>
        <span>Next Status Update:</span>
        <span>{props.nextUpdate}</span>
      </div>
    </BubbleContainer>
  );
}

export default DetailedStatusBubble;

