/**
 *  Provides a web3 instance to nested components
 *
 *  :copyright: Copyright (c) 2022 Chris Hughes
 *  :license: MIT License
 */
import React from 'react';

const disconnected = {
  activeAccount: undefined,
  instance: undefined,
  contracts: { },
  initialize: () => {},
};
Object.freeze(disconnected);

const Web3Context = React.createContext(disconnected);

export default Web3Context;
export { disconnected };
