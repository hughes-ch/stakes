/**
 *   The SearchContentCard contains a single result from a search query
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './search-content-card.css';
import Avatar from './avatar';
import { Link } from "react-router-dom";
import { ownerPageUrl } from './common';
import React, { useContext } from 'react';
import StakeButton from './stake-button';
import UserStats from './user-stats';
import Web3Context from './web3-context';

/**
 * Component
 *
 * @param {Object} props The props passed to this component
 */
function SearchContentCard(props) {
  const web3 = useContext(Web3Context);
  return (
    <div className='search-content-card'>
      <Link to={ ownerPageUrl(props.account, web3) }>
        <Avatar user={ props.account } flexDirection='row'/>
      </Link>
      <UserStats user={ props.account }/>
      <StakeButton user={ props.account } onError={ props.onError }/>
    </div>
  );
}

export default SearchContentCard;
