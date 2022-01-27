/**
 * This file contains common constants and settings
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  compilers: {
    solc: {
      version: "0.8.11",
      docker: true,
    },
  },
  networks: {
    test: {
      host: "0.0.0.0",
      port: 9545,
      migrateNone: true,
      network_id: "*",
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`
        ),
      network_id: 3,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true, 
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
        ),
      network_id: 4,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true, 
    },
  },
};
