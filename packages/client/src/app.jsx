/**
 *   The App component manages routing and authentication
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import * as IPFS from 'ipfs-core';
import Authenticator from './authenticator';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import config from './config';
import { connectContractsToProvider } from './common';
import IpfsContext from './ipfs-context';
import MetaMaskOnboarding from '@metamask/onboarding';
import ProfilePage from './profile-page';
import PublicPage from './public-page';
import React, { useCallback,
                useEffect,
                useMemo,
                useRef,
                useState } from 'react';
import SearchResults from './search-results';
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
 * Returns routes protected by the Authenticator
 *
 * @param {Array} routes Routes that need restricted access
 * @return {JSX}
 */
function authenticatedRoutes(routes) {
  return routes.map(route => (
    <Route
      key={ route.path }
      path={ route.path }
      element={
        <Authenticator>
          { route.element }
        </Authenticator>
      }/>
  ));
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
  const createIpfsNode = useCallback(async () => {
    if (ipfsNode) {
      return;
    }
    
    const ipfs = await IPFS.create();
    if (isMounted.current) {
      setIpfsNode(ipfs);
    }
  }, [isMounted, ipfsNode]);
  
  const [web3Provider, setWeb3Provider] = useState(disconnected);
  const connectToProvider = useCallback(async () => {
    const provider = window.ethereum;
    if (provider === undefined) {
      const onboarding = new MetaMaskOnboarding({
        forwarderOrigin: window.location.href
      });
      onboarding.startOnboarding();
    }

    const web3 = new Web3(provider);
    await provider.request({ method: 'eth_requestAccounts' });
    if (isMounted.current) {
      setWeb3Provider({
        activeAccount: (await web3.eth.getAccounts())[0],
        instance: web3,
        contracts: await connectContractsToProvider(
          ['Content', 'Karma', 'Stake', 'KarmaPaymaster'], provider
        ),
      });
    }
  }, [isMounted]);

  useEffect(() => {
    initContent(web3Provider);
  }, [web3Provider]);

  const ipfsContext = useMemo(() => {
    return {
      ...ipfsNode,
      initialize: createIpfsNode,
    };
  }, [ipfsNode, createIpfsNode]);
  
  const web3Context = useMemo(() => {
    return {
      ...web3Provider,
      initialize: connectToProvider,
    };
  }, [web3Provider, connectToProvider]);

  useEffect(() => {
    const authenticationChecker = setInterval(async () => {
      if (web3Context.activeAccount) {
        const activeAccount = (await web3Provider.instance.eth.getAccounts())[0];
        if (activeAccount !== web3Provider.activeAccount && isMounted.current) {
          setWeb3Provider({
            ...web3Provider,
            activeAccount: activeAccount,
          });
        }
      }
    }, config.AUTH_CHECKER_INTERVAL);
    return () => clearInterval(authenticationChecker);
  }, [web3Context, web3Provider]);

  return (
    <IpfsContext.Provider value={ ipfsContext }>
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <Routes>
            <Route index element={ <PublicPage/> }/>
            {
              authenticatedRoutes([
                {
                  path: config.URL_PROFILE,
                  element: ( <ProfilePage/> ),
                },
                {
                  path: config.TOP_MOVERS_URL,
                  element: ( <TopMovers/> ),
                },
                {
                  path: `${config.URL_STAKE_PAGE}/:${config.URL_STAKE_PAGE_PARAM}`,
                  element: ( <StakePage/> ),
                },
                {
                  path: `${config.URL_SEARCH}/:${config.URL_SEARCH_PARAM}`,
                  element: ( <SearchResults/> ),
                },
              ])
            }
          </Routes>
        </Router>
      </Web3Context.Provider>
    </IpfsContext.Provider>
  );
}

export default App;
