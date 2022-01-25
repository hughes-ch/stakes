/**
 *   The SearchContentCard contains a single result from a search query
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './search-content-card.css';
import Avatar from './avatar';
import config from './config';
import { Link } from "react-router-dom";
import React from 'react';
import StakeButton from './stake-button';
import UserStats from './user-stats';

/**
 * Component
 *
 * @param {Object} props The props passed to this component
 */
function SearchContentCard(props) {
  return (
    <div className='search-content-card'>
      <Link to={ `${config.URL_STAKE_PAGE}/${props.account}` }>
        <Avatar user={ props.account } flexDirection='row'/>
      </Link>
      <UserStats user={ props.account }/>
      <StakeButton user={ props.account } onError={ props.onError }/>
    </div>
  );
}

export default SearchContentCard;
