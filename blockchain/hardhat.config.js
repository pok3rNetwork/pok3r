require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const csNodeKey = process.env.CHAINSTACK_KEY;
const amNodeKey = process.env.ALCHEMY_OPTM_KEY;
const atNodeKey = process.env.ALCHEMY_OPTT_KEY;

function getProvider(chainId) {
  const csUrl = `https://nd-523-252-766.p2pify.com/${csNodeKey}/`;
  const aUrl = `g.alchemy.com/v2/`;
  switch (chainId) {
    case 10:
      return 'https://opt-mainnet.' + aUrl + amNodeKey;
    case 69:
      return 'https://opt-kovan.' + aUrl + atNodeKey;

    case 137:
      return csUrl;
    case 80001:
      return csUrl;

    default:
      return 'unsupported/chainId';
  }
}

const mainnetAccount = [process.env.MAINNET_KEY];
const testnetAccounts = process.env.TESTNET_BANK.split(',');
console.log(testnetAccounts);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    optimism: {
      url: getProvider(10),
      accounts: mainnetAccount,
    },
    optimismKovan: {
      url: getProvider(69),
      accounts: testnetAccounts,
    },

    polygon: {
      url: getProvider(137),
      accounts: mainnetAccount,
    },
    mumbai: {
      url: getProvider(80001),
      accounts: testnetAccounts,
    },
  },
  solidity: '0.8.17',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  mocha: { timeout: 40000 },
};
