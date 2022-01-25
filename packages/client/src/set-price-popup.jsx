/**
 *   The SetPricePopup component allows a user to update the price of an
 *   existing piece of Content.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import PopupForm from './popup-form';
import React, { useState } from 'react';

/**
 * Component
 */
function SetPricePopup(props) {
  const [error, setError] = useState('');
  const [price, setPrice] = useState(config.DEFAULT_POST_PRICE);
  const validate = (e) => {
    setPrice(e.target.value);
    if (!e.target.value || e.target.value < 0) {
      setError('New price must be >= 0');
    } else {
      setError('');
    }
  };
  
  return (
    <PopupForm onSubmit={ props.onSubmit }
               onCancel={ props.onCancel }
               disabled={ error !== ''}>
      <h2>Set Price</h2>
      <label htmlFor={ config.PRICE_ENTRY_NAME }>
        Resell Value (Karma):
      </label>
      <input type="number"
             id={ config.PRICE_ENTRY_NAME }
             name={ config.PRICE_ENTRY_NAME }
             onChange={ validate }
             value={ price }/>
      <span>{ error }</span>
    </PopupForm>
  );
}

export default SetPricePopup;
