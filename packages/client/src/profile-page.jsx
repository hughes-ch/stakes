/**
 *   The ProfilePage component displays navigation, staked users' content,
 *   and the current user's avatar.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './profile-page.css';
import Avatar from './avatar';
import config from './config';
import ProfilePageContent from './profile-page-content';
import React, { useContext, useEffect, useRef, useState } from 'react';
import SearchBar from './search-bar';
import SidebarNavigation from './sidebar-navigation';
import UserStats from './user-stats';
import Web3Context from './web3-context';

/**
 * Component
 */
function ProfilePage() {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const userInfoRef = useRef(null);
  const [avatarDirection, setAvatarDirection] = useState(undefined);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (isMounted.current && userInfoRef.current) {
          setAvatarDirection(
            window.getComputedStyle(userInfoRef.current).position === 'sticky' ?
              'row' : 'column'
          );
        }
      }
    });
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, [userInfoRef]);
  
  const web3 = useContext(Web3Context);
  return (
    <div className='profile-page'>
      <div>
        <div className='user-info' ref={ userInfoRef }>
          <Avatar user={ web3.activeAccount }
                  flexDirection={ avatarDirection }/>
          <UserStats user={ web3.activeAccount }/>
        </div>
        <SidebarNavigation/>
      </div>
      <div>
        <div className='heading'>
          <h1>Top Trending</h1>
          <SearchBar/>
        </div>
        <ProfilePageContent/>
      </div>
    </div>
  );
}

export default ProfilePage;
