const fs = require('fs');
const { Game, Deck } = require('holdem-poker');
const evm = require('../utils/evm.js');

function create(inputs, lobbyId) {
  // check evm to verify lobby creation

  const { maxPlayers, minBet } = inputs;
  // const mtd = inputs.metadata;
  let lobby = [];
  for (let i = 0; i < maxPlayers; i++) lobby.push(1000);
  let gameState = new Game(lobby, minBet);

  let metadata = {
    lobbyId,
    waiting: true,
    active: false,
    players: [
      // mtd.players
    ],
    deposits: [
      // mtd.deposit
    ],
    minBet: null /*mtd.minBet*/,
    maxPlayers: null /*mtd.maxPlayers*/,
    lastAction: [],
  };
  // use evm utils

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

// conditionally limit scope here
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

module.exports = {
  create,
  retrieve,
  send,
  saveThenSend,
  reconstitute,
};
