/**
 *   Tests for the UserStats component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import { connectContractsToProvider } from './common';
import { render, screen } from '@testing-library/react';
import { startBlockchain,
         stopBlockchain } from '@stakes/contracts/scripts/local-blockchain';
import UserStats from './user-stats';
import Web3 from 'web3';
import Web3Context from './web3-context';

let web3Context;

beforeAll(async () => {
  const [host, port] = await startBlockchain();
  const provider = new Web3.providers.HttpProvider(
    `http://${host}:${port}`,
    { keepAlive: false }
  );
  
  const web3 = new Web3(provider);
  web3Context = {
    activeAccount: (await web3.eth.getAccounts())[0],
    instance: web3,
    contracts: await connectContractsToProvider(
      ['Karma', 'Stake', 'KarmaPaymaster'], provider
    ),
  };
}, 60000);

afterAll(() => {
  stopBlockchain();
});

describe('the UserStats component', () => {
  it('renders karma balance', async () => {
    const gwei = 500;
    const value = web3Context.instance.utils.toWei(`${gwei}`, 'gwei');
    const myAccount = web3Context.activeAccount;
    await web3Context.contracts.karmaPaymaster.buyKarma(
      {value: value, from: myAccount}
    );

    render(
      <Web3Context.Provider value={ web3Context }>
        <UserStats/>
      </Web3Context.Provider>
    );

    expect(await screen.findByText(`${gwei} Karma`)).toBeInTheDocument();
  });

  it('renders num stakes', async () => {
    const myAccount = web3Context.activeAccount;
    const accounts = await web3Context.instance.eth.getAccounts();

    await web3Context.contracts.stake.stakeUser(
      myAccount, { from: accounts[1] }
    );
    await web3Context.contracts.stake.stakeUser(
      myAccount, { from: accounts[2] }
    );

    render(
      <Web3Context.Provider value={ web3Context }>
        <UserStats/>
      </Web3Context.Provider>
    );

    expect(await screen.findByText("2 Staked")).toBeInTheDocument();
  }); 
});
