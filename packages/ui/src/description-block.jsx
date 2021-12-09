/**
 *   Defines the DescriptionBlock component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './description-block.css';
import SocialBlock from './social-block';
import React from 'react';

/**
 * Renders the DescriptionBlock to the DOM
 *
 * @return {React.Component}
 */
function DescriptionBlock() {
  return(
    <div className='description-block'>
      <div>
        <h2>What's
          <div>
            <span>The</span>
            <div>
              <span>Dash</span>
              <span>?</span>
            </div>
          </div>
        </h2>
        <p>
          It's a dashboard! Specifically, a dashboard that watches the web apps
          maintained by Chris Hughes.
        </p>
      </div>
      <SocialBlock />
    </div>
  );
}

export default DescriptionBlock;

