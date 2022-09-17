const {
  createGame,
  metadata,
  sendGame,
  saveThenSendGame,
  reconstitute,
} = require('./state.js');
const autoplay = require('./utils.js');

function routeGame(app) {
  app
    .route('/poker/:gameId')
    .get((req, res) => sendGame(req, res))
    .post(async (req, res) => {
      let gameState = metadata(req.params.gameId);
      const { action, player } = req.body;
      /*
       * {
       *   action: {
       *     type: 'create/auto',
       *     inputs: {...}
       *   },
       *   player: {
       *     address:'0x...',
       *     signature: '1`2312sad...',
       *     message: 'adsad...'
       *   }
       * }
       */

      if (action.type == 'create') {
        if (gameState.exists) {
          res.status(409).json({ notice: 'Match Exists' });
          return;
        } else {
          const game = createGame(action.inputs);

          saveThenSendGame(req, res, gameState.pathTo, game);
          return;
        }
      } else {
        if (!gameState.exists) {
          res.status(404).json(gameState.data);
          return;
        }
      }

      if (action.type == 'auto') {
        game = reconstitute(gameState);
        autoplay(game);
        saveThenSendGame(req, res, gameState.pathTo, game);
        return;
      }
    });
}

module.exports = { routeGame };
