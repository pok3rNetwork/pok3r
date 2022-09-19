const { runDeployment, saveFrontendFiles } = require('./deployment');
const hre = require('hardhat');
const ethers = hre.ethers;

const oracles = require('./utils/oracles');
async function deployAll() {
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const { chainId } = await provider.getNetwork();
  const deployer = (await ethers.getSigners())[0];
  console.log(
    `\nDeploying contracts with ${deployer.address} on chain:${chainId}`
  );
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}\n`);

  let token;
  const isDev = chainId === 31337 || chainId === 1337;
  if (isDev) token = await runDeployment('usdt', chainId);
  const deployedToken = token !== undefined;
  const tokenAddress =
    deployedToken === true ? token.address : oracles[chainId.toString()];

  const LobbyTrackerFactory = await ethers.getContractFactory('LobbyTracker');
  const LobbyTracker = await LobbyTrackerFactory.deploy(tokenAddress);
  console.log(`\LobbyTracker deployed to ${LobbyTracker.address}`);
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);
  saveFrontendFiles(LobbyTracker, 'LobbyTracker', chainId);
}

deployAll();
