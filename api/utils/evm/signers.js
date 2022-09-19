const hre = require('hardhat');
const ethers = hre.ethers;

const signers = async () => await ethers.getSigners();

module.exports = signers;
