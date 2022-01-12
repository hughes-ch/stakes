/**
 *   Tests for the ContentCard component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import './mocks';
import config from './config';
import { connectToLocalBlockChain, stopLocalBlockChain } from './common';
import { ethers } from 'ethers';
import { render, screen, waitFor } from '@testing-library/react';
import ContentCard from './content-card';
import Web3Context from './web3-context';

let accounts;
let tokenId;
let owningAccount;
let price;
let web3Context;
const contentText = 'Hello world!';

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
  price = web3Context.instance.utils.toWei('500', 'gwei');
  accounts = await web3Context.instance.eth.getAccounts();
  owningAccount = accounts[3];
  await web3Context.contracts.content.publish(
    contentText, price, { from: owningAccount }
  );

  tokenId = await web3Context.contracts.content.tokenOfOwnerByIndex(
    owningAccount,
    ethers.BigNumber.from(0),
  );
}, config.UNIT_TEST_SETUP_TIMEOUT);

afterEach(() => {
  jest.restoreAllMocks();
});
afterAll(() => {
  stopLocalBlockChain();
});

describe('the ContentCard component', () => {
  it('renders default content', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <ContentCard tokenId={ tokenId }/>
      </Web3Context.Provider>
    );

    const buttons = screen.getAllByRole('button');
    const karmaButton = buttons.find(
      button => button.innerHTML.includes('0 Karma')
    );
    expect(karmaButton).toBeInTheDocument();

    const buyNowButton = buttons.find(
      button => button.innerHTML.includes('Buy Now for')
    );
    expect(buyNowButton).toBeInTheDocument();
    expect(await screen.findByText(config.DEFAULT_USER_NAME))
      .toBeInTheDocument();
  });

  it('renders the user, content, and karma information', async () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <ContentCard tokenId={ tokenId }/>
      </Web3Context.Provider>
    );

    expect(await screen.findByText(owningAccount)).toBeInTheDocument();
    expect(await screen.findByText(contentText)).toBeInTheDocument();
  });

  it('allows for paying the owner in Karma', async () => {
    const mockAddKarma = jest.fn();
    web3Context.contracts.content.addKarmaTo = mockAddKarma;
    render(
      <Web3Context.Provider value={ web3Context }>
        <ContentCard tokenId={ tokenId }/>
      </Web3Context.Provider>
    );

    await waitFor(
      () => expect(screen.getByText(owningAccount)).toBeInTheDocument()
    );

    const buttons = screen.getAllByRole('button');
    const karmaButton = buttons.find(
      button => button.innerHTML.includes('0 Karma')
    );

    karmaButton.click();
    expect(mockAddKarma).toHaveBeenCalled();
  });

  it('allows for buying the content', async () => {
    const mockBuyContent = jest.fn();
    web3Context.contracts.content.buyContent = mockBuyContent;
    render(
      <Web3Context.Provider value={ web3Context }>
        <ContentCard tokenId={ tokenId }/>
      </Web3Context.Provider>
    );

    await waitFor(
      () => expect(screen.getByText(owningAccount)).toBeInTheDocument()
    );
    
    const buttons = screen.getAllByRole('button');
    const buyNowButton = buttons.find(
      button => button.innerHTML.includes('Buy Now for')
    );

    buyNowButton.click();
    expect(mockBuyContent).toHaveBeenCalled();
  });
});
