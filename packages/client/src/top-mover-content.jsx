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
 * @param {Object} input Input parameters
 * @return {Promise} resolves to Object
 */
async function createMetaContent(input) {
  const { web3,
          ownerIndex,
          props,
          name,
          isMounted} = input;
  if (!isMounted.current || !web3.activeAccount || !props.account) {
    return { };
  }
          
  const tokenId = await web3.contracts.content.tokenOfOwnerByIndex(
    props.account, ownerIndex
  );

  const { 1: txt,
          2: price,
          3: karma,
          4: creator } = await web3.contracts.content.getContentNft(tokenId);

  const heading = props.account === web3.activeAccount && props.createPricePopup ?
        (<button onClick={ props.createPricePopup(tokenId) }>Set Price</button>) :
        (<div>{ `Shared by ${name}` }</div>);

  return {
    txt: txt,
    creator: creator,
    price: Number(scaleDownKarma(price)),
    karma: Number(scaleDownKarma(karma)),
    html: (
      <div key={ tokenId }>
        { heading }
        <ContentCard tokenId={ tokenId }/>
      </div>
    ),
  };
}

/**
 * Generates the content for the top movers page
 *
 * @param {Object} input Input parameters
 * @return {undefined}
 */
async function generateContent(input) {
  const { setState,
          props,
          web3,
          isMounted,
          name } = input;
  
  if (!web3.contracts.content || !isMounted.current || !props.account) {
    return;
  }
  
  const contentBalance = await web3.contracts.content.balanceOf(
    props.account
  );

  const promiseOfContent = range(contentBalance.toNumber()).map(
    async (idx) => createMetaContent({
      ownerIndex: idx,
      props: props,
      web3: web3,
      name: name,
      isMounted: isMounted,
    })
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
  const [name, setName] = useState(props.account);
  useEffect(() => {
    async function getHumanReadableName() {
      if (!props.account) {
        return;
      }
      
      const nameFromChain = await web3.contracts.stake.getUserName(
        props.account
      );

      if (nameFromChain && isMounted.current) {
        setName(nameFromChain);
      }
    }
    getHumanReadableName();
  }, [web3, props.account]);
  
  const [content, setContent] = useState(undefined);
  useEffect(() => {
    generateContent({
      setState: setContent,
      props: props,
      web3: web3,
      isMounted: isMounted,
      name: name,
    });
  }, [props, web3, isMounted, name]);

  return (
    <div className='content'>
      { content }
    </div>
  );
}

export default TopMoverContent;
