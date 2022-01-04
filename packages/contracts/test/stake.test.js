/**
 *   Tests for the Stake contract
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const Karma = artifacts.require('Karma');
const KarmaPaymaster = artifacts.require('KarmaPaymaster');
const { RelayProvider } = require('@opengsn/provider');
const Stake = artifacts.require('Stake');

const owner = 9;
let instance;
let karmaInstance;
let paymasterInstance;
const origProvider = web3.currentProvider;

contract('Stake', (accounts) => {
  /** 
   * Helper functions
   */
  async function giveSomeKarmaTo(account) {
    return paymasterInstance.buyKarma({
      from: account,
      value: web3.utils.toWei('2', 'ether'),
    });
  }

  /**
   * Setup and Teardown
   */
  beforeEach(async () => {
    const forwarder = require('../build/gsn/Forwarder.json').address;
    instance = await Stake.new(forwarder);

    karmaInstance = await Karma.deployed();
    paymasterInstance = await KarmaPaymaster.deployed();
    
    const providerConfig = {
      forwarderAddress: forwarder,
      paymasterAddress: paymasterInstance.address,
      methodSuffix: '',
      jsonStringifyRequest: false,
      loggerConfiguration: {
        logLevel: 'error',
      },
    };

    const relayProvider = await RelayProvider.newProvider({
      provider: origProvider,
      config: providerConfig,
    }).init();

    Stake.setProvider(relayProvider);
    
    // A little bit of a misnomer. Actually gives ETH to paymaster.
    return giveSomeKarmaTo(accounts[owner]);
  });

  afterEach(async () => {
    Stake.setProvider(origProvider);
    
    const promises = accounts.map(async (acct, idx) => {
      if (idx != owner) {
        await karmaInstance.approve(paymasterInstance.address, 0);
        const balance = await karmaInstance.balanceOf(acct);
        return karmaInstance.transfer(accounts[owner], balance, {from: acct});
      }
    });

    await Promise.all(promises);
    return paymasterInstance.withdrawAll();
  });

  /**
   * Unit tests
   */
  it('should stake a user', async () => {
    const promises = accounts.map(async (acct, idx) => {
      if (idx != owner) {
        await giveSomeKarmaTo(acct);
        await karmaInstance.increaseAllowance(
          paymasterInstance.address,
          await karmaInstance.balanceOf(acct),
          { from: acct });
      }
    });
    await Promise.all(promises);

    await instance.stakeUser(accounts[1], { from: accounts[0] });
    await instance.stakeUser(accounts[1], { from: accounts[0] });
    await instance.stakeUser(accounts[1], { from: accounts[2] });

    const numStakes = await instance.getIncomingStakes(accounts[1]);
    const outgoingStakes = await instance.getOutgoingStakes(
      {from: accounts[0]}
    );
    
    expect(numStakes.toNumber()).to.equal(2);
    expect(outgoingStakes.length).to.equal(1);
  });

  it('should unstake a user', async () => {
    await giveSomeKarmaTo(accounts[0]);
    await karmaInstance.increaseAllowance(
      paymasterInstance.address,
      await karmaInstance.balanceOf(accounts[0]));
    
    await instance.stakeUser(accounts[1], { from: accounts[0] });
    await instance.unstakeUser(accounts[1], { from: accounts[0] });
    
    const numStakes = await instance.getIncomingStakes(accounts[1]);
    const outgoingStakes = await instance.getOutgoingStakes({from:accounts[0]});
    const stakesArray = outgoingStakes;
    
    expect(numStakes.toNumber()).to.equal(0);
    expect(stakesArray.length).to.equal(1);
    expect(stakesArray).not.to.include(accounts[1]);
  });

  it('should not allow staking without karma', async () => {
    let wasErrorEncountered = false;
    try {
      await instance.stakeUser(accounts[1], {from: accounts[0]});
    } catch (err) {
      wasErrorEncountered = true;
    }
    
    expect(wasErrorEncountered).to.equal(true);
  });
});
