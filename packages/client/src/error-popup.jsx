/**
 *   The ErrorPopup component shows that something went wrong
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './error-popup.css';
import Popup from './popup';
import React from 'react';

/**
 * Component
 */
function ErrorPopup(props) {
  return (
    <Popup>
      <div className='error-popup'>
        <h2>Something Went Wrong</h2>
        <span>{ props.msg }</span>
        <div className='buttons'>
          <button onClick={ props.onClick }>Dismiss</button>
        </div>
      </div>
    </Popup>
  );
}

export default ErrorPopup;
