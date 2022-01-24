/**
 *   The StakePage component displays someone who the current user is following
 *   (or has the potential to). 
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import { getReasonablySizedName } from './common';
import PageFrame from './page-frame';
import React, { useContext, useEffect, useRef, useState } from 'react';
import StakeSidebar from './stake-sidebar';
import TopMoverContent from './top-mover-content';
import { useParams } from "react-router-dom";
import Web3Context from './web3-context';

/**
 * Gets the "Human Readable" name set by the user
 *
 * @param {Object} inputs Function inputs
 * @return {Promise}
 */
async function getHumanReadableName(inputs) {
  const { web3,
          nameFromUrl,
          isMounted,
          setName } = inputs;

  if (!nameFromUrl) {
    return;
  }
  
  const nameFromChain = await web3.contracts.stake.getUserName(nameFromUrl);
  const humanReadableName = getReasonablySizedName(
    nameFromChain ? nameFromChain : nameFromUrl
  );
  
  if (isMounted.current) {
    setName(humanReadableName);
  }
}

/**
 * Component
 */
function StakePage() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const params = useParams();
  const [name, setName] = useState(getReasonablySizedName(
    params[config.URL_STAKE_PAGE_PARAM]
  ));
  
  const web3 = useContext(Web3Context);
  useEffect(() => {
    getHumanReadableName({
      web3: web3,
      nameFromUrl: params[config.URL_STAKE_PAGE_PARAM],
      isMounted: isMounted,
      setName: setName,
    });
  }, [params, web3, setName]);
  
  return (
    <PageFrame title={ `${name}'s Top Movers` }
               user={ params[config.URL_STAKE_PAGE_PARAM] }
               sidebar={
                 <StakeSidebar user={ params[config.URL_STAKE_PAGE_PARAM] }/>
               }>
      <TopMoverContent account={ params[config.URL_STAKE_PAGE_PARAM] }/>
    </PageFrame>
  );
}

export default StakePage;
