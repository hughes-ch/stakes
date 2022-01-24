/**
 *   The Authenticator prevents clients without credentials from accessing
 *   protected elements. If a client is not signed in, they will be redirected
 *   to a public page. If a client signs out while accessing a protected route,
 *   they will also be redirected to a public page.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3Context from './web3-context';

/**
 * Component
 */
function Authenticator(props) {
  const web3 = useContext(Web3Context);
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const getLoggedInState = w3 => w3.activeAccount !== undefined;
  const [isLoggedIn, setIsLoggedIn] = useState(undefined);
  // Refresh the logged in state if there is no active account. This is to
  // allow users to refresh the page without needing to log in again. 
  useEffect(() => {
    async function refreshLoggedInState() {
      if (!web3.activeAccount) {
        await web3.initialize(false);
      }
      if (isMounted.current) {
        setIsLoggedIn(getLoggedInState(web3));
      }
    }
    refreshLoggedInState();
  }, [web3, isMounted]);

  const [innerHtml, setInnerHtml] = useState(null);
  useEffect(() => {
    if (isMounted.current) {
      setInnerHtml(isLoggedIn ? props.children : null);
    }
  }, [isLoggedIn, props.children, isMounted]);

  const navigateTo = useNavigate();
  useEffect(() => {
    if (isLoggedIn !== undefined && !isLoggedIn) {
      navigateTo('/');
    }
  }, [isLoggedIn, navigateTo]);
  
  return innerHtml;
}

export default Authenticator;
