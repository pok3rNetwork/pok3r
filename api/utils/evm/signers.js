const hre = require('hardhat');
const ethers = hre.ethers;

const signers = async () => await ethers.getSigners();
const deployer = async () => (await signers())[0];

module.exports = { signers, deployer };
