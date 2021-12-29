const Content = artifacts.require("Content");
const Karma = artifacts.require("Karma");
const Search = artifacts.require("Search");
const Stake = artifacts.require("Stake");

module.exports = async function(deployer) {
  deployer.deploy(Search);
  deployer.link(Search, Stake);
  deployer.deploy(Stake);
  await deployer.deploy(Karma);
  await deployer.link(Karma, Content);
  return deployer.deploy(Content, Karma.address);
};
