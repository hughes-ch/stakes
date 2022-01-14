/**
 *   The Avatar component contains the name and picture of the user
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './avatar.css';
import config from './config';
import { fitTextWidthToContainer, getFromIpfs } from './common';
import IpfsContext from './ipfs-context';
import React, { useContext,
                useLayoutEffect,
                useEffect,
                useRef,
                useState } from 'react';
import Web3Context from './web3-context';

/**
 * Sets the img ref to use the default image
 *
 * @param {DOMElement} img        DOM Element to update
 * @param {Ref}        isMounted  Ref indicating if component is mounted
 * @return {undefined}
 */
function setDefaultImg(img, isMounted) {
  if (isMounted.current) {
    img.current.src = config.DEFAULT_USER_PIC_URL;
  }
}

/**
 * Component
 *
 * @param {Object} props This component's properties
 */
function Avatar(props) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const ipfs = useContext(IpfsContext);
  const web3 = useContext(Web3Context);
  const [name, setName] = useState(props.user);
  const img = useRef(null);
  useEffect(() => {
    async function updateUserPic() {
      try {
        const userPic = await web3.contracts.stake.getUserPic(props.user);
        if (userPic) {
          const data = await getFromIpfs(ipfs, userPic);
          if (data.length > 0) {
            const blob = new Blob([data], { type: 'image/jpg' });
            img.current.src = window.URL.createObjectURL(blob);
          }
        } else {
          setDefaultImg(img, isMounted);
        }
      } catch (err) {
        setDefaultImg(img, isMounted);
      }
    }

    async function updateUserName() {
      let userName = props.user ? props.user : config.DEFAULT_USER_NAME;
      try {
        const userNameFromChain = await web3.contracts.stake.getUserName(
          props.user
        );
        
        if (userNameFromChain) {
          userName = userNameFromChain;
        }
      } catch (err) {
        // Do nothing - defaults already set
      }

      if (isMounted.current) {
        setName(userName);
      }
    }
    
    async function updateUserInfo() {
      return Promise.all([updateUserPic(), updateUserName()]);
    }
      
    updateUserInfo();
  }, [props.user, web3, ipfs, isMounted]);

  const container = useRef(null);
  const nameSpan = useRef(null);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let ii = 0; ii < entries.length; ii++) {
        fitTextWidthToContainer(nameSpan.current);
      }
    });
    resizeObserver.observe(container.current);
    return () => resizeObserver.disconnect();
  }, []);

  useLayoutEffect(() => {
    fitTextWidthToContainer(nameSpan.current);
  }, [name]);

  return (
    <div className='avatar' ref={ container }
         style={{ flexDirection: props.flexDirection }}>
      <img ref={ img } alt={ name }/>
      <span ref={ nameSpan }>{ name }</span>
    </div>
  );
}

export default Avatar;
