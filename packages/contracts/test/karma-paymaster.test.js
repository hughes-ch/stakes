/**
 *   Tests for the KarmaPaymaster contract
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
const { ethers } = require("ethers");
const { forwarder, getErrorType } = require('./utilities');
const Karma = artifacts.require("Karma");
const KarmaPaymaster = artifacts.require("KarmaPaymaster");

let paymasterInstance;
let karmaInstance; 

contract('KarmaPaymaster', (accounts) => {
  before(async () => {
    paymasterInstance = await KarmaPaymaster.deployed();

    karmaInstance = await Karma.deployed();
    await karmaInstance.setMinter(KarmaPaymaster.address);

    const relayHubAddress = require('../build/gsn/RelayHub.json').address;
    await paymasterInstance.setRelayHub(relayHubAddress);
    await paymasterInstance.setTrustedForwarder(forwarder());
  });

  it('should allow buying karma in ETH', async () => {
    const myAccount = accounts[0];
    const amountToBuy = web3.utils.toWei('500', 'gwei');
    await paymasterInstance.buyKarma({value: amountToBuy, from: myAccount});
    expect((await karmaInstance.balanceOf(myAccount)).toNumber())
      .to.equal(Number(amountToBuy));
  });

  it('should allow withdrawing funds', async () => {
    const myAccount = accounts[0];
    const amountToDeposit = web3.utils.toWei('1', 'ether');
    await paymasterInstance.buyKarma({value: amountToDeposit, from: myAccount});

    const balanceBefore = ethers.utils.bigNumberify(
      await web3.eth.getBalance(myAccount)
    );
    await paymasterInstance.withdrawAll({from: myAccount});
    const balanceAfter = ethers.utils.bigNumberify(
      await web3.eth.getBalance(myAccount)
    );
    
    expect(balanceAfter > balanceBefore).to.be.true;
  });

  it('should prevent non-owners from withdrawing', async () => {
    const nonOwner = accounts[2];
    expect(await getErrorType(
      paymasterInstance.withdrawAll({from: nonOwner})
    )).not.to.be.null;
  });

  // Pre/postRelayedCall tested in contracts that derive from BaseRelayRecipient
});
