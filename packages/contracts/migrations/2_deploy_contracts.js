const Array = artifacts.require("Array");
const Content = artifacts.require("Content");
const Karma = artifacts.require("Karma");
const KarmaPaymaster = artifacts.require("KarmaPaymaster");
const Stake = artifacts.require("Stake");
const String = artifacts.require("String");

module.exports = async function(deployer, network) {
  await deployer.deploy(Karma);
  await deployer.link(Karma, KarmaPaymaster);
  await deployer.deploy(KarmaPaymaster, Karma.address);
  const karmaInstance = await Karma.deployed();
  await karmaInstance.setMinter(KarmaPaymaster.address);

  const forwarder = network === 'ropsten' ?
        '0xeB230bF62267E94e657b5cbE74bdcea78EB3a5AB' :
        require( '../build/gsn/Forwarder.json').address;
  
  await deployer.deploy(Array);
  await deployer.deploy(String);
  await deployer.link(Array, Stake);
  await deployer.link(String, Stake);
  await deployer.deploy(Stake, forwarder);

  const relayHubAddress = network === 'ropsten' ?
        '0xAa3E82b4c4093b4bA13Cb5714382C99ADBf750cA' :
        require('../build/gsn/RelayHub.json').address;
  
  const paymaster = await KarmaPaymaster.deployed();
  await paymaster.setRelayHub(relayHubAddress);
  await paymaster.setTrustedForwarder(forwarder);

  await deployer.link(Karma, Content);
  return deployer.deploy(Content, Karma.address, forwarder);
};
