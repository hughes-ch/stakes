/**
 *   The PublicPage component is the first screen shown to the user when
 *   they land at this URL. It contains a description and control to connect
 *   their wallet. 
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './public-page.css';
import config from './config';
import IpfsContext from './ipfs-context';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3Context from './web3-context';

/**
 * Component
 */
function PublicPage() {
  const [message, setMessage] = useState('');
  const navigateTo = useNavigate();
  const ipfs = useContext(IpfsContext);
  const web3 = useContext(Web3Context);
  const connectToWeb3 = async() => {
    try {
      setMessage(`Connecting to provider...`);
      await Promise.all([ipfs.initialize(), web3.initialize()]);
      navigateTo(config.URL_PROFILE);
    } catch(err) {
      setMessage(`Error encountered: ${err}`);
    }
  };

  return (
    <React.Fragment>
      <div className='public-background'></div>
      <div className='public-page'>
        <div>
          <h1>Stakes</h1>
          <span>The messaging app powered by Blockchain</span>
          <span>{ message }</span>
          <button onClick={ connectToWeb3 }
                  disabled={ message !== '' }>
            Connect
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default PublicPage;
