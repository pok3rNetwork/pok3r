const cacheUtils = require('./cache.js');

function create(req, res, cache) {
  // require(action.type === "create");
  if (cache.exists) {
    res.status(409).json({ notice: 'Match Exists' });
  } else {
    const data = cacheUtils.create(req.body.action.inputs);
    cache.data = data;
    cacheUtils.saveThenSend(req, res, cache);
  }
}

function leave() {
  // require(action.type === "leave");
  // ejectPlayer(lobbyId, address)
}
function start() {
  // require(action.type === "bet");
  // startGame(lobbyId)
}
function abort() {
  // abortGame(lobbyId)
}

function handleTimeout() {
  // ejectPlayer(lobbyId, address)
  // abortGame if frontend does not respond
}

module.exports = {
  create,
  leave,
  start,
  abort,
  handleTimeout,
};
