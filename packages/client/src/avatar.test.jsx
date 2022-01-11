/**
 *   Tests for the Avatar component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import Avatar from './avatar';
import config from './config';
import { connectToLocalBlockChain, stopLocalBlockChain } from './common';
import { render, screen } from '@testing-library/react';
import Web3Context from './web3-context';

jest.mock('./common', () => {
  const originalModule = jest.requireActual('./common');
  return {
    __esModule: true,
    ...originalModule,
    fitTextWidthToContainer: jest.fn(() => {}),
  };
});

let web3Context;

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
}, config.UNIT_TEST_SETUP_TIMEOUT);

afterAll(() => {
  stopLocalBlockChain();
}); 

describe('the Avatar component', () => {
  it('renders a default picture', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <Avatar user={ web3Context.activeAccount }/>
      </Web3Context.Provider>
    );

    const imgSrc = screen.getByRole('img').src;
    expect(imgSrc).toMatch(new RegExp(config.DEFAULT_USER_PIC_URL));
  });

  it('renders a default username', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <Avatar user={ web3Context.activeAccount }/>
      </Web3Context.Provider>
    );

    const myAccount = web3Context.activeAccount;
    expect(await screen.findByText(myAccount)).toBeInTheDocument();
  });

  it('renders the username and pic from the blockchain', async () => {
    const myName = 'name';
    const picUrl = '/path/to/pic.jpg';
    await web3Context.contracts.stake.updateUserData(
      myName, picUrl, { from: web3Context.activeAccount }
    );

    render(
      <Web3Context.Provider value={ web3Context }>
        <Avatar user={ web3Context.activeAccount }/>
      </Web3Context.Provider>
    );

    expect(await screen.findByText(myName)).toBeInTheDocument();
    const imgSrc = screen.getByRole('img').src;
    expect(imgSrc).toMatch(picUrl);
  });
});

