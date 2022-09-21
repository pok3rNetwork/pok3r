const { port, initApp } = require('./utils/setup.js');
const cacheUtils = require('./poker/cache.js');
const lobbyUtils = require('./poker/lobby.js');
const {
  playerActions,
  bet,
  check,
  raise,
  call,
  fold,
} = require('./poker/game.js');
const evm = require('./utils/evm.js');
const autoplay = require('./poker/autoplay.js');

const {
  // connectionTypes
  broadcaster,
  viewer,
  vodStream,
  compositeVideo,
  avLoopback,
  dataChannelBufferLimits,
  pitchDetector,
  pingPong,
  sineWaveBase,
  sineWaveStereo,
  // connectionUtil
  mount,
} = require('./utils/wrtc/server.js');

const app = initApp(__dirname);

let connectionManagers = [];
function mountConnection(typeOf, pathTo) {
  const connection = typeOf();
  mount(app, connection, pathTo);
  connectionManagers.push(connection);
}

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
      //
      // testing the game logic (off-chain)
      else if (action.type == 'auto') autoplay(req, res, cache);
      //
      // before the game
      else if (action.type == 'join')
        await lobbyUtils.joinGame(req, res, cache);
      else if (action.type == 'leave') await lobbyUtils.leave(req, res, cache);
      else if (action.type == 'readyUp')
        await lobbyUtils.readyUp(req, res, cache);
      else if (action.type == 'start') await lobbyUtils.start(req, res, cache);
      //
      // during the game
      else if (action.type == 'bet') await playerActions(req, res, cache, bet);
      else if (action.type == 'check')
        await playerActions(req, res, cache, check);
      else if (action.type == 'raise')
        await playerActions(req, res, cache, raise);
      else if (action.type == 'call')
        await playerActions(req, res, cache, call);
      else if (action.type == 'fold')
        await playerActions(req, res, cache, fold);
      //
      // catch
      else res.status(404).json({ notice: 'Route Not Configured' });
    }
  });

const server = app.listen(port, () => {
  console.log('Server Started on Port:' + port);
  server.once('close', () =>
    connectionManagers.forEach((connectionManager) => connectionManager.close())
  );
});
