require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const mNodeKey = process.env.MORALIS_KEY;
const aMNodeKey = process.env.ALCHEMY_OPTM_KEY;
const aTNodeKey = process.env.ALCHEMY_OPTT_KEY;

function getProvider(chainId) {
  const mRegions = ['speedy-nodes-nyc'];
  const mUrl = `https://${mRegions[0]}.moralis.io/${mNodeKey}/`;
  const aUrl = `g.alchemy.com/v2/`;
  switch (chainId) {
    case 1:
      return mUrl + 'eth/mainnet';
    case 10:
      return 'https://opt-mainnet.' + aUrl + aMNodeKey;
    case 3:
      return mUrl + 'eth/ropsten';
    case 4:
      return mUrl + 'eth/rinkeby';
    case 42:
      return mUrl + 'eth/kovan';
    case 420:
      return mUrl + 'eth/goerli';
    case 69:
      return 'https://opt-kovan.' + aUrl + aTNodeKey;

    case 42161:
      return mUrl + 'arbitrum/mainnet';
    case 421611:
      return mUrl + 'arbitrum/testnet';

    case 56:
      return mUrl + 'bsc/mainnet';
    case 97:
      return mUrl + 'bsc/testnet';

    case 137:
      return mUrl + 'polygon/mainnet';
    case 80001:
      return mUrl + 'polygon/mumbai';

    case 43114:
      return mUrl + 'avalanche/mainnet';
    case 43113:
      return mUrl + 'avalanche/testnet';

    case 250:
      return mUrl + 'fantom/mainnet';

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
    ethereum: {
      url: getProvider(1),
      accounts: mainnetAccount,
    },
    optimism: {
      url: getProvider(10),
      accounts: mainnetAccount,
    },
    ropsten: {
      url: getProvider(3),
      accounts: testnetAccounts,
    },
    rinkeby: {
      url: getProvider(4),
      accounts: testnetAccounts,
    },
    kovan: {
      url: getProvider(42),
      accounts: testnetAccounts,
    },
    goerli: {
      url: getProvider(420),
      accounts: testnetAccounts,
    },
    optimismKovan: {
      url: getProvider(69),
      accounts: testnetAccounts,
    },

    arbitrum: {
      url: getProvider(42161),
      accounts: mainnetAccount,
    },
    arbitrumTestnet: {
      url: getProvider(421611),
      accounts: testnetAccounts,
    },

    binance: {
      url: getProvider(56),
      accounts: mainnetAccount,
    },
    binanceTestnet: {
      url: getProvider(97),
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

    avalanche: {
      url: getProvider(43114),
      accounts: mainnetAccount,
    },
    avalancheTestnet: {
      url: getProvider(43113),
      accounts: testnetAccounts,
    },

    fantom: {
      url: getProvider(250),
      accounts: mainnetAccount,
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
