const { RelayProvider } = require('@opengsn/provider');
const Web3 = require('web3');

function createTestProvider() {
  const providerConfig = {
    paymasterAddress: require('./build/gsn/Paymaster').address,
  };

  const host = 'http://127.0.0.1:9545';
  const origProvider = new Web3.providers.HttpProvider(host);
  const web3 = new Web3(origProvider);
  let relayProvider = RelayProvider.newProvider({
    provider: origProvider,
    config: providerConfig,
  });

  relayProvider.init().then(
    (provider) => {
      console.log(`Dependencies: ${Object.keys(provider.relayClient.dependencies)}`);
    }).catch((err) => {
      console.log(`Error found: ${err}`);
    });
  
  console.log(`Provider: ${relayProvider}`);
  return relayProvider;
}

module.exports = {
  compilers: {
    solc: {
      version: "0.8.11",
      docker: true,
    },
  },
  // networks: {
  //   test: {
  //     provider: async function() {
  //       const providerConfig = {
  //         paymasterAddress: require('./build/gsn/Paymaster').address,
  //       };

  //       const host = 'http://127.0.0.1:9545';
  //       const origProvider = new Web3.providers.HttpProvider(host);
  //       const web3 = new Web3(origProvider);
        
  //       let relayProvider;
  //       const promise = RelayProvider.newProvider({
  //         provider: origProvider,
  //         config: providerConfig,
  //       }).init().then((provider) => {
  //         relayprovider = provider;
  //       });

  //       Promise.all([promise]);
  //       return relayProvider;
  //     },
  //     network_id: "*",
  //   },
  // },
  // Uncommenting the defaults below 
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  //networks: {
  //  development: {
  //    host: "127.0.0.1",
  //    port: 7545,
  //    network_id: "*"
  //  },
  //  test: {
  //    host: "127.0.0.1",
  //    port: 7545,
  //    network_id: "*"
  //  }
  //},
  //
  // Truffle DB is currently disabled by default; to enable it, change enabled:
  // false to enabled: true. The default storage location can also be
  // overridden by specifying the adapter settings, as shown in the commented code below.
  //
  // NOTE: It is not possible to migrate your contracts to truffle DB and you should
  // make a backup of your artifacts to a safe location before enabling this feature.
  //
  // After you backed up your artifacts you can utilize db by running migrate as follows: 
  // $ truffle migrate --reset --compile-all
  //
  // db: {
    // enabled: false,
    // host: "127.0.0.1",
    // adapter: {
    //   name: "sqlite",
    //   settings: {
    //     directory: ".db"
    //   }
    // }
  // }
};
