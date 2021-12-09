/**
 *   Defines the DeleteUrlButton component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import './delete-url-button.css';
import React from 'react';

/**
 * Renders the DeleteUrlButton to the DOM
 *
 * @param {React.Props} props Properties of this element
 * @return {React.Component}
 */
function DeleteUrlButton(props) {
  return(
    <button className='delete-url-button' onClick={props.onClick} name='delete'>
    </button>
  );
}

export default DeleteUrlButton;

