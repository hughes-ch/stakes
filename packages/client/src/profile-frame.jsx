/**
 *   The ProfileFrame component displays navigation and the user's avatar.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import AddKarmaPopup from './add-karma-popup';
import AddPostPopup from './add-post-popup';
import config from './config';
import EditProfilePopup from './edit-profile-popup';
import IpfsContext from './ipfs-context';
import PageFrame from './page-frame';
import React, { useContext, useMemo, useState } from 'react';
import { scaleUpKarma } from './common';
import SidebarNavigation from './sidebar-navigation';
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
    value: scaleUpKarma(karmaToAdd, web3),
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
  setPopup(undefined);

  const name = event.target.elements[config.PROFILE_NAME_ENTRY].value;
  const file = event.target.elements[config.PROFILE_PIC_ENTRY].files[0];
  const { cid } = await ipfs.add(file);

  return web3.contracts.stake.updateUserData(
    name, cid.toString(), { from: web3.activeAccount }
  );
}

/**
 * Adds a new post to the current user's collection
 *
 * @param {Object}   event    submit event
 * @param {Context}  web3     Web3 context
 * @param {Function} setPopup Function to set (or clear) popups
 * @return {Promise}
 */
async function addNewPost(event, web3, setPopup) {
  event.preventDefault();
  setPopup(undefined);

  const content = event.target.elements[config.POST_CONTENT_ENTRY].value;
  const price = web3.instance.utils.toWei(
    event.target.elements[config.POST_PRICE_ENTRY].value.toString(),
    'gwei'
  );
  
  return web3.contracts.content.publish(
    content, price, { from: web3.activeAccount }
  );
}

/**
 * Component
 */
function ProfileFrame(props) {
  const [popup, setPopup] = useState(undefined);
  const web3 = useContext(Web3Context);
  const ipfs = useContext(IpfsContext);
  const sidebar = useMemo(() => (
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
      }}
      onAddPost={ () => {
        setPopup(
          <AddPostPopup
            onSubmit={ async (e) => addNewPost(e, web3, setPopup) }
            onCancel={ () => setPopup(undefined) }
          />
        );
      }}/>
  ), [web3, ipfs]);

  return (
    <React.Fragment>
      { popup }
      <PageFrame title={ props.title }
                 user={ web3.activeAccount }
                 sidebar={ sidebar }>
        { props.children }
      </PageFrame>
    </React.Fragment>
  );
}

export default ProfileFrame;
