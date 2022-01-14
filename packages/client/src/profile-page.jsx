/**
 *   The ProfilePage component displays navigation, staked users' content,
 *   and the current user's avatar.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './profile-page.css';
import AddKarmaPopup from './add-karma-popup';
import Avatar from './avatar';
import config from './config';
import EditProfilePopup from './edit-profile-popup';
import IpfsContext from './ipfs-context';
import ProfilePageContent from './profile-page-content';
import React, { useContext, useEffect, useRef, useState } from 'react';
import SearchBar from './search-bar';
import SidebarNavigation from './sidebar-navigation';
import UserStats from './user-stats';
import Web3Context from './web3-context';

/**
 * Function to buy Karma
 *
 * @param {Object}   event    Submit event
 * @param {Object}   web3     Web3 context
 * @param {Function} setPopup Function to set (or clear) popups
 * @return {Promise}
 */
async function addKarma(event, web3, setPopup) {
  event.preventDefault();
  setPopup(undefined);

  const karmaToAdd = event.target.elements[config.KARMA_ENTRY_NAME].value;
  return web3.contracts.karmaPaymaster.buyKarma({
    from: web3.activeAccount,
    value: web3.instance.utils.toWei(karmaToAdd.toString(), 'gwei'),
  });
}

/**
 * Updates user data on chain and uploads to IPFS
 *
 * @param {Object}   event    submit event
 * @param {Context}  web3     Web3 context
 * @param {Context}  ipfs     IPFS context
 * @param {Function} setPopup Function to set (or clear) popups
 * @return {Promise}
 */
async function updateUserData(event, web3, ipfs, setPopup) {
  event.preventDefault();

  const name = event.target.elements[config.PROFILE_NAME_ENTRY].value;
  const file = event.target.elements[config.PROFILE_PIC_ENTRY].files[0];
  const { cid } = await ipfs.add(file);

  setPopup(undefined);
  return web3.contracts.stake.updateUserData(
    name, cid.toString(), { from: web3.activeAccount }
  );
}

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
      for (let ii = 0; ii < entries.length; ii++) {
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

  const [popup, setPopup] = useState(undefined);
  const web3 = useContext(Web3Context);
  const ipfs = useContext(IpfsContext);
  return (
    <React.Fragment>
      { popup }
      <div className='profile-page'>
        <div>
          <div className='user-info' ref={ userInfoRef }>
            <Avatar user={ web3.activeAccount }
                    flexDirection={ avatarDirection }/>
            <UserStats user={ web3.activeAccount }/>
          </div>
          <SidebarNavigation
            onAddKarma={ () => {
              setPopup(
                <AddKarmaPopup
                  onSubmit={ async (event) => addKarma(event, web3, setPopup) }
                  onCancel={ () => setPopup(undefined) }
                />
              );
            }}
            onEditProfile={ () => {
              setPopup(
                <EditProfilePopup
                  onSubmit={ async (e) => updateUserData(e, web3, ipfs, setPopup) }
                  onCancel={ () => setPopup(undefined) }
                />
              );
            }}/>
        </div>
        <div>
          <div className='heading'>
            <h1>Top Trending</h1>
            <SearchBar/>
          </div>
          <ProfilePageContent/>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ProfilePage;
