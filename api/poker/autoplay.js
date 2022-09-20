const cacheUtils = require('./cache.js');
const game = require('./game.js');

function printTable(cache) {
  console.log('Table', cache.data.gameState.getState().communityCards);
}

function printMoney(cache) {
  const players = cache.data.gameState.players;
  console.log('player1', players[0].money);
  console.log('player2', players[1].money);
  console.log('pot', cache.data.gameState.pot);
}

function autoplay(req, res, cache) {
  let round = cache.data.metadata.round;

  if (round == 1) {
    cache.data.metadata.wagers = [0, 0];
    cache = game.startRound(cache);
    printTable(cache);
    console.log('\nround 1 - no cards dealt (ante up)');
    console.log(
      'Players',
      cache.data.gameState.getState().players.map(function (m) {
        return m.hand;
      })
    );

    cache = game.bet({}, cache, 0); // 20
    cache = game.raise({ body: { inputs: { amount: 20 } } }, cache, 1); // 60
    cache = game.call({}, cache, 0); // 80

    cache = game.endRound(cache);
    printMoney(cache);
  } else if (round == 2) {
    cache.data.gameState.startRound();
    console.log('\nround 2 - 3 cards dealt (flop)');
    printTable(cache);

    cache = game.check({}, cache, 0); // 0
    cache = game.check({}, cache, 1); // 0

    cache = game.endRound(cache);
    printMoney(cache);
  } else if (round == 3) {
    console.log('\nround 3 - 4 cards dealt');
    cache = game.startRound(cache);
    printTable(cache);

    cache = game.raise({ body: { inputs: { amount: 50 } } }, cache, 0); // 130
    cache = game.call({}, cache, 1); // 180

    cache = game.endRound(cache);
    printMoney(cache);
  } else if (round == 4) {
    console.log('\nround 4 - 5 cards dealt (river)');
    cache = game.startRound(cache);
    printTable(cache);

    cache = game.call({}, cache, 0); // 200
    cache = game.call({}, cache, 1); // 220

    cache = game.endRound(cache);
    printMoney(cache);
    console.log('\nend game');
    const result = cache.data.gameState.checkResult();
    if (result.type == 'win')
      console.log('Player' + (result.index + 1) + ' won with ' + result.name);
    else console.log('Draw');
    cache.data.metadata.round = 1;
    printMoney(cache);
  } else throw new Error("this shouldn't happen");

  cacheUtils.saveThenSend(req, res, cache);
}

module.exports = autoplay;
