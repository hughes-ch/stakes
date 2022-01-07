/**
 *   Common function definitions
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import contract from '@truffle/contract';

/**
 * Connects contracts to the provider
 *
 * @param {Array}  contracts Name of contracts
 * @param {Object} provider  Web3 Provider
 * @return {Promise} Resolves to deployed contract instances
 */
async function connectContractsToProvider(contracts, provider) {
  return Object.fromEntries(
    await Promise.all(
      contracts.map(async name => {
        const camelCaseName = name[0].toLowerCase() + name.slice(1);
        const contractAbstraction = await contract(
          require(`${config.CONTRACT_LOCATION}/${name}.json`)
        );

        contractAbstraction.setProvider(provider);
        return [camelCaseName, await contractAbstraction.deployed()];
      })
    )
  );
}

export { connectContractsToProvider };
