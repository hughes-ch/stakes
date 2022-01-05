/**
 *   The SidebarNavigation component contains links to other pages
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import React from 'react';
import './sidebar-navigation.css';
import { Link } from "react-router-dom";

function SidebarNavigation() {
  return (
    <div className='sidebar-navigation'>
      <Link to={ config.NEW_POST_URL }>New Post</Link>
      <Link to={ config.TOP_MOVERS_URL }>Your Top Movers</Link>
      <Link to={ config.ADD_KARMA_URL }>Add Karma</Link>
      <Link to={ config.EDIT_PROFILE_URL }>Edit Profile</Link>
    </div>
  );
}

export default SidebarNavigation;
