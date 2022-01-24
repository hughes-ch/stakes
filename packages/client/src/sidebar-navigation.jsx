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

function SidebarNavigation(props) {
  return (
    <div className='sidebar-navigation'>
      <button onClick={ props.onAddPost }>New Post</button>
      <Link to={ config.TOP_MOVERS_URL }>Top Movers</Link>
      <button onClick={ props.onAddKarma }>Add Karma</button>
      <button onClick={ props.onEditProfile }>Edit Profile</button>
    </div>
  );
}

export default SidebarNavigation;
