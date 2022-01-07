/**
 *   Utilities to start/stop the truffle development blockchain locally
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
const truffleSettings = require('../truffle-config');
const { spawn, spawnSync } = require('child_process');

let truffleDev;

/**
 * Sleeps for number of millis
 *
 * @param {Number} ms Millis to sleep
 * @return {undefined}
 */
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Starts the blockchain locally and deploys GSN
 *
 * @return {Array} [host, port]
 */
exports.startBlockchain = async function() {
  const options = {
    cwd: __dirname,
    stdio: 'ignore',
  };
  
  truffleDev = spawn('yarn', ['truffle', 'dev'], options);
  await delay(10000);
  spawnSync('yarn', ['gsn-start'], options);
  spawnSync('yarn', ['truffle', 'migrate', '--network', 'test'], options);
  return [
    truffleSettings.networks.test.host,
    truffleSettings.networks.test.port,
  ];
}

/**
 * Stops the local blockchain and terminates GSN
 *
 * @return {undefined}
 */
exports.stopBlockchain = function() {
  truffleDev.kill();
  spawn('pkill', ['-f', 'gsn']);
}
