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
import { scaleDownKarma, scaleUpKarma } from './common';
import Web3Context from './web3-context';

const defaultContent = {
  text: '',
  price: '0',
  karma: '0',
  creator: undefined,
  owner: undefined,
};

/**
 * Formats data from chain and sets state of content
 *
 * @param {Function} hook Hook to update content
 * @param {Object}   data Data from chain
 * @return {undefined} 
 */
function updateContent(hook, data) {
  let scaledPrice = scaleDownKarma(data.price);
  let scaledKarma = scaleDownKarma(data.karma);
  if (scaledPrice.length === 0) scaledPrice = '0';
  if (scaledKarma.length === 0) scaledKarma = '0';

  hook({
    text: data.txt,
    price: scaledPrice,
    karma: scaledKarma,
    creator: data.creator.toString(),
    owner: data.owner.toString(),
  });
}

/**
 * Looks up the content of the provided tokenID
 *
 * @param {Object}   tokenId   Token ID of the NFT
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
  const owner = await web3.contracts.content.ownerOf(tokenId);

  if (isMounted.current) {
    updateContent(
      setState,
      {
        txt: txt,
        price: price,
        karma: karma,
        creator: creator,
        owner: owner
      }
    );
  }
}

/**
 * Adds karma to the content
 *
 * @param {Object}   props    React properties passed to component
 * @param {String}   karma    Current karma value
 * @param {Function} setState Hook to set karma of content
 * @param {Object}   web3     Web3 Context
 */
async function addKarma(props, karma, setState, web3) {
  if (!web3.activeAccount) {
    return;
  }
  
  const karmaToAdd = ethers.BigNumber.from(
    scaleUpKarma(config.NUM_SCALED_KARMA_ON_UPVOTE)
  );
  
  const newKarmaAmount = ethers.BigNumber.from(karma).add(karmaToAdd);
  setState(scaleDownKarma(newKarmaAmount));
  
  try {
    await web3.contracts.karma.increaseAllowance(
      web3.contracts.content.address,
      karmaToAdd,
      { from: web3.activeAccount }
    );
    
    await web3.contracts.content.addKarmaTo(
      props.tokenId,
      karmaToAdd,
      { from: web3.activeAccount }
    );
  } catch (err) {
    props.onError();
    setState(karma);
  }
}

/**
 * Transfers ownership of content to purchasing user
 *
 * @param {Object}   props    React properties passed to component
 * @param {Object}   web3     Web3 Context
 * @param {Function} setState Function to set state of content
 */
async function buyPost(props, web3, setState) {
  if (!web3.activeAccount) {
    return;
  }

  try {
    /* eslint-disable */
    const { 0: txt,
            1: price,
            2: karma,
            3: creator } = await web3.contracts.content.getContentNft(
              props.tokenId
            );
    /* eslint-enable */
    
    await web3.contracts.karma.increaseAllowance(
      web3.contracts.content.address,
      price,
      { from: web3.activeAccount }
    );

    await web3.contracts.content.buyContent(
      props.tokenId, { from: web3.activeAccount }
    );

    updateContent(
      setState,
      {
        txt: txt,
        price: price,
        karma: karma,
        creator: creator,
        owner: web3.activeAccount,
      }
    );
  } catch (err) {
    props.onError();
  }
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
  const [buyNowCaption, setBuyNowCaption] = useState('');
  useEffect(() => {
    setKarmaCaption(content.karma);
    setBuyNowCaption(
      web3.activeAccount === content.owner ?
        `Owned (Price: ${content.price} Karma)` :
        `Buy Now for ${content.price} Karma`
    );
  }, [content, web3.activeAccount]);

  return (
    <div className='content-card'>
      <Avatar user={ content.creator }/>
      <span>{ content.text }</span>
      <div>
        <button onClick={ () => {
          addKarma(props, karmaCaption, setKarmaCaption, web3);
        }}>
          &#9829; { karmaCaption } Karma
        </button>
      </div>
      <div>
        <button
          onClick={ () => buyPost(props, web3, setContent) }
          disabled={ web3.activeAccount === content.owner }
        >
          &#9733; { buyNowCaption }
        </button>
      </div>
    </div>
  );
}

export default ContentCard;
