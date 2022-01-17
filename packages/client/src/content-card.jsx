/**
 *   The ContentCard component displays information about a single post,
 *   including the creator, Karma, and purchase price.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './content-card.css';
import Avatar from './avatar';
import config from './config';
import { ethers } from 'ethers';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { scaleDownKarma } from './common';
import Web3Context from './web3-context';

const defaultContent = {
  text: '',
  price: '0',
  karma: '0',
  creator: undefined,
};

/**
 * Looks up the content of the provided tokenID
 *
 * @param {Number}   tokenId   Token ID of the NFT
 * @param {Object}   web3      Web3Context instance
 * @param {Function} setState  Hook to set content
 * @param {Ref}      isMounted Ref which indicates if component is still mounted
 */
async function lookupContent(tokenId, web3, setState, isMounted) {
  if (!web3.contracts.content || !tokenId) {
    return;
  }

  const { 0: txt,
          1: price,
          2: karma,
          3: creator } = await web3.contracts.content.getContentNft(tokenId);

  let scaledPrice = scaleDownKarma(price);
  let scaledKarma = scaleDownKarma(karma);
  if (scaledPrice.length === 0) scaledPrice = '0';
  if (scaledKarma.length === 0) scaledKarma = '0';
  
  if (isMounted.current) {
    setState({
      text: txt,
      price: scaledPrice,
      karma: scaledKarma,
      creator: creator.toString(),
    });
  }
}

/**
 * Adds karma to the content
 *
 * @param {Number}   tokenId  Token ID of the NFT
 * @param {String}   karma    Current karma value
 * @param {Function} setState Hook to set karma of content
 * @param {Object}   web3     Web3 Context
 */
async function addKarma(tokenId, karma, setState, web3) {
  const karmaToAdd = ethers.BigNumber.from(
    `${config.NUM_SCALED_KARMA_ON_UPVOTE}${'0'.repeat(config.KARMA_SCALE_FACTOR)}`
  );
  
  const newKarmaAmount = ethers.BigNumber.from(karma).add(karmaToAdd);
  setState(scaleDownKarma(newKarmaAmount));
  
  try {
    await web3.contracts.content.addKarmaTo(
      tokenId,
      karmaToAdd,
      { from: web3.activeAccount }
    );
  } catch (err) {
    setState(karma);
  }
}

/**
 * Transfers ownership of content to purchasing user
 *
 * @param {Number}   tokenId  Token ID of the NFT
 * @param {Object}   web3     Web3 Context
 */
async function buyPost(tokenId, web3) {
  await web3.contracts.content.buyContent(tokenId, { from: web3.activeAccount });
}

/**
 * Component
 *
 * @param {Object} props The props passed to this component
 */
function ContentCard(props) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const web3 = useContext(Web3Context);
  const [content, setContent] = useState(defaultContent);
  useEffect(() => {
    lookupContent(props.tokenId, web3, setContent, isMounted);
  }, [props.tokenId, web3, isMounted]);

  const [karmaCaption, setKarmaCaption] = useState(0);
  const [buyNowCaption, setBuyNowCaption] = useState(0);
  useEffect(() => {
    setKarmaCaption(content.karma);
    setBuyNowCaption(content.price);
  }, [content]);

  return (
    <div className='content-card'>
      <Avatar user={ content.creator }/>
      <span>{ content.text }</span>
      <div>
        <button onClick={ () => {
          addKarma(props.tokenId, karmaCaption, setKarmaCaption, web3);
        }}>
          &#9829; { karmaCaption } Karma
        </button>
      </div>
      <div>
        <button onClick={ () => buyPost(props.tokenId, web3) }>
          &#9733; Buy Now for { buyNowCaption } Karma
        </button>
      </div>
    </div>
  );
}

export default ContentCard;
