/**
 *   Defines the SocialBlock component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './social-block.css';
import config from '@the-dash/common/app-config';
import React from 'react';

/**
 * Renders the SocialBlock to the DOM
 *
 * @return {React.Component}
 */
function SocialBlock() {
  return(
    <div className='social-block'>
      <p>
        Want to contact Chris?
      </p>
      <div>
        <a href={config.EXT_URL_LINKEDIN}
           target='_blank'
           rel='noreferrer'>
          <img
            src='/linkedin.png'
            alt='LinkedIn Logo'/>
        </a>
        <a href={config.EXT_URL_GITHUB}
           target='_blank'
           rel='noreferrer'>
          <img
            src='/github.png'
            alt='GitHub Logo' />
        </a>
        <a href={config.EXT_URL_WEBSITE}
           target='_blank'
           rel='noreferrer'>
          <img
            src='/rss.png'
            alt='Website Logo' />
        </a>
        <a href={config.EXT_URL_EMAIL}>
          <img
            src='/gmail.png'
            alt='Gmail Logo' />
        </a>
      </div>
    </div>
  );
}

export default SocialBlock;

