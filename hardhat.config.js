require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const mNodeKey = process.env.MORALIS_KEY;
const aMNodeKey = process.env.ALCHEMY_OPTM_KEY;
const aTNodeKey = process.env.ALCHEMY_OPTT_KEY;

function getProvider(chainId) {
  const mRegions = ['speedy-nodes-nyc'];
  const mUrl = `https://nd-523-252-766.p2pify.com/${mNodeKey}/`;
  const aUrl = `g.alchemy.com/v2/`;
  switch (chainId) {
    case 10:
      return 'https://opt-mainnet.' + aUrl + aMNodeKey;
    case 69:
      return 'https://opt-kovan.' + aUrl + aTNodeKey;

    case 137:
      return mUrl;
    case 80001:
      return mUrl;

    default:
      return 'unsupported/chainId';
  }
}

const mainnetAccount = [process.env.MAINNET_KEY];
const testnetAccounts = process.env.TESTNET_BANK.split(',');

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
  paths: {
    sources: './blockchain/contracts',
    tests: './blockchain/test',
    cache: './blockchain/cache',
    artifacts: './blockchain/artifacts',
  },
  mocha: { timeout: 40000 },
};
