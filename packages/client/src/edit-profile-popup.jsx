/**
 *   The EditProfilePopup component allows a user update their profile
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import all from 'it-all';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import config from './config';
import IpfsContext from './ipfs-context';
import Popup from './popup';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Web3Context from './web3-context';

/**
 * Retrieves the currently set user name
 *
 * @param {String}   nameState  Name state
 * @param {Function} setName    Name hook
 * @param {Object}   web3       Web3 context
 * @return {Promise}
 */
async function retrieveCurrentUserName(nameState, setName, web3) {
  const userName = await web3.contracts.stake.getUserName(
    web3.activeAccount
  );

  if (nameState === config.DEFAULT_USER_NAME) {
    if (userName) {
      setName(userName);
    } else {
      setName(web3.activeAccount);
    }
  }
}

/**
 * Retrieves the currently set user picture
 *
 * @param {DOMElement} img   Image DOM element
 * @param {Context}    web3  Web3 context
 * @param {Context}    ipfs  IPFS context
 * @return {Promise} 
 */
async function retrieveCurrentPic(img, web3, ipfs) {
  img.current.src = config.DEFAULT_USER_PIC_URL;
  const userPic = await web3.contracts.stake.getUserPic(
    web3.activeAccount
  );

  if (userPic) {
    const data = uint8ArrayConcat(await all(ipfs.cat(userPic)));
    if (data.length > 0) {
      const blob = new Blob([data], { type: 'image/jpg' });
      img.current.src = window.URL.createObjectURL(blob);
    }
  } 
}

/**
 * Component
 */
function EditProfilePopup(props) {
  const web3 = useContext(Web3Context);
  const ipfs = useContext(IpfsContext);
  const [error, setError] = useState('');
  const [name, setName] = useState(config.DEFAULT_USER_NAME);
  useEffect(() => {
    retrieveCurrentUserName(name, setName, web3);
  }, [name, web3]);

  const img = useRef(undefined);
  useEffect(() => {
    retrieveCurrentPic(img, web3, ipfs);
  }, [img, web3, ipfs]);

  const [file, setFile] = useState(undefined);
  useEffect(() => {
    if (error !== '' || !file) {
      return;
    }
    img.current.src = window.URL.createObjectURL(file);
  }, [file, error]);
  
  const validateName = e => {
    setName(e.target.value);
  };

  const validatePic = e => {
    if (!e.target.files[0].type.startsWith('image/')) {
      setError('Picture must be an image');
    } else {
      setError('');
      setFile(e.target.files[0]);
    }
  };

  return (
    <Popup onSubmit={ props.onSubmit }
           onCancel={ props.onCancel }
           disabled={ error !== '' }>
      <h2>Edit Profile</h2>
      <label htmlFor={ config.PROFILE_PIC_ENTRY }>
        <img ref={ img } alt='Preview'/>
        Select picture
      </label>
      <br/>
      <input type="file"
             id={ config.PROFILE_PIC_ENTRY }
             name={ config.PROFILE_PIC_ENTRY }
             onChange={ validatePic }
             files={ file }
             accept="image/*"/>
      <label htmlFor={ config.PROFILE_NAME_ENTRY }>
        Introduce yourself:
      </label>
      <input type="text"
             id={ config.PROFILE_NAME_ENTRY }
             name={ config.PROFILE_NAME_ENTRY }
             onChange={ validateName }
             value={ name }/>
      <span>{ error }</span>
    </Popup>
  );
}

export default EditProfilePopup;
