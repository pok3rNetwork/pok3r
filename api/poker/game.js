const fs = require('fs');
const evm = require('../utils/evm.js');
const contract = evm.loadContract(31337, 'LobbyTracker');

function endRound(lobbyId, cache) {
  let { gameState, metadata } = cache.data;
  let result;
  let playerState = gameState.getState().players;
  if ('last player') {
    result = cache.data.gameState.checkResult();
    // update metadata (distribution funds)
  }
  if (metadata.round >= 3) {
    let increment = [];
    let amounts = [];
    const players = metadata.players;
    players.forEach((player) => {
      const index = players.indexOf(player);
      increment.push(result.index == index);
      // amounts.push(wagers);
    });
    // await contract.connect(deployer).disseminate(lobbyId, increment, amounts)
    // const root = __dirname.slice(0, __dirname.indexOf('poker'));
    // const pathToLobbies = `${root}/static/lobbies`;
    // const lobbies = fs.readdirSync(pathToLobbies);
    // let activePlayers; // = await contract.activePlayers(lobbyId);
    // if (activePlayers == 0)
    //   fs.rmdirSync(`${pathToLobbies}/${lobbyId}`, { recursive: true });
  }
  return cache;
}

function extract(req) {
  const lobbyId = req.params.lobbyId;
  const inputs = req.body.inputs;
  const address = req.body.player.address;
  return { lobbyId, inputs, address };
}

function bet(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    //
    cache = endRound(cache);
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

function check(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    //
    cache = endRound(cache);
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

function raise(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    //
    cache = endRound(cache);
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

function call(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    //
    cache = endRound(cache);
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

function fold(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  let metadata = cache.data.metadata;
  if (metadata.players.contains(address)) {
    //
    cache = endRound(cache);
    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

// function autoFold() {}

module.exports = { bet, check, raise, call, fold };
