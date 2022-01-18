/**
 *   The ProfilePage component displays navigation, staked users' content,
 *   and the current user's avatar.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import ProfileFrame from './profile-frame';
import ProfilePageContent from './profile-page-content';
import React, { useContext } from 'react';
import Web3Context from './web3-context';

/**
 * Component
 */
function ProfilePage() {
  const web3 = useContext(Web3Context);
  return (
    <ProfileFrame title='Top Trending'>
      <ProfilePageContent/>
    </ProfileFrame>
  );
}

export default ProfilePage;
