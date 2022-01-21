/**
 *   The ProfilePage component displays navigation, staked users' content,
 *   and the current user's avatar.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import ProfileFrame from './profile-frame';
import ProfilePageContent from './profile-page-content';
import React, { useCallback, useState } from 'react';

/**
 * Component
 */
function ProfilePage() {
  const [key, setKey] = useState(0);
  const refresh = useCallback(() => {
    setKey(key + 1);
  }, [key]);
  
  return (
    <ProfileFrame title='Top Trending'
                  triggerRefresh={ refresh }
                  key={ key }
    >
      <ProfilePageContent key={ key }/>
    </ProfileFrame>
  );
}

export default ProfilePage;
