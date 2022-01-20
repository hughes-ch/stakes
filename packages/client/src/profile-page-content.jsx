/**
 *   The ProfilePageContent component displays the most recent content from the
 *   logged in user's stakes.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './content.css';
import ContentCard from './content-card';
import config from './config';
import { ethers } from 'ethers';
import { Link } from "react-router-dom";
import { range } from './common';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Web3Context from './web3-context';

/**
 * Creates a MetaContent object
 *
 * @param {Number} tokenId NFT Token ID of the Content
 * @param {Number} owner   Owner of content
 * @return {Object}
 */
function MetaContent(tokenId, owner) {
  this.tokenId = tokenId;
  this.owner = owner;
  this.html = undefined;
}

/**
 * Generates the content for the profile page
 *
 * @param {Function} setState  Hook to set content
 * @param {Object}   web3      Web3 context
 * @param {Ref}      isMounted Ref indicating if component is still mounted
 * @return {undefined}
 */
async function generateContent(setState, web3, isMounted) {
  if (!web3.contracts.stake || !web3.activeAccount) {
    return;
  }
  
  const stakes = await web3.contracts.stake.getOutgoingStakes(
    web3.activeAccount
  );
  
  const content = [];
  for (const stake of stakes) {
    const balance = await web3.contracts.content.balanceOf(stake);
    const promiseOfContent = range(balance.toNumber()).map(async (idx) => {
      return web3.contracts.content.tokenOfOwnerByIndex(
        stake,
        ethers.BigNumber.from(idx)
      );
    });

    const userContent = await Promise.all(promiseOfContent);
    userContent.forEach(tokenId => content.push(
      new MetaContent(tokenId, stake)
    ));
  }
  
  content.sort((a, b) => a.tokenId.gt(b));
  const promises = content.map(async (post) => {
    let user = await web3.contracts.stake.getUserName(post.owner);
    if (!user) {
      user = post.owner ? post.owner : config.DEFAULT_USER_NAME;
    }
    
    post.html = (
      <div key={ post.tokenId }>
        <div>
          <Link to={ `${config.URL_STAKE_PAGE}/${post.owner}` }>
            Shared by { user }
          </Link>
        </div>
        <ContentCard tokenId={ post.tokenId }/>
      </div>
    );
  });

  await Promise.all(promises);
  if (isMounted.current) {
    setState(content.map(post => post.html));
  }
}

/**
 * Component
 */
function ProfilePageContent() {
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
    generateContent(setContent, web3, isMounted);
  }, [web3, isMounted]);

  return (
    <div className='content'>
      { content }
    </div>
  );
}

export default ProfilePageContent;
