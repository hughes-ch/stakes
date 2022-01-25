/**
 *   The ProfilePage component displays navigation, staked users' content,
 *   and the current user's avatar.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import { displayError } from './common';
import ProfileFrame from './profile-frame';
import ProfilePageContent from './profile-page-content';
import React, { useCallback, useContext, useState } from 'react';
import Web3Context from './web3-context';

/**
 * Component
 */
function ProfilePage() {
  const [key, setKey] = useState(0);
  const refresh = useCallback(() => {
    setKey(key + 1);
  }, [key]);

  const [popup, setPopup] = useState(undefined);
  const web3 = useContext(Web3Context);
  const onError = useCallback(
    () => displayError(web3, setPopup),
    [web3, setPopup]
  );
  
  return (
    <React.Fragment>
      { popup }
      <ProfileFrame
        title='Top Trending'
        triggerRefresh={ refresh }
        key={ key }
      >
        <ProfilePageContent key={ key } onError={ onError }/>
      </ProfileFrame>
    </React.Fragment>
  );
}

export default ProfilePage;
