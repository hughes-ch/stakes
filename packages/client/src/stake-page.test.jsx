/**
 *   Tests for the StakePage component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import './mocks';
import { BrowserRouter as Router } from "react-router-dom";
import config from './config';
import { connectToLocalBlockChain,
         scaleUpKarma,
         stopLocalBlockChain } from './common';
import { render, screen, waitFor } from '@testing-library/react';
import StakePage from './stake-page';
import Web3Context from './web3-context';

let currentUser;
let mockOtherUser;
let mockStakedUser;
let web3Context;

const mockStakedUserName = 'Name1';
const content = [
  { text: 'Hello world!', price: '5000', owner: undefined },
  { text: 'Foo bar', price: '1000', owner: undefined },
  { text: 'bar baz', price: '50', owner: undefined },
  { text: 'Lorem Ipsum', price: '10000', owner: undefined },
];

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => { return { stake: mockStakedUser }; }
  };
});

/**
 * Initial setup/teardown
 */
async function createContent() {
  const promiseToPublish = content.map(async (el, idx) => {
    const owner = idx % 2 ? mockOtherUser : mockStakedUser;
    el.owner  = owner;
    return web3Context.contracts.content.publish(
      el.text,
      scaleUpKarma(el.price, web3Context),
      { from: owner }
    );
  });

  return Promise.all(promiseToPublish);
}

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();

  const accounts = await web3Context.instance.eth.getAccounts();
  currentUser = accounts[0];
  mockOtherUser = accounts[1];
  mockStakedUser = accounts[2];

  await web3Context.contracts.stake.updateUserData(
    mockStakedUserName, 'picture', { from: mockStakedUser }
  );
    
  await web3Context.contracts.stake.stakeUser(mockStakedUser, { from: currentUser });
  return createContent();
}, config.UNIT_TEST_SETUP_TIMEOUT);

afterAll(() => {
  stopLocalBlockChain();
});

/**
 * Unit tests
 */
describe('the StakePage component', () => {
  it('contains content owned by the stake', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <StakePage/>
        </Router>
      </Web3Context.Provider>
    );

    await screen.findAllByText(`Shared by ${mockStakedUserName}`);
    for (let c of content) {
      if (c.owner === mockStakedUser) {
        expect(await screen.findByText(c.text)).toBeInTheDocument();
        expect(await screen.findByText(
          new RegExp(`Buy Now for ${c.price} Karma`)
        )).toBeInTheDocument();
      }
    }
  });

  it('does not contain content not owned by the stake', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <StakePage/>
        </Router>
      </Web3Context.Provider>
    );

    await screen.findAllByText(`Shared by ${mockStakedUserName}`);
    for (let c of content) {
      if (c.owner !== mockStakedUser) {
        expect(screen.queryByText(c.text)).not.toBeInTheDocument();
      }
    }
  });

  it('contains controls to stake/unstake user', async () => {
    const mockStakeUser = jest.fn();
    const mockUnstakeUser = jest.fn();
    web3Context.contracts.stake.stakeUser = mockStakeUser;
    web3Context.contracts.stake.unstakeUser = mockUnstakeUser;
    render(
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <StakePage/>
        </Router>
      </Web3Context.Provider>
    );

    await screen.findAllByText(`Shared by ${mockStakedUserName}`);
    screen.getByText('Unstake').click();

    const stakeButton = await screen.findByText('Stake');
    expect(mockUnstakeUser).toHaveBeenCalled();

    stakeButton.click();
    await screen.findByText('Unstake');
    expect(mockStakeUser).toHaveBeenCalled();
  });
});
