const cacheUtils = require('./cache.js');

function autoplay(req, res, cache) {
  let game = cache.data.gameState;
  console.log('\nround 1 - no cards dealt (ante up)');
  console.log(
    'Players',
    game.getState().players.map(function (m) {
      return m.hand;
    })
  );
  console.log('Table', game.getState().communityCards);
  game.startRound();
  game.bet(0); //for player 1
  game.raise(1, 20); //for player 2
  game.call(0);
  game.endRound();

  console.log('\nround 2 - 3 cards dealt (flop)');
  console.log('Table', game.getState().communityCards);
  game.startRound();
  game.check(0); //for player 1
  game.check(1); //for player 2
  game.endRound();

  console.log('\nround 3 - 4 cards dealt');
  console.log('Table', game.getState().communityCards);
  game.startRound();
  game.raise(0, 50); //for player 1
  game.call(1); //for player 2
  game.endRound();

  console.log('\nround 4 - 5 cards dealt (river)');
  console.log('Table', game.getState().communityCards);
  game.startRound();
  game.call(0); //for player 1
  game.call(1); //for player 2
  game.endRound();

  console.log('\nend game');
  const result = cache.data.gameState.checkResult();
  if (result.type == 'win')
    console.log('Player' + (result.index + 1) + ' won with ' + result.name);
  else console.log('Draw');

  cache.data.gameState = game;
  cacheUtils.saveThenSend(req, res, cache);
}

module.exports = autoplay;
