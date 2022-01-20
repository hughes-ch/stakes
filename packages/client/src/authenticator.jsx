/**
 *   The Authenticator prevents clients without credentials from accessing
 *   protected elements. If a client is not signed in, they will be redirected
 *   to a public page. If a client signs out while accessing a protected route,
 *   they will also be redirected to a public page.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3Context from './web3-context';

/**
 * Component
 */
function Authenticator(props) {
  const web3 = useContext(Web3Context);
  const [innerHtml, setInnerHtml] = useState(null);
  useEffect(() => {
    setInnerHtml(web3.activeAccount ? props.children : null);
  }, [web3, props.children]);

  const navigateTo = useNavigate();
  useEffect(() => {
    if (!web3.activeAccount) {
      navigateTo('/');
    }
  }, [web3, navigateTo]);
  
  return innerHtml;
}

export default Authenticator;
