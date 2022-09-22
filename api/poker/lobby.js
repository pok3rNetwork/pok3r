const cacheUtils = require('./cache.js');
const fs = require('fs');
const evm = require('../utils/evm.js');
const { contract, lobbyState } = require('./contract.js');

function extract(req) {
  const lobbyId = req.params.lobbyId;
  const inputs = req.body.action.inputs;
  const address = req.body.player.address;
  return { lobbyId, inputs, address };
}

async function updateMetadata(req, res, cache) {
  const { lobbyId } = extract(req);
  const state = await lobbyState(lobbyId);
  const fresh = state.waiting == true && state.active == false;
  if (fresh == false) res.status(409).json({ notice: 'stale match' });
  else {
    cache.data = cacheUtils.create(state, lobbyId);
    cacheUtils.saveThenSend(req, res, cache);
  }
}

async function create(req, res, cache) {
  if (cache.exists) {
    res.status(409).json({ notice: 'match exists' });
  } else {
    await updateMetadata(req, res, cache);
  }
}

async function joinGame(req, res, cache) {
  const { address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address))
    res.status(403).json({ notice: 'already joined' });
  else await updateMetadata(req, res, cache);
}

async function leave(req, res, cache) {
  const { address } = extract(req);
  let metadata = cache.data.metadata;
  if (!metadata.players.contains(address))
    res.status(403).json({ notice: 'not player' });
  else await updateMetadata(req, res, cache);
}

async function readyUp(req, res, cache) {
  const { address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    let readyState = metadata.ready[metadata.players.indexOf(address)];
    cache.data.metadata.ready[metadata.players.indexOf(address)] = !readyState;
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

async function start(req, res, cache) {
  const { lobbyId, address } = extract(req);

  let metadata = cache.data.metadata;
  let fresh = metadata.waiting == true && metadata.active == false;
  if (metadata.ready.contains(false))
    res.status(403).json({ notice: 'players not ready' });
  else if (metadata.players.length < 2)
    res.status(403).json({ notice: 'not enough players' });
  else if (!metadata.players.contains(address))
    res.status(403).json({ notice: 'not player' });
  else if (fresh == false) res.status(409).json({ notice: 'stale match' });
  else {
    let state = await lobbyState(lobbyId);
    fresh = state.waiting == true && state.active == false;
    if (fresh == false) res.status(409).json({ notice: 'stale match' });
    else {
      const deployer = await evm.deployer();
      await (await contract.connect(deployer).startGame(lobbyId)).wait(1);
      state = await lobbyState(lobbyId);

      data = cacheUtils.create(state, lobbyId);
      let lastAction = [];
      const timestamp = new Date().getTime();
      data.metadata.lastAction.forEach(() => {
        lastAction.push(timestamp);
      });
      data.metadata.lastAction = timestamp;
      data.metadata.ready = cache.data.metadata.ready;
      data.metadata.round = 1;
      cache.data = data;

      cache.data.gameState.startRound();

      cacheUtils.saveThenSend(req, res, cache);
    }
  }
}

module.exports = {
  create,
  joinGame,
  leave,
  readyUp,
  start,
};
