const fs = require('fs');
const evm = require('../utils/evm.js');

function checkResult(lobbyId) {
  const root = __dirname.slice(0, __dirname.indexOf('poker'));
  const pathToLobbies = `${root}/static/lobbies`;
  const lobbies = fs.readdirSync(pathToLobbies);
  // clean up if lobby is closed
  // fs.rmdirSync(`${pathToLobbies}/${lobbyId}`, { recursive: true });
}

function endRound(lobbyId) {
  // require(action.type === "bet");
  // if last player
  // await contract.connect(deployer).disseminate(lobbyId, increment, amounts)
  // if last round
  // checkResult(lobbyId);
}

function extract(req) {
  const lobbyId = req.params.lobbyId;
  const inputs = req.body.inputs;
  const address = req.body.player.address;
  return { lobbyId, inputs, address };
}

function bet(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // require(action.type === "bet");
  // endRound(lobbyId);
  res.status(200).json('ok');
}

function check(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // require(action.type === "check");
  // endRound(lobbyId);
  res.status(200).json('ok');
}

function raise(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // require(action.type === "raise");
  // endRound(lobbyId);
  res.status(200).json('ok');
}

function call(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // require(action.type === "call");
  // endRound(lobbyId);
  res.status(200).json('ok');
}

function fold(req, res, cache) {
  const { lobbyId, inputs, address } = extract(req);
  // require(action.type === "fold");
  // endRound(lobbyId);
  res.status(200).json('ok');
}

module.exports = { bet, check, raise, call, fold };