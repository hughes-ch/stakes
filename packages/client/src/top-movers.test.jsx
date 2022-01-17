/**
 *   Tests for the TopMovers component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import "./mocks";
import { BrowserRouter as Router } from "react-router-dom";
import config from './config';
import { connectToLocalBlockChain, stopLocalBlockChain } from './common';
import { render, screen } from '@testing-library/react';
import TopMovers from './top-movers';
import Web3Context from './web3-context';

/**
 * Global setup and teardown
 */
let web3Context;

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
}, config.UNIT_TEST_SETUP_TIMEOUT);

afterAll(() => {
  stopLocalBlockChain();
});

/**
 * Unit tests
 */
describe('The TopMovers component', () => {
  it('renders without exploding', () => {
    render(
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <TopMovers/>
        </Router>
      </Web3Context.Provider>
    );
  });
});
