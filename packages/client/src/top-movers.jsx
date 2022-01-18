/**
 *   The TopMovers component defines the view of the user when they look
 *   at their owned Content. Content is sorted in Karma order.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import ProfileFrame from './profile-frame';
import React, { useCallback, useContext, useState } from 'react';
import { scaleUpKarma } from './common';
import SetPricePopup from './set-price-popup';
import TopMoverContent from './top-mover-content';
import Web3Context from './web3-context';

/**
 * Updates the price of a piece of Content
 *
 * @param {Object}   e        Event
 * @param {String}   tokenId  Token ID to update
 * @param {Context}  web3     Web3 Context
 * @param {Function} setState Hook to set popup state
 * @return {Promise}
 */
async function updatePrice(e, tokenId, web3, setState) {
  e.preventDefault();
  setState(undefined);
  const newPrice = scaleUpKarma(
    e.target.elements[config.PRICE_ENTRY_NAME].value, web3
  );
  
  return web3.contracts.content.setPrice(
    tokenId, newPrice, { from: web3.activeAccount }
  );
}

/**
 * Component
 */
function TopMovers() {
  const [popup, setPopup] = useState(undefined);
  const web3 = useContext(Web3Context);
  const createPricePopup = useCallback((tokenId) => {
    return () => {
      setPopup(
        <SetPricePopup
          onSubmit={ async (e) => updatePrice(e, tokenId, web3, setPopup) }
          onCancel={ () => setPopup(undefined) }
        />
      );
    };
  }, [web3]);
  
  return (
    <React.Fragment>
      { popup }
      <ProfileFrame title='Your Top Movers'>
        <TopMoverContent
          account={ web3.activeAccount }
          createPricePopup={ createPricePopup }/>
      </ProfileFrame>
    </React.Fragment>
  );
}

export default TopMovers;
