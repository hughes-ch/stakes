/**
 *   Tests for the Karma contract
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { getErrorType } = require("./utilities");
const Karma = artifacts.require("Karma");
const KarmaPaymaster = artifacts.require("KarmaPaymaster");

let karmaInstance

contract('Karma', (accounts) => {
  const minter = accounts[0];
  
  before(async () => {
    karmaInstance = await Karma.deployed();
    return karmaInstance.setMinter(accounts[0]);
  });

  afterEach(async () => {
    const balance = await karmaInstance.balanceOf(minter);
    if (balance > 0) {
      await karmaInstance.burn(minter, balance);
    }
  });

  after(async () => {
    const paymaster = await KarmaPaymaster.deployed();
    return karmaInstance.setMinter(paymaster.address);
  });

  it('should be mint-able', async () => {
    const amountToMint = 100;
    await karmaInstance.mint(minter, amountToMint);
    const balance = await karmaInstance.balanceOf(minter);
    expect(balance.toNumber()).to.equal(amountToMint);
  });

  it('should be burn-able', async () => {
    const amountToMint = 100;
    await karmaInstance.mint(minter, amountToMint);
    
    const amountToBurn = 50;
    await karmaInstance.burn(minter, amountToBurn);
    
    const balance = await karmaInstance.balanceOf(minter);
    expect(balance.toNumber()).to.equal(amountToMint - amountToBurn);
  });
  
  it('should only by mint-able by the minter', async () => {
    expect(
      await getErrorType(karmaInstance.mint(minter, 100, {from: accounts[2]}))
    ).not.to.be.null;
  });

  it('should only by burn-able by the minter', async () => {
    expect(
      await getErrorType(karmaInstance.burn(minter, 100, {from: accounts[2]}))
    ).not.to.be.null;
  });
});
