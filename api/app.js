const { port, initApp } = require('./utils/setup.js');
const poker = require('./poker/route.js');
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

const server = app.listen(port, () => {
  console.log('Server Started on Port:' + port);
  server.once('close', () =>
    connectionManagers.forEach((connectionManager) => connectionManager.close())
  );
});

poker(app, __dirname);
