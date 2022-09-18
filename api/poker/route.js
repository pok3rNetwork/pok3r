const cacheUtils = require('./cache.js');
const lobbyUtils = require('./lobby.js');
const evm = require('../utils/evm.js');
const autoplay = require('./autoplay.js');

function routeGame(app) {
  app
    .route('/poker/:lobbyId')
    .get((req, res) => cacheUtils.send(req, res))
    .post(async (req, res) => {
      let cache = cacheUtils.retrieve(req.params.lobbyId);
      const { action, player } = req.body;
      // const validSignature = await evm.verifySignature(
      //   player.message,
      //   player.signature,
      //   player.address
      // );
      // if (!validSignature) {
      //   res
      //   .status(403)
      //   .json({
      //       notice:
      //       `Invalid Signature: Failed to Check In. You will be ejected from the lobby/ game if you do not provide a valid signature within ${} seconds`
      //     });
      //   return;
      // }

      if (action.type == 'create') lobbyUtils.create(req, res, cache);
      else {
        if (!cache.exists) res.status(404).json(cache.data);
        else if (action.type == 'auto') autoplay(req, res, cache);
        else res.status(404).json({ notice: 'Route Not Configured' });
      }
    });
}

module.exports = { routeGame };
