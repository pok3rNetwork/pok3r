require("dotenv").config();
const { create } = require("ipfs-http-client");
const makeIpfsFetch = require("js-ipfs-fetch");
const fs = require("fs");

const host = process.env.IPFS_HOST;
const port = process.env.IPFS_PORT;
const protocol = process.env.IPFS_PROTOCOL;
const projectId = process.env.IPFS_PROJECT_ID;
const projectKey = process.env.IPFS_PROJECT_SECRET;
const credentials = `${projectId}:${projectKey}`;
const auth = "Basic " + Buffer.from(credentials).toString("base64");

const client = {
  host: host,
  port: port,
  protocol: protocol,
  headers: {
    authorization: auth,
  },
};

async function createIpfsClient() {
  try {
    console.log("Connecting to IPFS...");
    const ipfs = await create(client);
    // console.log(ipfs);
    const info = await ipfs.version();
    console.log("IPFS Node Ready || V" + info.version);
    return ipfs;
  } catch (err) {
    console.log(`err: ${err}$\n retrying...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await createIpfsClient();
  }
}

async function getAllPinsExcept(thisType) {
  const ipfs = await createIpfsClient();
  var remotePins = [];
  for await (const pin of ipfs.pin.ls())
    if (pin.type !== thisType) remotePins.push(pin.cid.toString());
  console.log("remotePins:", remotePins.length);
  return remotePins;
}

async function getAllPinsOfType(thisType) {
  const ipfs = await createIpfsClient();
  var remotePins = [];
  for await (const pin of ipfs.pin.ls())
    if (pin.type === thisType) remotePins.push(pin.cid.toString());
  console.log("remotePins:", remotePins.length);
  return remotePins;
}

async function getAllPins() {
  try {
    const ipfs = await createIpfsClient();
    var remotePins = [];
    for await (const pin of ipfs.pin.ls()) remotePins.push(pin.cid.toString());
    console.log("remotePins:", remotePins.length);
    return remotePins;
  } catch {
    getAllPins();
  }
}

async function addThenPin(buffer) {
  async function addToIPFS() {
    try {
      const ipfs = await createIpfsClient();
      const content = await ipfs.add({ content: buffer });
      return content;
    } catch {
      addToIPFS();
    }
  }
  const content = await addToIPFS();

  async function pinToIPFS() {
    try {
      const ipfs = await createIpfsClient();
      const pinnedCid = await ipfs.pin.add(content.path.toString());
      return pinnedCid;
    } catch {
      pinToIPFS();
    }
  }
  const pinnedCid = await pinToIPFS();

  return pinnedCid.toString();
}

async function rmPin(cid) {
  const ipfs = await createIpfsClient();
  const removed = await ipfs.pin.rm(cid);
  console.log("Removed Pin @ " + removed);
  return removed !== null && removed !== undefined;
}

async function rmPins(toRemove) {
  const ipfs = await createIpfsClient();
  var removed = [];
  var index = 0;
  for await (const cid of toRemove) {
    const rmd = await ipfs.pin.rm(cid);
    console.log(index + 1 + " || Removed Pin @ " + rmd);
    removed.push(rmd.toString());
    index++;
  }
  console.log("removedPins:", removed.length);
  return toRemove.length === removed.length;
}

async function createAndFetch(cid, pathTo) {
  const ipfs = await createIpfsClient();
  const fetch = await makeIpfsFetch({ ipfs });
  const fakeResponse = await fetch(`ipfs://${cid}`, { method: "GET" });
  for await (const itr of fakeResponse.body)
    fs.appendFileSync(pathTo, Buffer.from(itr));
}

module.exports = {
  client,
  createIpfsClient,

  getAllPins,
  getAllPinsExcept,
  getAllPinsOfType,

  addThenPin,
  rmPin,
  rmPins,

  createAndFetch,
};
