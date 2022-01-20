/**
 *   Tests for the Stake contract
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { clearAccounts,
        forwarder,
        getErrorType,
        giveSomeKarmaTo,
        wrapProvider } = require('./utilities');
const Karma = artifacts.require('Karma');
const KarmaPaymaster = artifacts.require('KarmaPaymaster');
const Stake = artifacts.require('Stake');

const owner = 9;
let instance;
let karmaInstance;
let paymasterInstance;
const origProvider = web3.currentProvider;

contract('Stake', (accounts) => {
  /**
   * Setup and Teardown
   */
  beforeEach(async () => {
    karmaInstance = await Karma.deployed();
    paymasterInstance = await KarmaPaymaster.deployed();
    instance = await Stake.new(forwarder());

    const relayProvider = await wrapProvider(
      origProvider,
      paymasterInstance.address
    );

    Stake.setProvider(relayProvider);
    return giveSomeKarmaTo(accounts[owner], paymasterInstance, karmaInstance);
  });

  afterEach(async () => {
    Stake.setProvider(origProvider);
    return clearAccounts(accounts, karmaInstance, paymasterInstance, owner);
  });

  /**
   * Unit tests
   */
  it('should stake a user', async () => {
    await giveSomeKarmaTo(accounts[0], paymasterInstance, karmaInstance);
    await giveSomeKarmaTo(accounts[1], paymasterInstance, karmaInstance);
    await giveSomeKarmaTo(accounts[2], paymasterInstance, karmaInstance);

    await instance.stakeUser(accounts[1], { from: accounts[0] });
    await instance.stakeUser(accounts[1], { from: accounts[0] });
    await instance.stakeUser(accounts[1], { from: accounts[2] });

    const numStakes = await instance.getIncomingStakes(accounts[1]);
    const outgoingStakes = await instance.getOutgoingStakes(accounts[0]);
    
    expect(numStakes.toNumber()).to.equal(2);
    expect(outgoingStakes.length).to.equal(1);
  });

  it('should unstake a user', async () => {
    await giveSomeKarmaTo(accounts[0], paymasterInstance, karmaInstance);
    await instance.stakeUser(accounts[1], { from: accounts[0] });
    await instance.unstakeUser(accounts[1], { from: accounts[0] });
    
    const numStakes = await instance.getIncomingStakes(accounts[1]);
    const outgoingStakes = await instance.getOutgoingStakes(accounts[0]);
    const stakesArray = outgoingStakes;
    
    expect(numStakes.toNumber()).to.equal(0);
    expect(stakesArray.length).to.equal(1);
    expect(stakesArray).not.to.include(accounts[1]);
  });

  it('should not allow staking without karma', async () => {
    expect(
      await getErrorType(instance.stakeUser(accounts[1], {from: accounts[0]}))
    ).not.to.be.null;
  });

  it('should charge correctly for a stake', async () => {
    const myAccount = accounts[0];
    await giveSomeKarmaTo(myAccount, paymasterInstance, karmaInstance);
    const balanceBefore = await karmaInstance.balanceOf(myAccount);
    const response = await instance.stakeUser(
      accounts[1], { from: myAccount }
    );

    // Account for additional transfer that happens behind the scenes
    // in the relayHub. This needs to be paid for by the client.
    const gasForTransfer = await karmaInstance.transfer.estimateGas(
      paymasterInstance.address, 100
    );

    const costInGas = response.receipt.gasUsed + gasForTransfer;
    const costOfGas = await web3.eth.getGasPrice();
    const costInEth = costInGas * costOfGas;
    const balanceAfter = await karmaInstance.balanceOf(myAccount);
    const difference = balanceBefore - balanceAfter;

    // Note that 1 KARMA === 1 wei
    // Since calculation of gas is an estimate, just make sure we're in the
    // right ballpark...
    expect(difference).to.be.closeTo(costInEth, difference * 0.1);
  });

  it('should allow getting and updating user data', async () => {
    const name = 'Bono';
    const pic = 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX';
    const myAccount = accounts[0];
    await giveSomeKarmaTo(myAccount, paymasterInstance, karmaInstance);
    await instance.updateUserData(name, pic, { from: myAccount });
    const [receivedName, receivedPic] = await Promise.all([
      instance.getUserName(myAccount),
      instance.getUserPic(myAccount),
    ]);
    
    expect(receivedName).to.equal(name);
    expect(receivedPic).to.equal(pic);
  });

  it('should return default content for "visiting" users', async () => {
    const [receivedName, receivedPic] = await Promise.all([
      await instance.getUserName(accounts[1]),
      await instance.getUserPic(accounts[1]),
    ]);

    expect(receivedName).is.empty;
    expect(receivedPic).is.empty;
  });

  it('should allow searching for user based on address', async () => {
    const searchedForAccount = accounts[2];
    const stakedAccount = accounts[4];
    const notFoundAccount = accounts[5];
    
    await giveSomeKarmaTo(searchedForAccount, paymasterInstance, karmaInstance);
    await instance.stakeUser(stakedAccount, { from: searchedForAccount });

    let hasUserConnected = await instance.userHasConnected(searchedForAccount);
    expect(hasUserConnected).to.equal(true);

    hasUserConnected = await instance.userHasConnected(notFoundAccount);
    expect(hasUserConnected).to.equal(false);
  });

  it('should allow searching for user based on name', async () => {
    const myAccount = accounts[0];
    const searchedForAccount = accounts[2];

    const name = 'John Doe';
    await giveSomeKarmaTo(myAccount, paymasterInstance, karmaInstance);
    await giveSomeKarmaTo(searchedForAccount, paymasterInstance, karmaInstance);
    await instance.updateUserData(name, 'picture', { from: searchedForAccount });

    const resultsFromFirst = await instance.searchForUserName(
      name.split(' ')[0], 0, 10
    );
    const resultsFromLast = await instance.searchForUserName(
      name.split(' ')[1], 0, 10
    );
    const resultsFromWhole = await instance.searchForUserName(
      name, 0, 10
    );
    const resultsFromNonMatchingSearch = await instance.searchForUserName(
      'John Smith', 0, 10
    );

    expect(resultsFromLast).to.include(searchedForAccount);
    expect(resultsFromWhole).to.include(searchedForAccount);
    expect(resultsFromNonMatchingSearch).not.to.include(searchedForAccount);
  });
});
