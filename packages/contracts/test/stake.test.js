/**
 *   Tests for the Stake contract
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const Stake = artifacts.require("Stake");
let instance;

contract('Stake', (accounts) => {
  beforeEach(async () => {
    instance = await Stake.new();
  });
  
  it('should stake a user', async () => {
    await instance.stakeUser(accounts[1], {from: accounts[0]});
    await instance.stakeUser(accounts[1], {from: accounts[0]});
    await instance.stakeUser(accounts[1], {from: accounts[2]});

    const numStakes = await instance.getIncomingStakes(accounts[1]);
    const outgoingStakes = await instance.getOutgoingStakes(
      {from: accounts[0]}
    );
    
    expect(numStakes.toNumber()).to.equal(2);
    expect(outgoingStakes.length).to.equal(1);
  });

  it('should unstake a user', async () => {
    const instance = await Stake.deployed();
    await instance.stakeUser(accounts[1], {from: accounts[0]});
    await instance.unstakeUser(accounts[1], {from: accounts[0]});
    
    const numStakes = await instance.getIncomingStakes(accounts[1]);
    const outgoingStakes = await instance.getOutgoingStakes({from:accounts[0]});
    const stakesArray = outgoingStakes;
    
    expect(numStakes.toNumber()).to.equal(0);
    expect(stakesArray.length).to.equal(1);
    expect(stakesArray).not.to.include(accounts[1]);
  }); 
});
