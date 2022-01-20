/**
 *   The PageFrame component frames the child components in a title and side
 *   bar. Title and sidebar can be customized by owning components.
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './page-frame.css';
import Avatar from './avatar';
import CenteredContentBox from './centered-content-box';
import Heading from './heading';
import React, { useEffect, useRef, useState } from 'react';
import UserStats from './user-stats';

/**
 * Component
 */
function PageFrame(props) {
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

  return (
    <CenteredContentBox>
      <div className='page-frame'>
        <div>
          <div className='user-info' ref={ userInfoRef }>
            <Avatar user={ props.user }
                    flexDirection={ avatarDirection }/>
            <UserStats user={ props.user }/>
          </div>
          { props.sidebar }
        </div>
        <div>
          <Heading title={ props.title }/>
          { props.children }
        </div>
      </div>
    </CenteredContentBox>
  );
}

export default PageFrame;