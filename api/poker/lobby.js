const cacheUtils = require('./cache.js');
const fs = require('fs');
const evm = require('../utils/evm.js');
const contract = evm.loadContract(31337, 'LobbyTracker');

function extract(req) {
  const lobbyId = req.params.lobbyId;
  const inputs = req.body.action.inputs;
  const address = req.body.player.address;
  return { lobbyId, inputs, address };
}

function create(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  if (cache.exists) {
    res.status(409).json({ notice: 'Match Exists' });
  } else {
    const data = cacheUtils.create(inputs, lobbyId);
    cache.data = data;
    cacheUtils.saveThenSend(req, res, cache);
  }
}

function join(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  let metadata = cache.data.metadata;
  if (!metadata.players.contains(address)) {
    // cache = updateMetadata(lobbyId);
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'already joined' });
}

function leave(req, res, cache) {
  const { lobbyId, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    // require(action.type === "leave");
    // await contract.connect(deployer).ejectPlayer(lobbyId, address);
    // cache = updateMetadata(lobbyId);
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

function readyUp(req, res, cache) {
  const { lobbyId, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    let readyState = metadata.ready[metadata.players.indexOf(address)];
    cache.data.metadata.ready[metadata.players.indexOf(address)] = !readyState;
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

function start(req, res, cache) {
  const { lobbyId, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.ready.contains(false))
    res.status(403).json({ notice: 'players not ready' });
  if (metadata.players.contains(address)) {
    metadata.waiting = false;
    metadata.active = true;
    const lastAction = new Date().getTime();
    let spentTurn = [];
    metadata.players.forEach((player) => {
      spentTurn.push(false);
    });
    metadata.lastAction = lastAction;
    metadata.spentTurn = spentTurn;

    cache.data.metadata = metadata;

    // await contract.connect(deployer).startGame(lobbyId);
    // cache = updateMetadata(lobbyId);

    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

// INTERNAL

function abort() {
  if ('frontend.isDown()') {
    const root = __dirname.slice(0, __dirname.indexOf('poker'));
    const pathToLobbies = `${root}/static/lobbies`;
    const lobbies = fs.readdirSync(pathToLobbies);
    // purge();
    // compare lobbies to activeLobbies

    lobbies.forEach((lobbyId) => async () => {
      // await contract.connect(deployer).abortGame(parseInt(lobbyId));
      fs.rmdirSync(`${pathToLobbies}/${lobbyId}`, { recursive: true });
    });
  }
}

function handleTimeout(cache) {
  if (cache.metadata.active == true && cache.metadata.waiting == false) {
    const lastAction = cache.data.metadata.lastAction;
    const timestamp = new Date().getTime();
    const players = cache.data.metadata.players;
    players.forEach((player) => {
      const index = players.indexOf(player);
      if (timestamp - lastAction > timeoutPeriod) {
        // purge();
        // await contract.connect(deployer).ejectPlayer(lobbyId, address)
      }
    });
  }
}

module.exports = {
  create,
  join,
  leave,
  readyUp,
  start,
  abort,
  handleTimeout,
};
