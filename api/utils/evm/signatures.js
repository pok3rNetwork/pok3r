const { ethers } = require("ethers");

async function verifySignature(message, signature, address) {
  try {
    const signerAddr = await ethers.utils.verifyMessage(message, signature);
    return address === signerAddr;
  } catch {
    return false;
  }
}

async function signerAddress(message, signature) {
  return await ethers.utils.verifyMessage(message, signature);
}

module.exports = { verifySignature, signerAddress };
