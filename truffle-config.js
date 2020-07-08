const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');

const mnemonic = fs.readFileSync(".secret").toString().trim();
const infuraKey = "c1d022ea24e94d51b7ae01f1f4df5e97";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },
      network_id: '*',
      gas: 9999999,
    },
    develop: {
      accounts: 25,
      defaultEtherBalance: 500,
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4,
      gas: 8500000,
      gasPrice: 20000000000
    }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};