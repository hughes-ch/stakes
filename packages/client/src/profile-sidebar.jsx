/**
 *   The ProfileSidebar component contains controls and information about the
 *   logged in user. 
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './profile-sidebar.css';
import React from 'react';

/**
 * Component
 */
function ProfileSidebar(props) {
  return (
    <div className='profile-sidebar'>
      { props.children }
    </div>
  );
}

export default ProfileSidebar;
