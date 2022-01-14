/**
 *   The App component manages routing and authentication
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import * as IPFS from 'ipfs-core';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { connectContractsToProvider } from './common';
import IpfsContext from './ipfs-context';
import ProfilePage from './profile-page';
import React, { useEffect, useRef, useState } from 'react';
import Web3 from 'web3';
import Web3Context, { disconnected } from './web3-context';

/**
 * Connects to a web3 instance and sets up contracts
 *
 * @param {Function} setState  Mutator on component state 
 * @param {Boolean}  isMounted Indicates if component is still mounted
 * @return {Promise} Resolves to new Web3Context
 */
async function connectToProvider(setState, isMounted) {
  const provider = window.ethereum;
  if (provider === undefined) {
    throw new Error('Cannot connect to provider');
  }

  const web3 = new Web3(provider);
  if (isMounted.current) {
    setState({
      activeAccount: (await web3.eth.getAccounts())[0],
      instance: web3,
      contracts: await connectContractsToProvider(
        ['Content', 'Karma', 'Stake', 'KarmaPaymaster'], provider
      ),
    });
  }
}

/**
 * Creates an IPFS node
 *
 * @param {Function} setState  Hook to set state
 * @param {Ref}      isMounted Ref indicating if component is mounted
 * @return {Promise}
 */
async function createIpfsNode(setState, isMounted) {
  const ipfs = await IPFS.create();
  if (isMounted.current) {
    setState(ipfs);
  }
}

/**
 * Component
 */
function App() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [ipfsContext, setIpfsContext] = useState(undefined);
  useEffect(() => {
    createIpfsNode(setIpfsContext, isMounted);
  }, [isMounted]);
  
  const [web3Context, setWeb3Context] = useState(disconnected);
  useEffect(() => {
    connectToProvider(setWeb3Context, isMounted);
  }, [isMounted]);

  useEffect(() => {
    const getTokenId = async () => {
      if (!web3Context.activeAccount) {
        return;
      }

      const accounts = await web3Context.instance.eth.getAccounts();
      await web3Context.contracts.content.publish(
        'Hello world!',
        web3Context.instance.utils.toWei('1', 'gwei'),
        { from: accounts[0] }
      );
      await web3Context.contracts.content.publish(
        'Howdy Doody',
        web3Context.instance.utils.toWei('500', 'gwei'),
        { from: accounts[0] }
      );
      await web3Context.contracts.content.publish(
        'Someone\'s poisoned the water hole!',
        web3Context.instance.utils.toWei('30', 'gwei'),
        { from: accounts[0] }
      );

      const result = await web3Context.contracts.stake.stakeUser(
        accounts[0],
        { from: web3Context.activeAccount }
      );
    };
    getTokenId();
  }, [web3Context]);
  return (
    <IpfsContext.Provider value={ ipfsContext }>
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <Routes>
            <Route index element={ <ProfilePage/> }/>
          </Routes>
        </Router>
      </Web3Context.Provider>
    </IpfsContext.Provider>
  );
}

export default App;
