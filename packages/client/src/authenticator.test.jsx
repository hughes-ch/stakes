/**
 *   Tests for the Authenticator component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import Authenticator from './authenticator';
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import config from './config';
import { render, screen, waitFor } from '@testing-library/react';
import Web3Context from './web3-context';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockUseNavigate,
  };
});

afterEach(() => {
  mockUseNavigate.mockReset();
});

describe('the Authenticator component', () => {
  it('does not show content to unauthorized users', async () => {
    const mockWeb3 = { activeAccount: undefined, initialize: (input) => { } };
    const protectedText = 'Hello world!';
    render(
      <Web3Context.Provider value={ mockWeb3 }>
        <Router>
          <Authenticator>
            <span>{ protectedText }</span>
          </Authenticator>
        </Router>
      </Web3Context.Provider>
    );

    await waitFor(() => expect(mockUseNavigate).toHaveBeenCalled());
    expect(screen.queryByText(protectedText)).not.toBeInTheDocument();
  });

  it('shows content to authorized users', async () => {
    const mockWeb3 = { activeAccount: 'account', initialize: (input) => { } };
    const protectedText = 'Hello world!';
    render(
      <Web3Context.Provider value={ mockWeb3 }>
        <Router>
          <Authenticator>
            <span>{ protectedText }</span>
          </Authenticator>
        </Router>
      </Web3Context.Provider>
    );

    expect(await screen.findByText(protectedText)).toBeInTheDocument();
  });
});
