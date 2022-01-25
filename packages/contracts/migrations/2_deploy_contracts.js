const Array = artifacts.require("Array");
const Content = artifacts.require("Content");
const Karma = artifacts.require("Karma");
const KarmaPaymaster = artifacts.require("KarmaPaymaster");
const Stake = artifacts.require("Stake");
const String = artifacts.require("String");

module.exports = async function(deployer) {
  await deployer.deploy(Karma);
  await deployer.link(Karma, KarmaPaymaster);
  await deployer.deploy(KarmaPaymaster, Karma.address);
  const karmaInstance = await Karma.deployed();
  await karmaInstance.setMinter(KarmaPaymaster.address);

  const forwarder = require( '../build/gsn/Forwarder.json').address;
  await deployer.deploy(Array);
  await deployer.deploy(String);
  await deployer.link(Array, Stake);
  await deployer.link(String, Stake);
  await deployer.deploy(Stake, forwarder);

  const relayHubAddress = require('../build/gsn/RelayHub.json').address;
  const paymaster = await KarmaPaymaster.deployed();
  await paymaster.setRelayHub(relayHubAddress);
  await paymaster.setTrustedForwarder(forwarder);

  await deployer.link(Karma, Content);
  return deployer.deploy(Content, Karma.address, forwarder);
};
