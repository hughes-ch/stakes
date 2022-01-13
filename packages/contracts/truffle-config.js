/**
 * This file contains common constants and settings
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
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
  },
};
