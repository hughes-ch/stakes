/**
 *   Tests for the Content contract
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const Content = artifacts.require("Content");
const Karma = artifacts.require("Karma");

let contentInstance;
let karmaInstance

contract('Content', (accounts) => {
  beforeEach(async () => {
    karmaInstance = await Karma.new();
    contentInstance = await Content.new(karmaInstance.address);
  });
  
  it('should publish new NFTs', async () => {
    const contentTxt = 'Hello world!';
    const contentPrice = 50000;
    const response = await contentInstance.publish(
      contentTxt,
      contentPrice,
      {from: accounts[0]}
    );

    const tokenId = response.receipt.logs[0].args.tokenId;
    const numTokens = await contentInstance.balanceOf.call(accounts[0]);
    expect(numTokens.toNumber()).to.equal(1);
    const { 0: txt,
            1: price,
            2: karma,
            3: creator } = await contentInstance.getContentNft(tokenId);
    
    expect(txt.toString()).to.equal(contentTxt);
    expect(price.toNumber()).to.equal(contentPrice);
    expect(creator).to.equal(accounts[0]);
  });

  it('should reject empty content when minting NFTs', async () => {
    const contentTxt = '';
    const contentPrice = 50000;
    
    let isErrorEncountered = false;
    try {
      await contentInstance.publish(contentTxt, contentPrice, {from: accounts[0]})
    } catch (err) {
      isErrorEncountered = true;
    }
    expect(isErrorEncountered).to.equal(true);
  });

  it('should reject empty content when fetching NFTs', async () => {
    let isErrorEncountered = false;
    try {
      await contentInstance.getContentNft(10);
    } catch (err) {
      isErrorEncountered = true;
    }
    expect(isErrorEncountered).to.equal(true);
  });

  it('should accumulate karma', async () => {
    const holdingAccount = accounts[0];
    const sendingAccount = accounts[1];
    await karmaInstance.buyKarma({from: sendingAccount, value: 100000});

    const contentTxt = 'Hello world!';
    const contentPrice = 500;
    const response = await contentInstance.publish(
      contentTxt,
      contentPrice,
      {from: holdingAccount}
    );
    
    const tokenId = response.receipt.logs[0].args.tokenId;
    const amountToAdd = 1;
    const priorKarmaBalance = await karmaInstance.balanceOf(holdingAccount);
    await karmaInstance.increaseAllowance(
      contentInstance.address,
      amountToAdd,
      {from: sendingAccount}
    );

    await contentInstance.addKarmaTo(
      tokenId,
      amountToAdd,
      {from: sendingAccount}
    );
    
    const afterKarmaBalance = await karmaInstance.balanceOf(holdingAccount);
    expect(afterKarmaBalance - priorKarmaBalance).to.equal(amountToAdd);

    const { 0: txt,
            1: price,
            2: karma,
            3: creator } = await contentInstance.getContentNft(tokenId);
    expect(karma.toNumber()).to.equal(amountToAdd);
  });

  it('should reject adding content to a garbage NFT', async () => {
    let wasErrorEncountered = false;
    try {
      await contentInstance.addKarmaTo(address(100), 100);
    } catch (err) {
      wasErrorEncountered = true;
    }
    expect(wasErrorEncountered).to.equal(true);
  });

  it('can update the price of a token', async () => {
    const oldAmount = 500;
    const response = await contentInstance.publish(
      'Hello World!',
      oldAmount,
      {from: accounts[0]}
    );

    const tokenId = response.receipt.logs[0].args.tokenId;
    const newAmount = oldAmount * 2;
    await contentInstance.setPrice(tokenId, newAmount, {from: accounts[0]});
    const { 0: txt,
            1: price,
            2: karma,
            3: creator } = await contentInstance.getContentNft(tokenId);

    expect(price.toNumber()).to.equal(newAmount);
  });

  it('will reject anyone updating price except owner', async () => {
    const ownerAccount = accounts[0];
    const otherAccount = accounts[1];
    
    const oldAmount = 500;
    const response = await contentInstance.publish(
      'Hello World!',
      oldAmount,
      {from: ownerAccount}
    );

    let wasErrorEncountered = false;
    try {
      const tokenId = response.receipt.logs[0].args.tokenId;
      const newAmount = oldAmount * 2;
      await contentInstance.setPrice(tokenId, newAmount, {from: otherAccount});
      
    } catch (err) {
      wasErrorEncountered = true;
    }
    
    expect(wasErrorEncountered).to.equal(true);
  });
});
