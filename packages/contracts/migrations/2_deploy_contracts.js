const Content = artifacts.require("Content");
const Karma = artifacts.require("Karma");
const KarmaPaymaster = artifacts.require("KarmaPaymaster");
const Search = artifacts.require("Search");
const { spawn } = require('child_process');
const Stake = artifacts.require("Stake");

module.exports = async function(deployer) {
  await deployer.deploy(Karma);
  await deployer.link(Karma, KarmaPaymaster);
  await deployer.deploy(KarmaPaymaster, Karma.address);
  const karmaInstance = await Karma.deployed();
  await karmaInstance.setMinter(KarmaPaymaster.address);

  const forwarder = require( '../build/gsn/Forwarder.json').address;
  await deployer.deploy(Search);
  await deployer.link(Search, Stake);
  await deployer.deploy(Stake, forwarder);

  const relayHubAddress = require('../build/gsn/RelayHub.json').address;
  const paymaster = await KarmaPaymaster.deployed();
  await paymaster.setRelayHub(relayHubAddress);
  await paymaster.setTrustedForwarder(forwarder);

  await deployer.link(Karma, Content);
  return deployer.deploy(Content, Karma.address, forwarder);
};
