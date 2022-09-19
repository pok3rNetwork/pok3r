const evm = require('../utils/evm.js');

const contract = () => evm.loadContract(31337, 'LobbyTracker');
// const accounts = await evm.signers();

function toNumbers(bigNumbers) {
  let numbers = [];
  bigNumbers.forEach((bigNum) => numbers.push(bigNum.toNumber()));
  return numbers;
}

const lobbyState = async (id) => {
  const raw = await contract().lobby(id);

  const state = {
    waiting: raw[0],
    active: raw[1],
    players: raw[2],
    deposits: toNumbers(raw[3]),
    minBet: raw[4].toNumber(),
    maxPlayers: raw[5].toNumber(),
  };

  return state;
};

module.exports = { contract, lobbyState };
