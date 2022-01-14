/**
 *   The AddKarmaPopup component allows a user to enter a Karma amount to buy
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import { ethers } from 'ethers';
import Popup from './popup';
import React, { useState } from 'react';

/**
 * Updates the estimated cost label
 *
 * @param {Number} karma Amount of (scaled) karma
 * @return {String}
 */
function estimateCost(karma) {
  const costInWei = ethers.BigNumber.from(karma)
        .mul(ethers.BigNumber.from(10)
             .pow(config.WEI_TO_ETH_SCALE_FACTOR - config.KARMA_SCALE_FACTOR)
            );
  
  const costInGwei = costInWei.div(
    ethers.BigNumber.from(10)
      .pow(ethers.BigNumber.from(config.WEI_TO_GWEI_SCALE_FACTOR))
  );

  const costInEth = costInGwei.toNumber() *
        Math.pow(10, -config.GWEI_TO_ETH_SCALE_FACTOR);
  
  return `Estimated cost (ETH): ${costInEth.toFixed(6)}`;
}

/**
 * Component
 */
function AddKarmaPopup(props) {
  const [karma, setKarma] = useState(config.DEFAULT_KARMA_PURCHASE);
  const [error, setError] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(
    estimateCost(config.DEFAULT_KARMA_PURCHASE)
  );
  
  const validate = (e) => {
    setKarma(e.target.value);
    if (!isNaN(e.target.value) && e.target.value > 0) {
      setEstimatedCost(estimateCost(e.target.value));
      setError('');
    } else {
      setError('Karma amount must be greater than 0');
    }
  };
  
  return (
    <Popup onSubmit={ props.onSubmit }
           onCancel={ props.onCancel }
           disabled={ error !== '' }>
      <h2>Add Karma</h2>
      <label htmlFor={ config.KARMA_ENTRY_NAME }>{ estimatedCost }</label>
      <input type="number"
             id={ config.KARMA_ENTRY_NAME }
             name={ config.KARMA_ENTRY_NAME }
             onChange={ validate }
             value={ karma }/>
      <span>{ error }</span>
    </Popup>
  );
}

export default AddKarmaPopup;
