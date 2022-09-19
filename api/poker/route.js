const cacheUtils = require('./cache.js');
const lobbyUtils = require('./lobby.js');
const gameUtils = require('./game.js');
const evm = require('../utils/evm.js');
const autoplay = require('./autoplay.js');

function poker(app) {
  app
    .route('/poker/:lobbyId')
    .get((req, res) => cacheUtils.send(req, res))
    .post(async (req, res) => {
      let cache = cacheUtils.retrieve(req.params.lobbyId);
      const { action, player } = req.body;
      const validSignature = await evm.verifySignature(
        player.message,
        player.signature,
        player.address
      );

      if (!validSignature) {
        res.status(403).json({
          notice: `Invalid Signature: Failed to Verify Signature.`,
        });
        return;
      }

      if (action.type == 'create') await lobbyUtils.create(req, res, cache);
      else {
        // catch
        if (!cache.exists) res.status(404).json(cache.data);
        // testing the game logic (off-chain)
        else if (action.type == 'auto') autoplay(req, res, cache);
        // before the game
        else if (action.type == 'join')
          await lobbyUtils.joinGame(req, res, cache);
        else if (action.type == 'leave')
          await lobbyUtils.leave(req, res, cache);
        else if (action.type == 'readyUp')
          await lobbyUtils.readyUp(req, res, cache);
        else if (action.type == 'start')
          await lobbyUtils.start(req, res, cache);
        // during the game
        else if (action.type == 'bet') await gameUtils.bet(req, res, cache);
        else if (action.type == 'check') await gameUtils.check(req, res, cache);
        else if (action.type == 'raise') await gameUtils.raise(req, res, cache);
        else if (action.type == 'call') await gameUtils.call(req, res, cache);
        else if (action.type == 'fold') await gameUtils.fold(req, res, cache);
        // catch
        else res.status(404).json({ notice: 'Route Not Configured' });
      }
    });
}

module.exports = poker;
