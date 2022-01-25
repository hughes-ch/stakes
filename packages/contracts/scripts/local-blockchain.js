/**
 *   Utilities to start/stop the truffle development blockchain locally
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
const truffleSettings = require('../truffle-config');
const { spawn, spawnSync } = require('child_process');

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
 * Singleton container of spawned processes
 *
 * @return {Array}
 */
function spawnedProcesses() {
  if (spawnedProcesses.processes === undefined) {
    spawnedProcesses.processes = [];
  }
  return spawnedProcesses.processes;
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

  spawnedProcesses().push(spawn('yarn', ['truffle', 'dev'], options));
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
  spawnedProcesses().forEach(p => p.kill());
  spawnSync('pkill', ['-f', 'gsn']);
}
