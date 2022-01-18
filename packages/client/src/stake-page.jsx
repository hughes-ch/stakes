/**
 *   The StakePage component displays someone who the current user is following
 *   (or has the potential to). 
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './stake-page.css';
import config from'./config';
import { getReasonablySizedName } from './common';
import PageFrame from './page-frame';
import ProfilePageContent from './profile-page-content';
import React, { useCallback,
                useContext,
                useEffect,
                useMemo,
                useRef,
                useState } from 'react';
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
  }, [params, web3, isMounted, setName]);
  
  const [isStaked, setIsStaked] = useState(false);
  useEffect(() => {
    async function getInitialStakeStatus() {
      const stakes = await web3.contracts.stake.getOutgoingStakes(
        web3.activeAccount
      );

      if (isMounted.current) {
        setIsStaked(stakes.includes(params[config.URL_STAKE_PAGE_PARAM]));
      }
    }
    getInitialStakeStatus();
  }, [web3, params, isMounted]);

  const stakeUser = useCallback(async () => {
    setIsStaked(true);
    return web3.contracts.stake.stakeUser(
      params[config.URL_STAKE_PAGE_PARAM],
      { from: web3.activeAccount }
    );
  }, [web3, params]);

  const unstakeUser = useCallback(async () => {
    setIsStaked(false);
    return web3.contracts.stake.unstakeUser(
      params[config.URL_STAKE_PAGE_PARAM],
      { from: web3.activeAccount }
    );
  }, [web3, params]);
  
  const sidebar = useMemo(() => (
    <div className='stake-page-sidebar'>
      <button onClick={ isStaked ? unstakeUser : stakeUser }>
        { isStaked ? "Unstake" : "Stake" }
      </button>
    </div>
  ), [isStaked, unstakeUser, stakeUser]);
  
  return (
    <PageFrame title={ `${name}'s Top Movers` }
               user={ params[config.URL_STAKE_PAGE_PARAM] }
               sidebar={ sidebar }>
      <ProfilePageContent user={ params[config.URL_STAKE_PAGE_PARAM] }/>
    </PageFrame>
  );
}

export default StakePage;
