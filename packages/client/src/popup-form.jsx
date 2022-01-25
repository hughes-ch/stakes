/**
 *   The PopupForm component is a small form with a submit and cancel button
 *
 *   It's meant to be "abstract" - or used to compose another component, not
 *   as a complete component in itself.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './popup-form.css';
import Popup from './popup';
import React from 'react';

/**
 * Component
 */
function PopupForm(props) {
  return (
    <Popup>
      <form onSubmit={ props.onSubmit } className='popup-form'>
        { props.children }
        <div className='buttons'>
          <input type='submit' value='Submit' disabled={ props.disabled }/>
          <button onClick={ props.onCancel }>
            Cancel
          </button>
        </div>
      </form>
    </Popup>
  );
}

export default PopupForm;
