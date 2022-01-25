/**
 *   The StakeSidebar component allows a user to stake another user
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './stake-sidebar.css';
import config from './config';
import { Link } from 'react-router-dom';
import React from 'react';
import StakeButton from './stake-button';

/**
 * Component
 */
function StakeSidebar(props) {
  return (
    <div className='stake-sidebar'>
      <StakeButton user={ props.user } onError={ props.onError }/>
      <Link to={ config.URL_PROFILE }>Trending</Link>      
    </div>
  );
}

export default StakeSidebar;
