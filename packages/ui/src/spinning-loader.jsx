/**
 *   Defines the SpinningLoader component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './spinning-loader.css';
import React from 'react';

/**
 * Renders the SpinningLoader to the DOM
 *
 * @return {React.Component}
 */
function SpinningLoader() {
  return(
    <div className='spinning-loader'>
      <div></div>
    </div>
  );
}

export default SpinningLoader;

