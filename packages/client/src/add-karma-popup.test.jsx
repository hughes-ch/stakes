/**
 *   Tests for the AddKarmaPopup component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import "@testing-library/jest-dom";
import "./mocks";
import { BrowserRouter as Router } from "react-router-dom";
import config from './config';
import { connectToLocalBlockChain, stopLocalBlockChain } from './common';
import ProfilePage from './profile-page';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Web3Context from './web3-context';

/**
 * Global setup and teardown
 */
let web3Context;

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
}, config.UNIT_TEST_SETUP_TIMEOUT);
beforeEach(async () => {
  web3Context.contracts.karmaPaymaster.buyKarma = jest.fn();
  render(
    <Web3Context.Provider value={ web3Context }>
      <Router>
        <ProfilePage/>
      </Router>
    </Web3Context.Provider>
  );
  
  const buyKarmaLink = await screen.findByText('Add Karma');
  buyKarmaLink.click();
});
afterEach(() => {
  jest.restoreAllMocks();
});
afterAll(() => {
  stopLocalBlockChain();
});

/**
 * Unit tests
 */
describe('The AddKarmaPopup component', () => {
  it('can add Karma', async () => {
    const calcAmountInEth = config.DEFAULT_KARMA_PURCHASE / 1e9;
    const input = await screen.findByLabelText(
      `Estimated cost (ETH): ${calcAmountInEth}`
    );
    
    const submitButton = await screen.findByText('Submit');
    submitButton.click();
    
    expect(web3Context.contracts.karmaPaymaster.buyKarma).toHaveBeenCalled();
  });
  it('can be cancelled', async () => {
    const cancelButton = await screen.findByText('Cancel');
    cancelButton.click();
    expect(web3Context.contracts.karmaPaymaster.buyKarma).not.toHaveBeenCalled();
  });
  it('rejects invalid values', async () => {
    const calcAmountInEth = config.DEFAULT_KARMA_PURCHASE / 1e9;
    const input = await screen.findByLabelText(
      `Estimated cost (ETH): ${calcAmountInEth}`
    );

    await userEvent.clear(input);
    const submitButton = await screen.findByText('Submit');
    expect(submitButton).toBeDisabled();
  });
});
