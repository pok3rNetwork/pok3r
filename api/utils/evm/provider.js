require('dotenv').config();
const mNodeKey = process.env.MORALIS_KEY;
const aMNodeKey = process.env.ALCHEMY_OPTM_KEY;
const aTNodeKey = process.env.ALCHEMY_OPTT_KEY;
const { ethers } = require('ethers');
const hre = require('hardhat');

const invalidChain = 'unsupported/chainId';
function getProvider(chainId) {
  const isDev = chainId === 31337 || chainId === 1337;
  if (isDev)
    return new ethers.providers.JsonRpcProvider(hre.network.config.url);
  else {
    const mRegions = ['speedy-nodes-nyc'];
    const mUrl = `https://${mRegions[0]}.moralis.io/${mNodeKey}/`;
    const aUrl = `g.alchemy.com/v2/`;
    switch (chainId) {
      case 1:
        return new ethers.providers.JsonRpcProvider(mUrl + 'eth/mainnet');
      case 10:
        return new ethers.providers.JsonRpcProvider(
          'https://opt-mainnet.' + aUrl + aMNodeKey
        );
      case 3:
        return new ethers.providers.JsonRpcProvider(mUrl + 'eth/ropsten');
      case 4:
        return new ethers.providers.JsonRpcProvider(mUrl + 'eth/rinkeby');
      case 42:
        return new ethers.providers.JsonRpcProvider(mUrl + 'eth/kovan');
      case 420:
        return new ethers.providers.JsonRpcProvider(mUrl + 'eth/goerli');
      case 69:
        return new ethers.providers.JsonRpcProvider(
          'https://opt-kovan.' + aUrl + aTNodeKey
        );

      case 42161:
        return new ethers.providers.JsonRpcProvider(mUrl + 'arbitrum/mainnet');
      case 421611:
        return new ethers.providers.JsonRpcProvider(mUrl + 'arbitrum/testnet');

      case 56:
        return new ethers.providers.JsonRpcProvider(mUrl + 'bsc/mainnet');
      case 97:
        return new ethers.providers.JsonRpcProvider(mUrl + 'bsc/testnet');

      case 137:
        return new ethers.providers.JsonRpcProvider(mUrl + 'polygon/mainnet');
      case 80001:
        return new ethers.providers.JsonRpcProvider(mUrl + 'polygon/mumbai');

      case 43114:
        return new ethers.providers.JsonRpcProvider(mUrl + 'avalanche/mainnet');
      case 43113:
        return new ethers.providers.JsonRpcProvider(mUrl + 'avalanche/testnet');

      case 250:
        return new ethers.providers.JsonRpcProvider(mUrl + 'fantom/mainnet');

      default:
        return invalidChain;
    }
  }
}

module.exports = { getProvider, invalidChain };
