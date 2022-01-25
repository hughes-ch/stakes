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
import ErrorPopup from './error-popup';
import { RelayProvider } from '@opengsn/provider';
import { startBlockchain,
         stopBlockchain } from '@stakes/contracts/scripts/local-blockchain';
import Web3 from 'web3';

/**
 * Returns the string camelcased
 *
 * @param {String} str String to convert
 * @return {String}
 */
function toCamelCase(str) {
  return str[0].toLowerCase() + str.slice(1);
}

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
        const camelCaseName = toCamelCase(name);
        const contractAbstraction = await contract(
          require(`${config.CONTRACT_LOCATION}/contracts/${name}.json`)
        );

        contractAbstraction.setProvider(provider);
        return [camelCaseName, await contractAbstraction.deployed()];
      })
    )
  );
}

/**
 * Initializes GSN and deploys contracts
 *
 * @param {Object} origProvider  Original web3 provider
 * @param {Object} contracts     Specifies paymaster, non-gsn, and gsn contracts
 * @return {Promise}
 */
async function initializeGsn(origProvider, contracts) {
  let deployed = await connectContractsToProvider(
    [contracts.paymaster].concat(contracts.nonGsn),
    origProvider
  );

  const forwarder = require(`${config.CONTRACT_LOCATION}/gsn/Forwarder.json`);
  const providerConfig = {
    forwarderAddress: forwarder.address,
    paymasterAddress: deployed[toCamelCase(contracts.paymaster)].address,
    jsonStringifyRequest: true,
    loggerConfiguration: { logLevel: 'error' },
  };

  const gsnProvider = await RelayProvider.newProvider({
    provider: origProvider,
    config: providerConfig,
  }).init();

  return {
    ...deployed,
    ...(await connectContractsToProvider(contracts.gsn, gsnProvider)),
  };
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
function fitTextWidthToContainer(element, limit) {
  if (!element) {
    return;
  }
    
  const textWidth = getTextWidth(element);
  const elementWidth = element.getBoundingClientRect().width;
  const widthMultiplier = 0.95 * elementWidth / textWidth;
  const proposedFontSize = window.getComputedStyle(element, null)
        .getPropertyValue('font-size').slice(0, -2) * widthMultiplier;

  const fontSize = limit && proposedFontSize > limit ? limit : proposedFontSize;
  element.style.fontSize = `${fontSize}px`;
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

/**
 * Returns an iterable range (like Python's range())
 *
 * @param {Number} n Upper bound of range (non-inclusive)
 * @return {Array}
 */
const range = n => Array.from(Array(n).keys());

/**
 * Scales from the Karma amount stored on the chain to the more human
 * readable one that's displayed to the user.
 *
 * @param {BigNumber} karma Karma amount from chain
 * @return {String}
 */
function scaleDownKarma(karma) {
  return karma.toString().slice(0, -config.KARMA_SCALE_FACTOR);
}

/**
 * Scales from the human-readable Karma amount to the scale stored on-chain
 *
 * @param {BigNumber} karma Karma amount (human-readable)
 * @return {String}
 */
function scaleUpKarma(karma) {
  return `${karma.toString()}${'0'.repeat(config.KARMA_SCALE_FACTOR)}`;
}

/**
 * Shortens the name if it is too long. Otherwise, returns name untouched.
 * 
 * @param {String} name (Potentially long) user name
 * @return {String}
 */
function getReasonablySizedName(name) {
  if (!name) {
    return name;
  }
  
  let sizeCheckedName = name;
  if (name.length > config.MAX_NAME_LENGTH) {
    const frontOfName = name.slice(0, config.SHORT_NAME_SEGMENT_LENGTH);
    const backOfName = name.slice(-config.SHORT_NAME_SEGMENT_LENGTH);
    sizeCheckedName = `${frontOfName} ... ${backOfName}`;
  }
  return sizeCheckedName;
}

/**
 * Display an error message to the user
 */
async function displayError(web3, setPopup) {
  const karmaBalance = scaleDownKarma(
    await web3.contracts.karma.balanceOf(web3.activeAccount)
  );

  const msg = karmaBalance <= config.LOW_KARMA_WARNING ?
        'Your Karma might be too low for that action' :
        'Try checking your connection and try again';
  
  setPopup(
    <ErrorPopup
      msg={ msg }
      onClick={ () => setPopup(undefined) }
    />
  );
}

/**
 * Returns the owner's page URL
 *
 * @param {String} owner The content owner
 * @param {Object} web3  Web3 Context
 * @return {String}
 */
function ownerPageUrl(owner, web3) {
  return owner === web3.activeAccount ?
    config.TOP_MOVERS_URL :
    `${config.URL_STAKE_PAGE}/${owner}`;
}

export { connectContractsToProvider,
         connectToLocalBlockChain,
         displayError,
         fitTextWidthToContainer,
         getFromIpfs,
         getReasonablySizedName,
         initializeGsn,
         ownerPageUrl,
         range,
         scaleDownKarma,
         scaleUpKarma,
         stopLocalBlockChain };
