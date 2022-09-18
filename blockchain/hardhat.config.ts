import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';
import '@nomiclabs/hardhat-etherscan';

const PRIVATE_KEY: string = process.env.PRIVATE_KEY ?? 'default';
const POLYGON_SCAN: string = process.env.POLYGON_SCAN_API_KEY ?? 'default';
const config: HardhatUserConfig = {
  defaultNetwork: 'matic',
  networks: {
    hardhat: {},
    matic: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: [PRIVATE_KEY],
    },
    fork_mumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/BNUuST5J0QnWZ47NhzBJOzsFSnl7BXKN',
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: { polygonMumbai: POLYGON_SCAN },
  },
  solidity: '0.8.17',
};

export default config;
