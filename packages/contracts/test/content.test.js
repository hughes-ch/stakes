/**
 *   Tests for the Content contract
 *   
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { clearAccounts,
        forwarder,
        getErrorType,
        giveSomeKarmaTo,
        wrapProvider } = require('./utilities');
const Content = artifacts.require("Content");
const { ethers } = require("ethers");
const Karma = artifacts.require("Karma");
const KarmaPaymaster = artifacts.require("KarmaPaymaster");

let contentInstance;
let karmaInstance
let paymasterInstance;
const origProvider = web3.currentProvider;

contract('Content', (accounts) => {
  /**
   * Initial setup and teardown
   */
  beforeEach(async () => {
    karmaInstance = await Karma.deployed();
    paymasterInstance = await KarmaPaymaster.deployed();
    contentInstance = await Content.new(karmaInstance.address, forwarder());

    const relayProvider = await wrapProvider(
      origProvider,
      paymasterInstance.address
    );
    Content.setProvider(relayProvider);

    const promises = [];
    for (let ii = 0; ii < 3; ii++) {
      promises.push(giveSomeKarmaTo(
        accounts[ii],
        paymasterInstance,
        karmaInstance
      ));
    }
    return Promise.all(promises);
  });

  afterEach(async () => {
    Content.setProvider(origProvider);
    return clearAccounts(accounts, karmaInstance, paymasterInstance);
  });

  /**
   * Unit tests
   */
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

    expect(await getErrorType(
      contentInstance.publish(contentTxt, contentPrice, {from: accounts[0]})
    )).not.to.be.null;
  });

  it('should reject empty content when fetching NFTs', async () => {
    expect(await getErrorType(
      contentInstance.getContentNft(10)
    )).not.to.be.null;
  });

  it('should accumulate karma', async () => {
    const holdingAccount = accounts[0];
    const sendingAccount = accounts[1];

    const contentTxt = 'Hello world!';
    const contentPrice = web3.utils.toWei('5000', 'gwei');
    const response = await contentInstance.publish(
      contentTxt,
      contentPrice,
      {from: holdingAccount}
    );
    
    const tokenId = response.receipt.logs[0].args.tokenId;
    const amountToAdd = web3.utils.toWei('5', 'gwei');
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
    expect(afterKarmaBalance - priorKarmaBalance)
      .to.be.closeTo(
        Number(amountToAdd),
        Number(web3.utils.toWei('1', 'gwei'))
      );

    const { 0: txt,
            1: price,
            2: karma,
            3: creator } = await contentInstance.getContentNft(tokenId);
    expect(karma.toString()).to.equal(amountToAdd);
  });

  it('should reject adding content to a garbage NFT', async () => {
    expect(await getErrorType(
      contentInstance.addKarmaTo(100, 100)
    )).not.to.be.null;
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

    const tokenId = response.receipt.logs[0].args.tokenId;
    const newAmount = oldAmount * 2;
    expect(await getErrorType(
      contentInstance.setPrice(tokenId, newAmount, {from: otherAccount})
    )).not.to.be.null;
  });

  it('will not do stuff unless you have karma', async () => {
    const contentTxt = 'Hello world!';
    const contentPrice = 50000;
    expect(await getErrorType(
      contentInstance.publish(contentTxt, contentPrice, {from: accounts[7]})
    )).not.to.be.null;
  });

  it('should cost money to publish', async () => {
    const account = accounts[0];
    const balanceBefore = await karmaInstance.balanceOf(account);

    const contentTxt = 'Hello world!';
    const contentPrice = web3.utils.toWei('5000', 'gwei');
    const response = await contentInstance.publish(
      contentTxt,
      contentPrice,
      {from: account}
    );
    
    const balanceAfter = await karmaInstance.balanceOf(account);
    expect(balanceBefore > balanceAfter).to.be.true;
  });

  it('allows users to buy content', async () => {
    const publisher = accounts[0];
    const buyer = accounts[1];

    const contentTxt = 'Hello world!';
    const contentPrice = web3.utils.toWei('500', 'gwei'); // KARMA === 1 wei
    const response = await contentInstance.publish(
      contentTxt,
      ethers.BigNumber.from(contentPrice),
      {from: publisher}
    );

    const tokenId = response.receipt.logs[0].args.tokenId;
    await karmaInstance.increaseAllowance(
      contentInstance.address,
      ethers.BigNumber.from(contentPrice),
      { from: buyer }
    );

    const publisherKarmaBefore = await karmaInstance.balanceOf(publisher);
    const buyerKarmaBefore = await karmaInstance.balanceOf(buyer);
    await contentInstance.buyContent(tokenId, { from: buyer });
    const publisherKarmaAfter = await karmaInstance.balanceOf(publisher);
    const buyerKarmaAfter = await karmaInstance.balanceOf(buyer);
    
    expect((await contentInstance.balanceOf(publisher)).toNumber()).to.equal(0);
    expect((await contentInstance.balanceOf(buyer)).toNumber()).to.equal(1);

    const publisherKarmaIncrease = publisherKarmaAfter.sub(publisherKarmaBefore);
    expect(
      publisherKarmaIncrease.gte(contentPrice),
      `Expected karma to increase by ${contentPrice}. Got ${publisherKarmaIncrease}`
    ).to.be.true;

    const buyerKarmaDecrease = buyerKarmaBefore.sub(buyerKarmaAfter);
    expect(
      buyerKarmaDecrease.gte(contentPrice),
      `Expected karma to decrease by ${contentPrice}. Got ${buyerKarmaDecrease}`
    ).to.be.true;
  });

  it('rejects purchases without enough karma', async () => {
    const publisher = accounts[0];
    const buyer = accounts[1];
    const buyerKarma = await karmaInstance.balanceOf(buyer);

    const contentTxt = 'Hello world!';
    const contentPrice = buyerKarma * 2;
    const response = await contentInstance.publish(
      contentTxt,
      contentPrice.toString(),
      {from: publisher}
    );

    const tokenId = response.receipt.logs[0].args.tokenId;

    expect(await getErrorType(
      contentInstance.buyContent(tokenId)
    )).not.to.be.null;
  });
});
