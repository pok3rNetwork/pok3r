const cacheUtils = require('./cache.js');
const lobbyUtils = require('./lobby.js');
const evm = require('../utils/evm.js');
const autoplay = require('./autoplay.js');

/* @req.body
 * POST `/poker/${gameId}`
 *
 *  {
 *    "player": {
 *      "address":'0x...',
 *      "signature": '1`2312sad...',
 *      "message": 'adsad...'
 *    }
 *  }
 *
 *  {
 *    "action": {
 *    "type": "create"
 *    "inputs": {
 *        "maxPlayers": 2,
 *        "minBet": 1
 *    },
 *  }
 *
 *  {
 *    "action": {
 *      "type": "auto"
 *      "inputs": {},
 *    },
 *  }
 */

function routeGame(app) {
  app
    .route('/poker/:gameId')
    .get((req, res) => cacheUtils.send(req, res))
    .post(async (req, res) => {
      let cache = cacheUtils.retrieve(req.params.gameId);
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

      if (action.type == 'create') {
        lobbyUtils.create(req, res, cache);
        return;
      } else {
        if (!cache.exists) {
          res.status(404).json(cache.data);
          return;
        }
      }

      if (action.type == 'auto') {
        autoplay(cache.data.gameState);
        return;
      }
    });
}

module.exports = { routeGame };
