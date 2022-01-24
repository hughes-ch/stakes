/**
 *   The StakeButton component allows a user to stake another user
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './stake-button.css';
import React, { useCallback,
                useContext,
                useEffect,
                useRef,
                useState } from 'react';
import Web3Context from './web3-context';

/**
 * Component
 */
function StakeButton(props) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const web3 = useContext(Web3Context);
  const [isStaked, setIsStaked] = useState(false);
  useEffect(() => {
    async function getInitialStakeStatus() {
      if (!web3.activeAccount || !props.user) {
        return;
      }
      
      const stakes = await web3.contracts.stake.getOutgoingStakes(
        web3.activeAccount
      );

      if (isMounted.current) {
        setIsStaked(stakes.includes(props.user));
      }
    }
    getInitialStakeStatus();
  }, [web3, props.user, isMounted]);

  const stakeUser = useCallback(async () => {
    if (!web3.activeAccount || !props.user) {
      return;
    }
    
    setIsStaked(true);
    await web3.contracts.stake.stakeUser(
      props.user,
      { from: web3.activeAccount }
    );
  }, [web3, props.user]);

  const unstakeUser = useCallback(async () => {
    if (!web3.activeAccount || !props.user) {
      return;
    }
    
    setIsStaked(false);
    await web3.contracts.stake.unstakeUser(
      props.user,
      { from: web3.activeAccount }
    );
  }, [web3, props.user]);
  
  return (
    <button className='stake-button'
            onClick={ isStaked ? unstakeUser : stakeUser }>
      { isStaked ? "Unstake" : "Stake" }
    </button>
  );
}

export default StakeButton;
