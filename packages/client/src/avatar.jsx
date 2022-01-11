/**
 *   The Avatar component contains the name and picture of the user
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './avatar.css';
import config from './config';
import { fitTextWidthToContainer } from './common';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Web3Context from './web3-context';

/**
 * Updates the user's name
 *
 * @param {Object}   web3      Web3Context
 * @param {String}   name      Current name
 * @param {Function} setName   Name hook
 * @param {Function} setPicUrl PicUrl hook
 * @param {Boolean}  isMounted Indicates if the component is still mounted
 * @return {Promise}
 */
async function updateUserInfo(web3, name, setName, setPicUrl, isMounted) {
  let userPicUrl = config.DEFAULT_USER_PIC_URL;
  let userName = name ? name : config.DEFAULT_USER_NAME;

  try {
    const response = await web3.contracts.stake.getUserData(name);
    if (response['0'] && response['1']) {
      userName = response['0'];
      userPicUrl = response['1'];
    } 
  } catch (err) {
    // Do nothing - just use defaults (already set)
  }

  if (isMounted.current) {
    setName(userName);
    setPicUrl(userPicUrl);
  }
}

/**
 * Component
 *
 * @param {Object} props This component's properties
 */
function Avatar(props) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const web3 = useContext(Web3Context);
  const [name, setName] = useState(props.user);
  const [picUrl, setPicUrl] = useState(config.DEFAULT_USER_PIC_URL);
  useEffect(() => {
    updateUserInfo(web3, props.user, setName, setPicUrl, isMounted);
  }, [props.user, web3, isMounted]);

  const container = useRef(null);
  const nameSpan = useRef(null);
  useEffect(() => {
    fitTextWidthToContainer(nameSpan.current, container.current);
  }, [name]);

  return (
    <div className='avatar' ref={ container }>
      <img src={ picUrl } alt={ name }/>
      <span ref={ nameSpan }>{ name }</span>
    </div>
  );
}

export default Avatar;
