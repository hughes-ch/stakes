/**
 *   The Popup component is a box displayed in the center of the screen 
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './popup.css';
import React, { useMemo } from 'react';

/**
 * Component
 */
function Popup(props) {
  const popupChildren = useMemo(() => {
    return React.Children.map(props.children, child => {
      return React.cloneElement(child, {
        className: `${child.props.className} popup`,
      });
    });
  }, [props.children]);
  
  return (
    <React.Fragment>
      <div className='popup-fog'></div>
      { popupChildren }
    </React.Fragment>
  );
}

export default Popup;
