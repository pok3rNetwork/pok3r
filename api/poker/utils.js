function autoplay(game) {
  //round 1
  game.startRound();
  game.bet(0); //for player 1
  game.raise(1, 20); //for player 2
  game.call(0);
  game.endRound();
  console.log('Table', game.getState().communityCards);

  //round 2
  game.startRound();
  game.check(0); //for player 1
  game.check(1); //for player 2
  game.endRound();
  console.log('Table', game.getState().communityCards);

  //round 3
  game.startRound();
  game.raise(0, 50); //for player 1
  game.call(1); //for player 2
  game.endRound();
  console.log('Table', game.getState().communityCards);

  //end game
  var result = game.checkResult();
  if (result.type == 'win') {
    console.log('Player' + (result.index + 1) + ' won with ' + result.name);
  } else {
    console.log('Draw');
  }
}

module.exports = autoplay;
