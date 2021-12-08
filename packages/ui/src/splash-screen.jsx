/**
 *   Defines the SplashScreen component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './splash-screen.css';
import BubbleContainer from './bubble-container';
import DescriptionBlock from './description-block';
import DoubleBubble from './double-bubble';
import NavigationBar from './nav-bar';
import React from 'react';

/**
 * Renders the SplashScreen to the DOM
 *
 * @return {React.Component}
 */
function SplashScreen() {
  return(
    <React.Fragment>
      <NavigationBar />
      <div className='splash-screen'>
        <DoubleBubble>
          <BubbleContainer color='#ffde59' size='small'>
            <img src='/dashing-man.webp'
                 alt='Dashing man logo'
                 className='splash-screen'/>
          </BubbleContainer>
          <BubbleContainer color='--foreground-1' size='large'>
            <span className='splash-screen'>
              The Dash
            </span>
          </BubbleContainer>
        </DoubleBubble>
        <DescriptionBlock/>
      </div>
    </React.Fragment>
  );
}

export default SplashScreen;

