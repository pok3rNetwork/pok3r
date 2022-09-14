const fs = require('fs');
const { Game, Deck } = require('holdem-poker');

const eth = 10 ** 18;
const gwei = 10 ** 9;

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

function routeGame(app) {
  app
    .route('/poker/:gameId')
    .get((req, res) => sendGame(req, res))
    .post(async (req, res) => {
      let gameState = metadata(req.params.gameId);
      const { action, player } = req.body;
      /*
       * data = {
       * action: {
       *   type: 'create/auto',
       *   inputs: {...}
       * },
       * player: {
       *   address:'0x...',
       *   signature: '1`2312sad...',
       *   message: 'adsad...'
       * }
       * }
       */

      if (action.type == 'create') {
        if (gameState.exists) {
          res.status(409).json({ notice: 'Match Exists' });
          return;
        } else {
          const { maxPlayers, minBet } = action.inputs;

          let lobby = [];
          for (let i = 0; i < maxPlayers; i++) lobby.push(1000);
          const game = new Game(lobby, minBet);

          saveThenSendGame(req, res, gameState.pathTo, game);
          return;
        }
      } else {
        if (!gameState.exists) {
          res.status(404).json(gameState.data);
          return;
        }
      }

      function reconstitute() {
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

      if (action.type == 'auto') {
        game = reconstitute();

        //round 1
        game.startRound();
        game.bet(0); //for player 1
        game.raise(1, 20); //for player 2
        game.call(0);
        game.endRound();
        console.log('Table', game.getState().communityCards);

        //round 2
        game.startRound();
        game.check(0); //for player 1
        game.check(1); //for player 2
        game.endRound();
        console.log('Table', game.getState().communityCards);

        //round 3
        game.startRound();
        game.raise(0, 50); //for player 1
        game.call(1); //for player 2
        game.endRound();
        console.log('Table', game.getState().communityCards);

        //end game
        var result = game.checkResult();
        if (result.type == 'win') {
          console.log(
            'Player' + (result.index + 1) + ' won with ' + result.name
          );
        } else {
          console.log('Draw');
        }

        saveThenSendGame(req, res, gameState.pathTo, game);
        return;
      }
    });
}

module.exports = { routeGame };
