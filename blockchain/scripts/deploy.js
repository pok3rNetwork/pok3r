const { runDeployment, saveFrontendFiles } = require('./deployment');
const hre = require('hardhat');
const ethers = hre.ethers;

const oracles = require('./utils/oracles');
const initialize = require('./initialize.js');

async function deployAll() {
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const { chainId } = await provider.getNetwork();
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log(
    `\nDeploying contracts with ${deployer.address} on chain:${chainId}`
  );
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}\n`);

  let token;
  const isDev = chainId === 31337 || chainId === 1337 || chainId === 80001;
  if (isDev) token = await runDeployment('usdt', chainId);
  const tokenAddress =
    chainId === 137
      ? '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' // USDC (PoS)
      : token.address;

  const LobbyTrackerFactory = await ethers.getContractFactory('LobbyTracker');
  const LobbyTracker = await LobbyTrackerFactory.deploy(tokenAddress);

  console.log(`\nLobbyTracker deployed to ${LobbyTracker.address}`);
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);
  saveFrontendFiles(LobbyTracker, 'LobbyTracker', chainId);

  if (isDev) await initialize(signers, token, LobbyTracker);
}

deployAll();
