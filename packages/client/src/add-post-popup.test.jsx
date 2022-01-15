/**
 *   Tests for the AddPostPopup component
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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Web3Context from './web3-context';

/**
 * Global setup and teardown
 */
let mockPublish = jest.fn();
let web3Context;

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
}, config.UNIT_TEST_SETUP_TIMEOUT);
beforeEach(async () => {
  web3Context.contracts.content.publish = mockPublish;
  render(
    <Web3Context.Provider value={ web3Context }>
      <Router>
        <ProfilePage/>
      </Router>
    </Web3Context.Provider>
  );
  
  const addPostLink = await screen.findByText('New Post');
  addPostLink.click();
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
describe('The AddPostPopup component', () => {
  it('can add a new post', async () => {
    const content = 'Hello world!';
    const textArea = await screen.findByLabelText('Post Content:');
    await userEvent.clear(textArea);
    await userEvent.type(textArea, content);

    const price = '5000';
    const priceInput = await screen.findByLabelText('Post Resell Value:');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, price);

    screen.getByText('Submit').click();

    await waitFor(() => expect(mockPublish).toHaveBeenCalledWith(
      content,
      web3Context.instance.utils.toWei(price, 'gwei'),
      { from: web3Context.activeAccount }
    ));
  });
  
  it('can be cancelled', async () => {
    (await screen.findByText('Cancel')).click();
    await waitFor(() => expect(mockPublish).not.toHaveBeenCalled());
  });
  
  it('rejects empty posts', async () => {
    const textArea = await screen.findByLabelText('Post Content:');
    await userEvent.clear(textArea);
    await waitFor(() => expect(screen.getByText('Submit')).toBeDisabled());
  });
  
  it('rejects negative resale prices', async () => {
    const priceInput = await screen.findByLabelText('Post Resell Value:');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '-1000');
    await waitFor(() => expect(screen.getByText('Submit')).toBeDisabled());
  });
});
