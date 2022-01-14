/**
 *   The Popup component is a small form with a submit and cancel button
 *
 *   It's meant to be "abstract" - or used to compose another component, not
 *   as a complete component in itself.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './popup.css';
import React from 'react';

/**
 * Component
 */
function Popup(props) {
  return (
    <React.Fragment>
      <div className='popup-fog'></div>
      <form onSubmit={ props.onSubmit } className='popup'>
        { props.children }
        <div className='buttons'>
          <input type='submit' value='Submit' disabled={ props.disabled }/>
          <button onClick={ props.onCancel }>
            Cancel
          </button>
        </div>
      </form>
    </React.Fragment>
  );
}

export default Popup;
