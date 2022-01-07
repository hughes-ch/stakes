/**
 *   Common function definitions
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import config from './config';
import contract from '@truffle/contract';
import { startBlockchain,
         stopBlockchain } from '@stakes/contracts/scripts/local-blockchain';
import Web3 from 'web3';


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

/**
 * Connects to a local blockchain instance (for test)
 *
 * @return {Promise} Resolves to Web3Context
 */
async function connectToLocalBlockChain() {
  const [host, port] = await startBlockchain();
  const provider = new Web3.providers.HttpProvider(
    `http://${host}:${port}`,
    { keepAlive: false }
  );
  
  const web3 = new Web3(provider);
  return {
    activeAccount: (await web3.eth.getAccounts())[0],
    instance: web3,
    contracts: await connectContractsToProvider(
      ['Karma', 'Stake', 'KarmaPaymaster'], provider
    ),
  };
}

/**
 * Stops the local blockchain instance (for test)
 *
 * @return {Promise}
 */
function stopLocalBlockChain() {
  stopBlockchain();
}

export { connectContractsToProvider,
         connectToLocalBlockChain,
         stopLocalBlockChain };
