/**
 *   The EditProfilePopup component allows a user update their profile
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import { getFromIpfs } from './common';
import IpfsContext from './ipfs-context';
import Popup from './popup';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Web3Context from './web3-context';

/**
 * Retrieves the currently set user picture
 *
 * @param {DOMElement} img   Image DOM element
 * @param {Context}    web3  Web3 context
 * @param {Context}    ipfs  IPFS context
 * @param {Ref}      isMounted  Indicates if component is mounted
 * @return {Promise} 
 */
async function retrieveCurrentPic(img, web3, ipfs, isMounted) {
  img.current.src = config.DEFAULT_USER_PIC_URL;
  const userPic = await web3.contracts.stake.getUserPic(
    web3.activeAccount
  );

  if (userPic && isMounted.current) {
    const data = await getFromIpfs(ipfs, userPic);
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
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const web3 = useContext(Web3Context);
  const ipfs = useContext(IpfsContext);
  const [error, setError] = useState('');
  const [name, setName] = useState(config.DEFAULT_USER_NAME);
  const nameHasBeenSet = useRef(false);
  useEffect(() => {
    async function retrieveCurrentUserName() {
      const userName = await web3.contracts.stake.getUserName(
        web3.activeAccount
      );

      if (isMounted.current && !nameHasBeenSet.current) {
        if (userName) {
          setName(userName);
        } else {
          setName(web3.activeAccount);
        }
      }
    }
    
    retrieveCurrentUserName();
  }, [web3, isMounted]);

  const img = useRef(undefined);
  useEffect(() => {
    retrieveCurrentPic(img, web3, ipfs, isMounted);
  }, [img, web3, ipfs, isMounted]);

  const [file, setFile] = useState(undefined);
  useEffect(() => {
    if (error !== '' || !file) {
      return;
    }
    img.current.src = window.URL.createObjectURL(file);
  }, [file, error]);
  
  const validateName = e => {
    setName(e.target.value);
    nameHasBeenSet.current = true;
    if (!e.target.value) {
      setError('Must enter a valid name');
    } else {
      setError('');
    }
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
      <label htmlFor={ config.PROFILE_PIC_ENTRY } style={{ cursor: 'pointer' }}>
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
