import { ethers } from 'hardhat';
import hre from 'hardhat';
import { constructorArguments } from './arguments';
import fs from 'fs';
import path from 'path';

const deployContractConstructor = async (
  name: string,
  constructorArguments: any = null
) => {
  const contractName = name;
  const contractFactory = await ethers.getContractFactory(contractName);
  let contractInstance: any;
  if (constructorArguments) {
    const contractInstance = await contractFactory.deploy(
      constructorArguments,
      {}
    );
  } else {
    console.log('DEPLOYING NO constructor');
    const contractInstance = await contractFactory.deploy({});
  }
  console.log(contractInstance.address);
  return contractInstance;
};

const deployContract = async (name: string) => {
  const contractName = name;
  const contractFactory = await ethers.getContractFactory(contractName);
  const contractInstance = await contractFactory.deploy({
    // value: ethers.utils.parseEther('0.000001'),
  });
  return contractInstance;
};

const main = async () => {
  const [owner, addr1, addr2] = await ethers.getSigners();
  const sub = await deployContract('WARVRF');
  console.log('Contract sub deployed to:', sub.address);

  await sub.deployTransaction.wait(5);
  await hre.run('verify:verify', {
    network: 'matic',
    contract: 'contracts/WARVRF.sol:WARVRF',
    address: sub.address,
  });

  return sub.address;
};

const getTheAbi = (name: string) => {
  try {
    const dir = path.resolve(
      __dirname,
      `./artifacts/contracts/${name}.sol/${name}.json`
    );
    const file = fs.readFileSync(dir.replace('/scripts', ''), 'utf8');
    const json = JSON.parse(file);
    const abi = json.abi;
    return abi;
  } catch (e) {
    console.log(`e`, e);
  }
};

const delay = (ms: any) => new Promise((res) => setTimeout(res, ms));

const send_transactions = async (consumerAddress: any) => {
  console.log('Starting Transaction');
  await delay(10000);
  const [owner] = await ethers.getSigners();
  const abi = getTheAbi('WARVRF');
  const vrf = new ethers.Contract(consumerAddress, abi, owner);
  await vrf.requestRandomWords();
};

const addConsumer = async (address: any) => {
  const [owner] = await ethers.getSigners();
  const abi = getTheAbi('VRFSubscriber');
  const vrf = new ethers.Contract(
    '0xda3560218d7f9fd9cfe35568011d4518f8f4c26c',
    abi,
    owner
  );
  const tx = await vrf.addConsumer(address);

  console.log('New consumer Added');
};

const workflow = async () => {
  let subAddress = await main();
  subAddress = subAddress.toLowerCase();
  await addConsumer(subAddress);
  await send_transactions(subAddress);
};

workflow().catch((error) => {
  console.error(error);
  console.log('ERROR DEPLOY');
  process.exitCode = 1;
});

// send_transactions().catch((error) => {
//   console.error(error);
// });

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   console.log('ERROR DEPLOY');
//   process.exitCode = 1;
// });
