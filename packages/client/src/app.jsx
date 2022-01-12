/**
 *   The App component manages routing and authentication
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { connectContractsToProvider } from './common';
import { ethers } from 'ethers';
import ProfilePageContent from './profile-page-content';
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
        ['Content', 'Karma', 'Stake'], provider
      ),
    });
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
      console.log(`Accounts: ${accounts} [${accounts[0].constructor.name}]`);
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
      console.log(`Result: ${JSON.stringify(result)}`);
    };
    getTokenId();
  }, [web3Context]);
  return (
    <Web3Context.Provider value={ web3Context }>
      <Router>
        <Routes>
          <Route index element={ <ProfilePageContent/> }/>
        </Routes>
      </Router>
    </Web3Context.Provider>
  );
}

export default App;
