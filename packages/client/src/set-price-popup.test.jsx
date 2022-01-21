/**
 *   Tests for the SetPricePopup component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import "@testing-library/jest-dom";
import "./mocks";
import { BrowserRouter as Router } from "react-router-dom";
import config from './config';
import { connectToLocalBlockChain,
         getReasonablySizedName,
         range,
         scaleUpKarma,
         stopLocalBlockChain } from './common';
import { render,
         screen,
         waitFor } from '@testing-library/react';
import TopMovers from './top-movers';
import userEvent from '@testing-library/user-event';
import Web3Context from './web3-context';

/**
 * Global setup and teardown
 */
let web3Context;
const content = [
  { text: 'Hello world!', price: '100' },
  { text: 'Foo bar', price: '5000' },
];

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
}, config.UNIT_TEST_SETUP_TIMEOUT);
beforeEach(async () => {
  web3Context.contracts.content.setPrice = jest.fn();
  const promiseOfContent = content.map(async (c) => {
    return web3Context.contracts.content.publish(
      c.text,
      scaleUpKarma(c.price),
      { from: web3Context.activeAccount }
    );
  });

  await Promise.all(promiseOfContent);
  render(
    <Web3Context.Provider value={ web3Context }>
      <Router>
        <TopMovers/>
      </Router>
    </Web3Context.Provider>

  );
  
  await screen.findByText(content[0].text);
  await waitFor(
    () => expect(screen.queryAllByText(
      getReasonablySizedName(web3Context.activeAccount)
    ).length)
      .toEqual(content.length+1)
  );
});
afterAll(() => {
  stopLocalBlockChain();
});

/**
 * Unit tests
 */
describe('The SetPricePopup component', () => {
  it('can set new prices', async () => {
    // Get the token ID of matching content
    const previousPrice = content[0].price;
    const balance = await web3Context.contracts.content.balanceOf(
      web3Context.activeAccount
    );

    const promiseOfTokenId = range(balance).map(async (idx) => {
      return web3Context.contracts.content.tokenOfOwnerByIndex(
        web3Context.activeAccount, idx
      );
    });
    
    const tokenIds = await Promise.all(promiseOfTokenId);
    const promiseOfContentPrice = tokenIds.map(async (tokenId) => {
      const { 0: txt,
              1: price,
              2: karma,
              3: creator } = await web3Context.contracts.content.getContentNft(
                tokenId
              );

      return price.toString();
    });

    const prices = await Promise.all(promiseOfContentPrice);
    const matchingPriceIdx = prices.findIndex(
      price => price === scaleUpKarma(previousPrice)
    );
    
    const tokenId = tokenIds[matchingPriceIdx];
    
    // Get the index in DOM of the price you wish to set
    await screen.findAllByText(
      new RegExp(`Buy Now for ${previousPrice} Karma`)
    );
    
    const buyNowButtons = screen.getAllByText(/Buy Now for \d+ Karma/);
    const indexOfContent = buyNowButtons.findIndex(
      button => button.innerHTML.includes(previousPrice)
    );

    expect(indexOfContent).toBeGreaterThanOrEqual(0);
    
    // Update price with index in DOM
    const setPriceButton = screen.getAllByText('Set Price')[indexOfContent];
    setPriceButton.click();

    const newPrice = previousPrice * 2;
    const input = await screen.findByLabelText('Resell Value (Karma):');
    await userEvent.clear(input);
    await userEvent.type(input, newPrice.toString());

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).toBeEnabled());
    submitButton.click();
    
    // Verify content.setPrice was called with correct tokenId and price
    expect(web3Context.contracts.content.setPrice)
      .toHaveBeenCalledWith(
        tokenId,
        scaleUpKarma(newPrice),
        { from: web3Context.activeAccount }
      );
  });

  it('does not allow negative prices', async () => {
    const setPriceButton = (await screen.findAllByText('Set Price'))[0];
    setPriceButton.click();

    const input = await screen.findByLabelText('Resell Value (Karma):');
    await userEvent.clear(input);
    await userEvent.type(input, '-1');

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).toBeDisabled());
  });
  
  it('does not allow empty prices', async () => {
    const setPriceButton = (await screen.findAllByText('Set Price'))[0];
    setPriceButton.click();

    const input = await screen.findByLabelText('Resell Value (Karma):');
    await userEvent.clear(input);

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).toBeDisabled());
  });
  
  it('can be cancelled', async () => {
    const setPriceButton = (await screen.findAllByText('Set Price'))[0];
    setPriceButton.click();

    const cancelButton = await screen.findByText('Cancel');
    cancelButton.click();
    expect(web3Context.contracts.content.setPrice).not.toHaveBeenCalled();
  });
});
