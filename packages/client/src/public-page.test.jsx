/**
 *   Tests for the PublicPage component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import { mockIpfs } from "./mocks";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import config from './config';
import IpfsContext from './ipfs-context';
import PublicPage from './public-page';
import { render, screen, waitFor } from '@testing-library/react';
import Web3Context from './web3-context';

/**
 * Global setup and teardown
 */
const mockNavigate = jest.fn();
const mockWeb3 = {
  initialize: () => {},
};

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

/**
 * Unit tests
 */
describe('The PublicPage component', () => {
  it('navigates to the profile page', async () => {
    render(
      <IpfsContext.Provider value={ mockIpfs }>
        <Web3Context.Provider value={ mockWeb3 }>
          <Router>
            <PublicPage/>
          </Router>
        </Web3Context.Provider>
      </IpfsContext.Provider>
    );

    screen.getByText('Connect').click();
    await waitFor(
      () => expect(mockNavigate).toHaveBeenCalledWith(config.URL_PROFILE)
    );
  });
});
