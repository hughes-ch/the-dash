/**
 *   Defines the RefreshUrlButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './refresh-url-button.css';
import React from 'react';
import SpinningLoader from './spinning-loader';

/**
 * Renders the RefreshUrlButton to the DOM
 *
 * @param {React.Props} props Properties of this element
 * @return {React.Component}
 */
function RefreshUrlButton(props) {
  const content = props.isLoading ? <SpinningLoader /> : <span>Refresh</span>;
  const isDisabled = props.isLoading ? {disabled:true} : {};

  return(
    <button className='refresh-url-button'
            onClick={props.onClick}
            name='refresh'
            {...isDisabled}>
      {content}
    </button>
  );
}

export default RefreshUrlButton;

