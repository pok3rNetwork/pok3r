const fs = require('fs');
const { Game, Deck } = require('./holdem.js');
const evm = require('../utils/evm.js');
const { contract, lobbyState } = require('./contract.js');

function create(state, lobbyId) {
  const { minBet, deposits } = state;
  let lobby = deposits.length < 2 ? [1000, 1000] : deposits;
  let gameState = new Game(lobby, minBet);

  let ready = [];
  let lastAction = [];
  let wagers = [];
  let pot = [];
  state.players.forEach(() => {
    ready.push(false);
    lastAction.push(null);
    wagers.push(0);
    pot.push(0);
  });

  let metadata = {
    lobbyId,
    waiting: state.waiting,
    active: state.active,
    players: state.players,
    deposits,
    minBet,
    maxPlayers: state.maxPlayers,
    lastAction,
    ready,
    round: 1,
    turn: 0,
    wagers,
    pot,
  };

  return { gameState, metadata };
}

const files = (folder) => {
  const gameState = `${folder}/gameState.json`;
  const metadata = `${folder}/metadata.json`;
  return { gameState, metadata };
};

function reconstitute(gameState) {
  let deck = new Deck();
  deck.cards = gameState.deck.cards;

  let functionalObject = new Game([1, 1], 1);
  functionalObject.pot = gameState.pot;
  functionalObject.players = gameState.players;
  functionalObject.deck = deck;
  functionalObject.table = gameState.table;
  functionalObject.round = gameState.round;
  functionalObject.initialBet = gameState.initialBet;

  return functionalObject;
}

const retrieve = (lobbyId) => {
  const root = __dirname.slice(0, __dirname.indexOf('poker'));
  const folder = `${root}/static/lobbies/${lobbyId}`;
  const pathTo = files(folder);
  const exists = fs.existsSync(pathTo.gameState);
  let data;
  if (exists) {
    const gameState = reconstitute(
      JSON.parse(fs.readFileSync(pathTo.gameState))
    );
    const metadata = JSON.parse(fs.readFileSync(pathTo.metadata));
    data = { gameState, metadata };
  } else data = { notice: 'Match Not Found' };
  return { folder, exists, data };
};

// @ctnava todo - conditionally limit scope here
function send(req, res) {
  let cache = retrieve(req.params.lobbyId);
  res.status(cache.exists ? 200 : 404).json(cache.data);
}

function saveThenSend(req, res, cache) {
  if (!fs.existsSync(cache.folder)) fs.mkdirSync(cache.folder);
  const pathTo = files(cache.folder);
  fs.writeFileSync(
    pathTo.gameState,
    JSON.stringify(cache.data.gameState, null, 2)
  );
  fs.writeFileSync(
    pathTo.metadata,
    JSON.stringify(cache.data.metadata, null, 2)
  );

  send(req, res);
}

async function purge() {
  const root = __dirname.slice(0, __dirname.indexOf('poker'));
  const pathToLobbies = `${root}/static/lobbies`;
  const oldLobbies = await contract.oldLobbies();
  if (oldLobbies.length > 0)
    oldLobbies.forEach((lobby) =>
      fs.rmdirSync(`${pathToLobbies}/${lobby}`, { recursive: true })
    );
}

// INTERNAL
// @ctnava todo - monitor frontend
async function abortAll() {
  if ('frontend.isDown()') {
    const deployer = await evm.deployer();
    const root = __dirname.slice(0, __dirname.indexOf('poker'));
    const pathToLobbies = `${root}/static/lobbies`;
    const lobbies = fs.readdirSync(pathToLobbies);

    // compare lobbies to activeLobbies

    lobbies.forEach((lobbyId) => async () => {
      await (
        await contract.connect(deployer).abortGame(parseInt(lobbyId))
      ).wait(1);
      fs.rmdirSync(`${pathToLobbies}/${lobbyId}`, { recursive: true });
    });

    await purge();
  }
}

module.exports = {
  create,
  retrieve,
  send,
  saveThenSend,
  reconstitute,
  purge,
  abortAll,
};
