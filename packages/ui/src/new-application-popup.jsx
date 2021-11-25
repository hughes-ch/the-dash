/**
 *   Defines the NewApplicationPopup component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import PopupErrorDialog from './popup-error-dialog';
import PopupFormButton from './popup-form-button';
import PopupFormInput from './popup-form-input';
import PopupSubmitButton from './popup-submit-button';
import PopupWindow from './popup-window';
import React, {useState} from 'react';

/**
 * Renders the NewApplicationPopup to the DOM
 *
 * @param {React.Props} props Properties for this element
 * @return {React.Component}
 */
function NewApplicationPopup(props) {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  const validate = (e) => {
    setInputVal(e.target.value);

    if (props.apps.includes(e.target.value)) {
      setError(`${e.target.value} already used`);
      
    } else if (/[^\w.-]/.test(e.target.value)) {
      setError('Name must be a valid DNS name');

    } else if (e.target.value.length === 0) {
      setError('Please specify a name');
      
    } else {
      setError('');
    }
  };
  
  return(
    <PopupWindow onSubmit={props.onSubmit}>
      <h3>New Application</h3>
      <PopupFormInput type='text'
                      name='Name'
                      onChange={validate}
                      value={inputVal}/>
        <PopupErrorDialog text={error}/>
      <div>
        <PopupSubmitButton text='Submit'
                           color='--all-clear-color'
                           isDisabled={error}/>
        <PopupFormButton text='Cancel'
                         onClick={props.onCancel}
                         color='--alarm-color'/>
      </div>
    </PopupWindow>
  );
}

export default NewApplicationPopup;

