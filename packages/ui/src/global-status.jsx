/**
 *   Defines the GlobalStatus component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './global-status.css';
import BubbleContainer from './bubble-container';
import React from 'react';

/**
 * Renders the BubbleContainer to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function GlobalStatus(props) {
  const color = props.numAlarms > 0 ? '--alarm-color' : '--all-clear-color';
  const text = props.numAlarms > 0 ?
        (props.numAlarms > 1 ? `${props.numAlarms} Alarms` : '1 Alarm') :
        'No Alarms';
        
  return(
    <BubbleContainer size='small' color={color}>
      <span className='global-status'>{text}</span>
    </BubbleContainer>
  );
}

export default GlobalStatus;

