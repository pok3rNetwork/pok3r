const hre = require('hardhat');
const ethers = hre.ethers;

async function getBalances() {
  const signers = await ethers.getSigners();
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const { chainId } = await provider.getNetwork();

  console.log(`\nAvailable Signers on ${chainId}:`, signers.length);
  for await (const signer of signers) {
    const raw = await signer.getBalance();
    const balance = parseInt(raw.toString()) / 10 ** 18;
    console.log(`balanceOf(${signer.address})`, balance, `"Ether"`);
  }
}

getBalances();
