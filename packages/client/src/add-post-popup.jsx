/**
 *   The AddPostPopup component allows a user to generate new content
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
function AddPostPopup(props) {
  const [contentText, setContentText] = useState('Say something nice...');
  const [price, setPrice] = useState(config.DEFAULT_POST_PRICE);
  const [error, setError] = useState('');
  const validateText = (e) => {
    setContentText(e.target.value);
    if (!e.target.value) {
      setError('Post cannot be empty');
    } else {
      setError('');
    }
  };

  const validatePrice = (e) => {
    setPrice(e.target.value);
    if (!e.target.value || e.target.value <= 0) {
      setError('Price must be greater than 0');
    } else {
      setError('');
    }
  };
  
  return (
    <PopupForm onSubmit={ props.onSubmit }
               onCancel={ props.onCancel }
               disabled={ error !== '' }>
      <h2>New Post</h2>
      <label htmlFor={ config.POST_CONTENT_ENTRY }>
        Post Content: 
      </label>
      <textarea id={ config.POST_CONTENT_ENTRY }
                name={ config.POST_CONTENT_ENTRY }
                onChange={ validateText }
                value={ contentText }>
      </textarea>
      <label htmlFor={ config.POST_PRICE_ENTRY }>
        Post Resell Value: 
      </label>
      <input type="number"
             id={ config.POST_PRICE_ENTRY }
             name={ config.POST_PRICE_ENTRY }
             onChange={ validatePrice }
             value={ price }/>
      <span>{ error }</span>
    </PopupForm>
  );
}

export default AddPostPopup;
