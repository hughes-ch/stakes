/**
 *   The CenteredContentBox component contains all other components besides
 *   the public page. It simply serves as a container with common style.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './centered-content-box.css';
import React from 'react';

/**
 * Component
 */
function CenteredContentBox(props) {
  return (
    <div className='centered-content-box'>
      { props.children }
    </div>
  );
}

export default CenteredContentBox;
