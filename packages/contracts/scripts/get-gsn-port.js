/**
 *  Outputs the port for the local OpenGSN network
 *
 *  :copyright: Copyright (c) 2022 Chris Hughes
 *  :license: MIT License
 */
const config = require('../truffle-config.js');
console.log(config.networks.test.port);
