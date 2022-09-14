const fs = require('fs');
const { Game, Deck } = require('holdem-poker');

function createGame(config) {
  const { maxPlayers, minBet } = config;

  let lobby = [];
  for (let i = 0; i < maxPlayers; i++) lobby.push(1000);

  return new Game(lobby, minBet);
}

const metadata = (gameId) => {
  const root = __dirname.slice(0, __dirname.indexOf('poker'));
  const pathTo = `${root}/static/${gameId}.json`;
  const exists = fs.existsSync(pathTo);
  const data = exists
    ? JSON.parse(fs.readFileSync(pathTo))
    : { notice: 'Match Not Found' };
  return { pathTo, exists, data };
};

function sendGame(req, res) {
  const gameState = metadata(req.params.gameId);
  res.status(gameState.exists ? 200 : 404).json(gameState.data);
}

function saveThenSendGame(req, res, pathTo, data) {
  fs.writeFileSync(pathTo, JSON.stringify(data, null, 2));
  sendGame(req, res);
}

function reconstitute(gameState) {
  const data = gameState.data;

  let deck = new Deck();
  deck.cards = data.deck.cards;

  const game = new Game([1000, 1000], 1);
  game.pot = data.pot;
  game.players = data.players;
  game.deck = deck;
  game.table = data.table;
  game.round = data.round;
  game.initialBet = data.initialBet;

  return game;
}

module.exports = {
  createGame,
  metadata,
  sendGame,
  saveThenSendGame,
  reconstitute,
};
