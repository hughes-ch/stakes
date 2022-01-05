/**
 *   Testing utilities
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
const { RelayProvider } = require('@opengsn/provider');

/**
 * Returns the type of error that was encountered
 *
 * @param {Promise} promise That will resolve to error
 * @return {String}
 */
exports.getErrorType = async function(promise) {
  try {
    await promise;
  } catch (err) {
    return err.name;
  }
  return null;
}

/**
 * Adds Karma to the account (and funds paymaster with ETH)
 *
 * @param {Number} account    Address of account to fund
 * @param {Object} paymaster  Paymaster contract abstraction
 * @param {Object} karma       Karma contract abstraction
 * @return {Promise}
 */
exports.giveSomeKarmaTo = async function(account, paymaster, karma) {
  await paymaster.buyKarma({
    from: account,
    value: web3.utils.toWei('2', 'ether'),
  });
  
  return karma.increaseAllowance(
    paymaster.address,
    await karma.balanceOf(account),
    { from: account }
  );
}

/**
 * Returns the address of the trusted forwarder
 *
 * @return {Number}
 */
exports.forwarder = function() {
  return require('../build/gsn/Forwarder.json').address;
}

/**
 * Wraps the current web3 provider with a new GSN relay provider
 *
 * @param {Object} origProvider  The original web3 provider
 * @param {Number} paymaster     Address of the paymaster
 * @return {Object}
 */
exports.wrapProvider = async function(origProvider, paymaster) {
  const providerConfig = {
    forwarderAddress: exports.forwarder(),
    paymasterAddress: paymaster,
    methodSuffix: '',
    jsonStringifyRequest: false,
    loggerConfiguration: {
      logLevel: 'error',
    },
  };

  return RelayProvider.newProvider({
    provider: origProvider,
    config: providerConfig,
  }).init();
}

/**
 * Clear accounts of Karma and ETH
 *
 * @param {Array}  accounts   Accounts to clear
 * @param {Object} karma      Karma contract instance abstraction
 * @param {Object} paymaster  Paymaster contract instance abstraction
 * @param {Number} ownerIdx   Index of owner account in accounts array
 * @return {undefined}
 */
exports.clearAccounts = async function(accounts, karma, paymaster, ownerIdx=0) {
  const promises = accounts.map(async (acct, idx) => {
    if (idx != ownerIdx) {
      await karma.approve(paymaster.address, 0, {from: acct});
      const balance = await karma.balanceOf(acct);
      return karma.transfer(accounts[ownerIdx], balance, {from: acct});
    }
  });

  await Promise.all(promises);
  return paymaster.withdrawAll();
}
