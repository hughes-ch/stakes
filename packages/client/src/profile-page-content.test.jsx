/**
 *   Tests for the ProfilePageContent component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import config from './config';
import { connectToLocalBlockChain, stopLocalBlockChain } from './common';
import ProfilePageContent from './profile-page-content';
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
const content = [];

/**
 * Create content and set up stakes
 *
 * @param {Object} web3Context 
 * @return {Promise}
 */
async function createContent() {
  const accounts = await web3Context.instance.eth.getAccounts();
  content.push({
    text: 'Hello world!',
    price: web3Context.instance.utils.toWei('1', 'gwei'),
    account: accounts[1],
    staked: true,
  });

  content.push({
    text: 'foo bar',
    price: web3Context.instance.utils.toWei('500', 'gwei'),
    account: accounts[2],
    staked: true,
  });

  content.push({
    text: 'That\'s no moon',
    price: web3Context.instance.utils.toWei('50', 'gwei'),
    account: accounts[3],
    staked: false,
  });

  const promiseOfStakedContent = content.map(async (c) => {
    const promises = [];
    promises.push(web3Context.contracts.content.publish(
      c.text, c.price, { from: c.account }
    ));

    if (c.staked) {
      promises.push(web3Context.contracts.stake.stakeUser(
        c.account,
        { from: web3Context.activeAccount }
      ));
    }
    
    return Promise.all(promises);
  });

  return Promise.all(promiseOfStakedContent);
}

/**
 * Initial setup/teardown
 */
beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
  await createContent();
}, config.UNIT_TEST_SETUP_TIMEOUT);

afterAll(() => {
  stopLocalBlockChain();
});

/**
 * Unit tests
 */
describe('the ProfilePageContent component', () => {
  it('renders content owned by stakes', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <ProfilePageContent/>
      </Web3Context.Provider>
    );

    for (const userContent of content) {
      if (userContent.staked) {
        expect(await screen.findByText(userContent.text)).toBeInTheDocument();
        expect(await screen.findByText(`Shared by ${userContent.account}`))
          .toBeInTheDocument();
      }
    }
  });

  it('does not render content owned by non-stakes', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <ProfilePageContent/>
      </Web3Context.Provider>
    );

    // First wait for staked user content to be visible...
    const stakedAccount = content.find(c => c.staked);
    expect(await screen.findByText(`Shared by ${stakedAccount.account}`));
    
    // ... then check for non-existance of non-staked stuff
    for (const userContent of content) {
      if (!userContent.staked) {
        expect(await screen.queryByText(userContent.text))
          .not.toBeInTheDocument();
      }
    }
  });
});
