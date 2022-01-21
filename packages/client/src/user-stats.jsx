/**
 *   The UserStats component displays the users staked and client's Karma
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './user-stats.css';
import config from './config';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { scaleDownKarma } from './common';
import Web3Context from './web3-context';

/**
 * Gets the initial Karma balance
 *
 * @param {Object}   web3      Web3Context
 * @param {Function} setState  Mutator on component state 
 * @param {Boolean}  isMounted Indicates if component is still mounted
 * @param {Number}   account   Account to request
 * @return {Promise}
 */
async function setInitialKarma(web3, setState, isMounted, account) {
  if (!web3.contracts.karma || !account) {
    return;
  }
  
  const karmaBalance = await web3.contracts.karma.balanceOf(account);
  let scaledKarmaBalance = scaleDownKarma(karmaBalance);
  if (scaledKarmaBalance.length === 0) {
    scaledKarmaBalance = '0';
  }
  
  if (isMounted.current) {
    setState(scaledKarmaBalance);
  }
}

/**
 * Sets the number of users staked to this user
 *
 * @param {Object}   web3      Web3Context
 * @param {Function} setState  Mutator on component state 
 * @param {Boolean}  isMounted Indicates if component is still mounted
 * @param {Number}   account   Account to request
 * @return {Promise}
 */
async function setInitialStaked(web3, setState, isMounted, account) {
  if (!web3.contracts.stake || !account) {
    return;
  }
  
  const numStaked = await web3.contracts.stake.getIncomingStakes(account);
  if (isMounted.current) {
    setState(numStaked.toNumber());
  }
}

/**
 * Component
 */
function UserStats(props) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const web3 = useContext(Web3Context);
  const [karmaBalance, setKarmaBalance] = useState(0);
  useEffect(() => {
    setInitialKarma(web3, setKarmaBalance, isMounted, props.user);
  }, [web3, isMounted, props.user]);

  const [numStaked, setNumStaked] = useState(0);
  useEffect(() => {
    setInitialStaked(web3, setNumStaked, isMounted, props.user);
  }, [web3, isMounted, props.user]);

  useEffect(() => {
    let periodicUpdate;
    if (props.user === web3.activeAccount) {
      setInterval(async () => {
        await setInitialKarma(web3, setKarmaBalance, isMounted, props.user);
      }, config.PERIODIC_UPDATE_INTERVAL);
    }
    return () => {
      if (periodicUpdate) {
        clearInterval(periodicUpdate);
      }
    };
  }, [props.user, web3]);

  return (
    <div className='user-stats'>
      <div>
        <span className='icon'>&#9755;</span>
        <span>{ numStaked } Staked</span>
        <span className='icon'>&#9829;</span>
        <span>{ karmaBalance } Karma</span>
      </div>
    </div>
  );
}

export default UserStats;
