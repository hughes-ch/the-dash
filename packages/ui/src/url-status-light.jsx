/**
 *   Defines the UrlStatusLight component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './url-status-light.css';
import React from 'react';

/**
 * Renders the UrlStatusLight to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function UrlStatusLight(props) {
  const text = props.isDown ? 'Down' : 'Good';
  const className = `url-status-light ${text.toLowerCase()}`;
  return(
    <span className={className}>
      {text}
    </span>
  );
}

export default UrlStatusLight;

