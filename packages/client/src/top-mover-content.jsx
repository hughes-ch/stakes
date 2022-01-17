/**
 *   The TopMoverContent component displays the user's Content in descending
 *   Karma order. It allows them to update the price of each Content.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './content.css';
import ContentCard from './content-card';
import { range, scaleDownKarma } from './common';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Web3Context from './web3-context';

/**
 * Creates a new object which contains content about a piece of content
 *
 * @param {Number}  ownerIndex The enumerated number of this content NFT
 * @param {Object}  props      React props passed to this element
 * @param {Context} web3       Web3 context
 * @return {Promise} resolves to Object
 */
async function createMetaContent(ownerIndex, props, web3) {
  const tokenId = await web3.contracts.content.tokenOfOwnerByIndex(
    web3.activeAccount, ownerIndex
  );

  const { 1: txt,
          2: price,
          3: karma,
          4: creator } = await web3.contracts.content.getContentNft(tokenId);

  return {
    txt: txt,
    creator: creator,
    price: Number(scaleDownKarma(price)),
    karma: Number(scaleDownKarma(karma)),
    html: (
      <div key={ tokenId }>
        <button onClick={ props.createPricePopup }>Set Price</button>
        <ContentCard tokenId={ tokenId }/>
      </div>
    ),
  };
}

/**
 * Generates the content for the top movers page
 *
 * @param {Function} setState  Hook to set content
 * @param {Object}   props     React props passed to this element
 * @param {Object}   web3      Web3 context
 * @param {Ref}      isMounted Ref indicating if component is still mounted
 * @return {undefined}
 */
async function generateContent(setState, props, web3, isMounted) {
  if (!web3.contracts.content) {
    return;
  }
  
  const contentBalance = await web3.contracts.content.balanceOf(
    web3.activeAccount
  );

  const promiseOfContent = range(contentBalance.toNumber()).map(
    async (idx) => createMetaContent(idx, props, web3)
  );

  const content = await Promise.all(promiseOfContent);
  content.sort((a, b) => b.karma - a.karma);
  if (isMounted.current) {
    setState(content.map(c => c.html));
  }
}

/**
 * Component
 */
function TopMoverContent(props) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const web3 = useContext(Web3Context);
  const [content, setContent] = useState(undefined);
  useEffect(() => {
    generateContent(setContent, props, web3, isMounted);
  }, [props, web3, isMounted]);

  return (
    <div className='content'>
      { content }
    </div>
  );
}

export default TopMoverContent;
