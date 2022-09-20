const cacheUtils = require('./cache.js');

function autoplay(req, res, cache) {
  // console.log('Player Stats:');
  // console.log('Players', cache.data.gameState.getState().players);
  console.log(cache.data.gameState.players);

  console.log('\nRound 1');
  cache.data.gameState.startRound();
  cache.data.gameState.bet(0); //for player 1
  cache.data.gameState.raise(1, 20); //for player 2
  cache.data.gameState.call(0);
  cache.data.gameState.endRound();
  console.log('round', cache.data.gameState.round);
  console.log('pot', cache.data.gameState.pot);
  // console.log('Table', cache.data.gameState.getState().communityCards);
  // console.log('Players', cache.data.gameState.getState().players);

  // console.log('\nRound 2');
  cache.data.gameState.startRound();
  cache.data.gameState.raise(0, 50); //for player 1
  cache.data.gameState.call(1); //for player 2
  cache.data.gameState.endRound();
  console.log('round', cache.data.gameState.round);
  console.log('pot', cache.data.gameState.pot);
  // console.log('Table', cache.data.gameState.getState().communityCards);
  // console.log('Players', cache.data.gameState.getState().players);

  // console.log('\nRound 3');
  cache.data.gameState.startRound();
  cache.data.gameState.check(0); //for player 1
  cache.data.gameState.check(1); //for player 2
  cache.data.gameState.endRound();
  console.log('round', cache.data.gameState.round);
  console.log('pot', cache.data.gameState.pot);
  // console.log('Table', cache.data.gameState.getState().communityCards);
  // console.log('Players', cache.data.gameState.getState().players);

  //end game
  var result = cache.data.gameState.checkResult();
  if (result.type == 'win') {
    console.log('Player' + (result.index + 1) + ' won with ' + result.name);
    // console.log('Players', cache.data.gameState.getState().players);
  } else {
    console.log('Draw');
  }

  cacheUtils.saveThenSend(req, res, cache);
}

module.exports = autoplay;
