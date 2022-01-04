const Content = artifacts.require("Content");
const Karma = artifacts.require("Karma");
const KarmaPaymaster = artifacts.require("KarmaPaymaster");
const Search = artifacts.require("Search");
const { spawn } = require('child_process');
const Stake = artifacts.require("Stake");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function(deployer) {
  await deployer.deploy(Karma);
  await deployer.link(Karma, KarmaPaymaster);
  await deployer.deploy(KarmaPaymaster, Karma.address);
  const karmaInstance = await Karma.deployed();
  await karmaInstance.setMinter(KarmaPaymaster.address);

  const gsnServer = spawn(
    'gsn',
    [
      'start',
      '--workdir', 'build/gsn/',
      '-n', web3.currentProvider.host,
      '-l', 'error'
    ],
    {
      stdio: 'ignore',
    }
  );

  await sleep(10000);
  
  const forwarder = require( '../build/gsn/Forwarder.json').address;
  await deployer.deploy(Search);
  await deployer.link(Search, Stake);
  await deployer.deploy(Stake, forwarder);

  const relayHubAddress = require('../build/gsn/RelayHub.json').address;
  const paymaster = await KarmaPaymaster.deployed();
  await paymaster.setRelayHub(relayHubAddress);
  await paymaster.setTrustedForwarder(forwarder);

  console.log(`URL1: ${web3.currentProvider.host}`);
  console.log(`Address1: ${Stake.address}`);

  await deployer.link(Karma, Content);
  return deployer.deploy(Content, Karma.address);
};
