const fs = require('fs');
const cacheUtils = require('./cache.js');
const evm = require('../utils/evm.js');
const contract = evm.loadContract(31337, 'LobbyTracker');

async function playerActions(req, res, cache, cb) {
  const lobbyId = req.params.lobbyId;
  const address = req.body.player.address;
  let { players } = cache.data.metadata;
  const turn = cache.data.metadata.turn;

  // verify sender is player
  if (players.contains(address)) {
    const index = players.indexOf(address);

    // try to perform player action
    try {
      cache = cb(req, cache, index);
    } catch (e) {
      res.status(403).json(e);
      badCall = true;
      return;
    }

    if (cache.data.gameState.canEndRound()) {
      cache = endRound(cache); // manage wagers x pot
      try {
        cache.data.gameState.startRound();
      } catch (e) {
        // decide distribution
        let result = cache.data.gameState.checkResult();
        let winner = result.index;
        let increment = [];
        players.forEach((player, idx) => {
          const gain = winner == idx;
          increment.push(gain);
        });

        // distribute funds
        const deployer = await evm.deployer();
        const wagers = cache.data.metadata.wagers;
        await (
          await contract
            .connect(deployer)
            .disseminate(lobbyId, increment, wagers)
        ).wait(1);
        players.forEach((player, idx) => {
          cache.data.metadata.wagers[idx] = 0;
        });

        const lobbyId = cache.data.metadata.id;
        const lobbyState = await contract.lobby(lobbyId);
        const defaultData = cacheUtils.create(lobbyState, lobbyId);

        defaultData.metadata.lastAction = cache.data.metadata.lastAction;
        defaultData.metadata.ready.forEach(
          (readyState, idx) => (defaultData.ready[idx] = true)
        );

        cache.data = defaultData;
      }
    } else {
      const numPlayers = players.length;
      if (turn < numPlayers) cache.data.metadata.turn += 1;
    }

    cacheUtils.saveThenSend(req, res, cache);
  } else res.status(403).json({ notice: 'not player' });
}

// place initialBet
function bet(req, cache, index) {
  const actual = cache.data.gameState.bet(index);
  cache.data.metadata.pot[index] += actual;
  return cache;
}

function check(req, cache, index) {
  cache.data.gameState.check(index);
  return cache;
}

function raise(req, cache, index) {
  const amount = req.body.inputs.amount;
  const actual = cache.data.gameState.raise(index, amount);
  cache.data.metadata.pot[index] += actual;
  return cache;
}

function call(req, cache, index) {
  const actual = cache.data.gameState.call(index);
  cache.data.metadata.pot[index] = actual;

  return cache;
}

function fold(req, cache, index) {
  cache.data.gameState.fold(index);
  return cache;
}

function startRound(cache) {
  cache.data.gameState.startRound();

  return cache;
}

function endRound(cache) {
  cache.data.gameState.endRound();
  const pot = cache.data.metadata.pot;
  pot.forEach((wager, idx) => {
    cache.data.metadata.wagers[idx] += wager;
    cache.data.metadata.pot[idx] = 0;
  });
  cache.data.metadata.round += 1;
  cache.data.metadata.turn = 0;

  return cache;
}

// INTERNAL

// function autoFold() {}

async function handleTimeout(cache) {
  if (cache.metadata.active == true && cache.metadata.waiting == false) {
    const lastAction = cache.data.metadata.lastAction;
    const timestamp = new Date().getTime();
    const players = cache.data.metadata.players;
    const deployer = await evm.deployer();
    for await (const player of players) {
      const index = players.indexOf(player);

      if (timestamp - lastAction[index] > timeoutPeriod) {
        // purge();
        await (
          await contract.connect(deployer).ejectPlayer(lobbyId, address)
        ).wait(1);
      }
    }
  }
}

module.exports = {
  playerActions,
  bet,
  check,
  raise,
  call,
  fold,
  startRound,
  endRound,
};
