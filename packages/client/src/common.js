/**
 *   Common function definitions
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import all from 'it-all';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
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
 * Gets computed CSS style
 *
 * @param {Object} element Element to get
 * @param {String} prop    Property to get
 * @return {String}
 */
function getCssStyle(element, prop) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}

/**
 * Gets text width
 *
 * @param {String} text Text to measure
 * @param {String} font CSS font descriptor
 * @return {Number}
 *
 * @see https://stackoverflow.com/questions/118241
 */
function getTextWidth(el) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
  const fontSize = getCssStyle(el, 'font-size') || '16px';
  const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';
  const font = `${fontWeight} ${fontSize} ${fontFamily}`;
  
  const canvas = getTextWidth.canvas ||
        (getTextWidth.canvas = document.createElement("canvas"));
  
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(el.innerHTML);
  return metrics.width;
}

/**
 * Fits the text width to its container
 *
 * @param {Object} element   DOM element to fit
 * @return {undefined}
 */
function fitTextWidthToContainer(element) {
  const textWidth = getTextWidth(element);
  const elementWidth = element.getBoundingClientRect().width;
  const widthMultiplier = 0.95 * elementWidth / textWidth;
  const fontSize = window.getComputedStyle(element, null)
        .getPropertyValue('font-size').slice(0, -2);

  element.style.fontSize = `${fontSize * widthMultiplier}px`;
}

/**
 * Counter for number of blockchain connections
 *
 * @return {Object}
 */
function blockChainConnections() {
  if (blockChainConnections.connections === undefined) {
    blockChainConnections.connections = {
      count: 0,
    }
  }
  return blockChainConnections.connections;
}

/**
 * Connects to a local blockchain instance (for test)
 *
 * @return {Promise} Resolves to Web3Context
 */
async function connectToLocalBlockChain() {
  blockChainConnections().count++;
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
      ['Karma', 'KarmaPaymaster', 'Stake', 'Content'], provider
    ),
  };
}

/**
 * Stops the local blockchain instance (for test)
 *
 * @return {Promise}
 */
function stopLocalBlockChain() {
  blockChainConnections().count--;
  if (blockChainConnections().count === 0) {
    stopBlockchain();
  }
}

/**
 * Gets data from IPFS
 * 
 * @param {Object} ipfs Instance of IPFS
 * @param {String} cid  CID of data to get
 * @return {Promise} resolves to Uint8Array
 */
async function getFromIpfs(ipfs, cid) {
  return uint8ArrayConcat(await all(ipfs.cat(cid)));
}

export { connectContractsToProvider,
         connectToLocalBlockChain,
         fitTextWidthToContainer,
         stopLocalBlockChain };
