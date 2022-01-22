/**
 *   Tests for the SearchResults component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import config from './config';
import { connectToLocalBlockChain, stopLocalBlockChain } from './common';
import IpfsContext from './ipfs-context';
import { mockIpfs } from "./mocks";
import { render, screen } from '@testing-library/react';
import SearchResults from './search-results';
import userEvent from '@testing-library/user-event';
import Web3Context from './web3-context';

/**
 * Global setup and teardown
 */
let mockQuery;
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => { return { query: mockQuery }; },
  };
});

let web3Context;
const userAccounts = [
  { name: 'Jerry Seinfeld', account: undefined },
  { name: 'John Smith', account: undefined },
  { name: 'John Doe', account: undefined },
];

function renderSearchResults() {
  render(
    <IpfsContext.Provider value={ mockIpfs }>
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <SearchResults/>
        </Router>
      </Web3Context.Provider>
    </IpfsContext.Provider>
  );
}

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();

  const accounts = await web3Context.instance.eth.getAccounts();
  userAccounts[0].account = accounts[1];
  userAccounts[1].account = accounts[2];
  userAccounts[2].account = accounts[3];

  const promiseToUpdateAccount = userAccounts.map(async (account) => {
    return web3Context.contracts.stake.updateUserData(
      account.name, 'picture', 'image/jpg', { from: account.account }
    );
  });

  await Promise.all(promiseToUpdateAccount);
}, config.UNIT_TEST_SETUP_TIMEOUT);

afterAll(() => {
  stopLocalBlockChain();
});

/**
 * Unit tests
 */
describe('The SearchResults component', () => {
  it('displays user content on successful search', async () => {
    mockQuery = 'John';
    renderSearchResults();
    
    expect(await screen.findByText(userAccounts[1].name)).toBeInTheDocument();
    expect(await screen.findByText(userAccounts[2].name)).toBeInTheDocument();
    expect(screen.queryByText(userAccounts[0].name)).not.toBeInTheDocument();
  });

  it('indicates when no results found', async () => {
    mockQuery = 'Foo bar';
    renderSearchResults();
    
    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });
});
