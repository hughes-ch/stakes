/**
 *   The ProfilePage component displays navigation, staked users' content,
 *   and the current user's avatar.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import ProfileFrame from './profile-frame';
import ProfilePageContent from './profile-page-content';
import React from 'react';

/**
 * Component
 */
function ProfilePage() {
  return (
    <ProfileFrame title='Top Trending'>
      <ProfilePageContent/>
    </ProfileFrame>
  );
}

export default ProfilePage;
