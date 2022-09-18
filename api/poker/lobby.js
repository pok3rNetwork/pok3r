const cacheUtils = require('./cache.js');
const fs = require('fs');

function extract(req) {
  const lobbyId = req.params.lobbyId;
  const inputs = req.body.action.inputs;
  console.log(req.body);
  const address = req.body.player.address;
  return { lobbyId, inputs, address };
}

function create(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  if (cache.exists) {
    res.status(409).json({ notice: 'Match Exists' });
  } else {
    const data = cacheUtils.create(inputs, lobbyId);
    cache.data = data;
    cacheUtils.saveThenSend(req, res, cache);
  }
}

function join(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // joinGame
  res.status(200).json('ok');
}

function leave(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // require(action.type === "leave");
  // await contract.connect(deployer).ejectPlayer(lobbyId, address)
  res.status(200).json('ok');
}

function readyUp(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // require(action.type === 'ready');
  res.status(200).json('ok');
}

function start(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // await contract.connect(deployer).startGame(lobbyId)
  res.status(200).json('ok');
}

function abort() {
  const root = __dirname.slice(0, __dirname.indexOf('poker'));
  const pathToLobbies = `${root}/static/lobbies`;
  const lobbies = fs.readdirSync(pathToLobbies);
  // compare lobbies to activeLobbies
  if ('frontend.isDown()')
    lobbies.forEach((lobbyId) => async () => {
      // await contract.connect(deployer).abortGame(parseInt(lobbyId));
      // fs.rmdirSync(`${pathToLobbies}/${lobbyId}`, { recursive: true });
    });
}

function handleTimeout() {
  // ejectPlayer(lobbyId, address)
  // abortGame if frontend does not respond
}

module.exports = {
  create,
  join,
  leave,
  readyUp,
  start,
  abort,
  handleTimeout,
};
