const { invalidChain, getProvider } = require("./provider.js");
const { ethers } = require("ethers");

function Contract(address, abi, chainId) {
  const provider = getProvider(chainId);
  if (provider === invalidChain) return invalidChain;
  else return new ethers.Contract(address, abi, provider);
}

const extractedObject = (pathTo, name) => {
  return JSON.parse(
    require("fs").readFileSync(`${pathTo}/${name}.json`).toString()
  );
};

function loadContract(chainId, name) {
  const artifactsDir = `./data/${chainId}`;
  const address = extractedObject(artifactsDir, `${name}-address`).address;
  const abi = extractedObject(artifactsDir, name).abi;
  return Contract(address, abi, chainId);
}

module.exports = { Contract, loadContract };
