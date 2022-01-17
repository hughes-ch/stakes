/**
 *   The TopMovers component defines the view of the user when they look
 *   at their owned Content. Content is sorted in Karma order.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import Popup from './popup';
import ProfileFrame from './profile-frame';
import React, { useContext, useState } from 'react';
import TopMoverContent from './top-mover-content';
import Web3Context from './web3-context';

/**
 * Updates the price of a piece of Content
 *
 * @param {Object}   e        Event
 * @param {Context}  web3     Web3 Context
 * @param {Function} setState Hook to set popup state
 * @return {Promise}
 */
async function updatePrice(e, web3, setState) {
  e.preventDefault();
  setState(undefined);
  //TODO: start here
  // Roadblock: How to get tokenID?
  const tokenId = '';
  const newPrice = '';
  return web3.contracts.content.setPrice(tokenId, newPrice);
}

/**
 * Component
 */
function TopMovers() {
  const [error, setError] = useState('');
  const [popup, setPopup] = useState(undefined);
  const [price, setPrice] = useState('');
  const web3 = useContext(Web3Context);
  const validate = (e) => {
    // TODO - default value of price
    //      - when is error set?
    setPrice(e.target.value);
  };
  
  const createPricePopup = () => {
    setPopup(
      <Popup onSubmit={ async (e) => updatePrice(e, web3, setPopup) }
             onCancel={ () => setPopup(undefined) }
             disabled={ error !== ''}>
        <h2>Set Price</h2>
        <label htmlFor={ config.PRICE_ENTRY_NAME }>
          Resell Value (Karma):
        </label>
        <input type="number"
               id={ config.PRICE_ENTRY_NAME }
               name={ config.PRICE_ENTRY_NAME }
               onChange={ validate }
               value={ price }/>
        <span>{ error }</span>
      </Popup>
    );
  };
  
  return (
    <React.Fragment>
      { popup }
      <ProfileFrame title='Your Top Movers'>
        <TopMoverContent
          createPricePopup={ createPricePopup }
        />
      </ProfileFrame>
    </React.Fragment>
  );
}

export default TopMovers;
