/**
 *   Defines the ApplicationCard component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './application-card.css';
import DeleteUrlButton from './delete-url-button';
import React from 'react';
import RefreshUrlButton from './refresh-url-button';
import UrlStatusLight from './url-status-light';

/**
 * Renders the ApplicationCard to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function ApplicationCard(props) {
  const daysAtState = Math.round(
    (new Date().valueOf() - props.lastStatusChange.valueOf()) /
      1000 / 60 / 60 / 24);

  const dayStr = daysAtState === 1 ? 'day' : 'days';
  const daysAtStateStr = props.isDown ?
        `Down for ${daysAtState} ${dayStr}`:
        `Stable for ${daysAtState} ${dayStr}`;

  const linkUrl = `https://${props.app}`;
  
  return(
    <div className='application-card'>
      <div>
        <DeleteUrlButton onClick={props.onDeleteClick}/>
      </div>
      <a href={linkUrl} target='_blank' rel='noreferrer'>
        <div>
          <span><strong>{props.app}</strong></span>
          <span>{daysAtStateStr}</span>
        </div>
      </a>
      <div>
        <UrlStatusLight isDown={props.isDown}/>
        <RefreshUrlButton isLoading={props.isLoading}
                          onClick={props.onRefreshClick}/>
      </div>
    </div>
  );
}

export default ApplicationCard;

