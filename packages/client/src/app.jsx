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
import config from './config';
import { connectContractsToProvider } from './common';
import IpfsContext from './ipfs-context';
import ProfilePage from './profile-page';
import PublicPage from './public-page';
import React, { useEffect, useRef, useState } from 'react';
import StakePage from './stake-page';
import TopMovers from './top-movers';
import Web3 from 'web3';
import Web3Context, { disconnected } from './web3-context';

async function initContent(web3Context) {
  if (!web3Context.activeAccount) {
    return;
  }

  const accounts = await web3Context.instance.eth.getAccounts();
  const contentBalance = await web3Context.contracts.content.balanceOf(
    accounts[0]
  );

  if (contentBalance.toNumber() > 0) {
    return;
  }

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

  await web3Context.contracts.stake.stakeUser(
    accounts[0],
    { from: web3Context.activeAccount }
  );
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

  const [ipfsNode, setIpfsNode] = useState(undefined);
  const createIpfsNode = async () => {
    const ipfs = await IPFS.create();
    if (isMounted.current) {
      setIpfsNode(ipfs);
    }
  };
  
  const [web3Provider, setWeb3Provider] = useState(disconnected);
  const connectToProvider = async () => {
    const provider = window.ethereum;
    if (provider === undefined) {
      throw new Error('Cannot connect to provider');
    }

    const web3 = new Web3(provider);
    if (isMounted.current) {
      setWeb3Provider({
        activeAccount: (await web3.eth.getAccounts())[0],
        instance: web3,
        contracts: await connectContractsToProvider(
          ['Content', 'Karma', 'Stake', 'KarmaPaymaster'], provider
        ),
      });
    }
  };

  useEffect(() => {
    initContent(web3Provider);
  }, [web3Provider]);

  const ipfsContext = {
    ...ipfsNode,
    initialize: createIpfsNode,
  };
  const web3Context = {
    ...web3Provider,
    initialize: connectToProvider,
  };

  return (
    <IpfsContext.Provider value={ ipfsContext }>
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <Routes>
            <Route index element={ <PublicPage/> }/>
            <Route path={ config.URL_PROFILE } element={ <ProfilePage/> }/>
            <Route path={ config.TOP_MOVERS_URL } element={ <TopMovers/> }/>
            <Route path={ `${config.URL_STAKE_PAGE}/:${config.URL_STAKE_PAGE_PARAM}` }
                   element={ <StakePage/> }/>
          </Routes>
        </Router>
      </Web3Context.Provider>
    </IpfsContext.Provider>
  );
}

export default App;
