
var Pot = function() {

  this.pots = [
    { 
      amount: 0,
      contributors: []
    }
  ];
};


Pot.prototype.reset = function() {
  this.pots.length = 1;
  this.pots[0].amount = 0;
  this.pots[0].contributors = [];
};

/**
 * @param array players (the array of the tables as it exists in the table)
 */
Pot.prototype.addTableBets = function( players ) {
  // Add new bets 
  var currentPot = this.pots.length-1;

  var smallestBet = 0;
  var allBetsAreEqual = true;
  for( var i in players ) {
    if( players[i] && players[i].public.bet ) {
      if( !smallestBet ) {
        smallestBet = players[i].public.bet;
      }
      else if( players[i].public.bet != smallestBet ) {
        allBetsAreEqual = false;
        
        if( players[i].public.bet < smallestBet ) {
          smallestBet = players[i].public.bet;
        }
      }
    }
  }


  if( allBetsAreEqual ) {
    for( var i in players ) {
      if( players[i] && players[i].public.bet ) {
        this.pots[currentPot].amount += players[i].public.bet;
        players[i].public.bet = 0;
        if( this.pots[currentPot].contributors.indexOf( players[i].seat ) < 0 ) {
          this.pots[currentPot].contributors.push( players[i].seat );
        }
      }
    }
  } else {

    for( var i in players ) {
      if( players[i] && players[i].public.bet ) {
        this.pots[currentPot].amount += smallestBet;
        players[i].public.bet = players[i].public.bet - smallestBet;
        if( this.pots[currentPot].contributors.indexOf( players[i].seat ) < 0 ) {
          this.pots[currentPot].contributors.push( players[i].seat );
        }
      }
    }

    // New pot
    this.pots.push(
      { 
        amount: 0,
        contributors: []
      }
    );

    // Recursion
    this.addTableBets( players );
  }
}

/**
 * Add bet 
 * @param {[type]} player [description]
 */
Pot.prototype.addPlayersBets = function( player ) {
  var currentPot = this.pots.length-1;

  this.pots[currentPot].amount += player.public.bet;
  player.public.bet = 0;
  if( !this.pots[currentPot].contributors.indexOf( player.seat ) ) {
    this.pots[currentPot].contributors.push( player.seat );
  }
}

Pot.prototype.destributeToWinners = function( players, firstPlayerToAct ) {
  var potsCount = this.pots.length;
  var messages = [];

  for( var i=potsCount-1 ; i>=0 ; i-- ) {
    var winners = [];
    var bestRating = 0;
    var playersCount = players.length;
    for( var j=0 ; j<playersCount ; j++ ) {
      if( players[j] && players[j].public.inHand && this.pots[i].contributors.indexOf( players[j].seat ) >= 0 ) {
        if( players[j].evaluatedHand.rating > bestRating ) {
          bestRating = players[j].evaluatedHand.rating;
          winners = [ players[j].seat ];
        }
        else if( players[j].evaluatedHand.rating === bestRating ) {
          winners.push( players[j].seat );
        }
      }
    }
    if( winners.length === 1 ) {
      players[winners[0]].public.chipsInPlay += this.pots[i].amount;
      var htmlHand = '[' + players[winners[0]].evaluatedHand.cards.join(', ') + ']';
      htmlHand = htmlHand.replace(/s/g, '&#9824;').replace(/c/g, '&#9827;').replace(/h/g, '&#9829;').replace(/d/g, '&#9830;');
      messages.push( players[winners[0]].public.name + ' wins the pot (' + this.pots[i].amount + ') with ' + players[winners[0]].evaluatedHand.name + ' ' + htmlHand );
    } else {
      var winnersCount = winners.length;

      var winnings = ~~( this.pots[i].amount / winnersCount );
      var oddChip = winnings * winnersCount !== this.pots[i].amount;

      for( var j in winners ) {
        var playersWinnings = 0;
        if( oddChip && players[winners[j]].seat === firstPlayerToAct ) {
          playersWinnings = winnings + 1;
        } else {
          playersWinnings = winnings;
        }

        players[winners[j]].public.chipsInPlay += playersWinnings;
        var htmlHand = '[' + players[winners[j]].evaluatedHand.cards.join(', ') + ']';
        htmlHand = htmlHand.replace(/s/g, '&#9824;').replace(/c/g, '&#9827;').replace(/h/g, '&#9829;').replace(/d/g, '&#9830;');
        messages.push( players[winners[j]].public.name + ' ties the pot (' + playersWinnings + ') with ' + players[winners[j]].evaluatedHand.name + ' ' + htmlHand );
      }
    }
  }

  this.reset();

  return messages;
}

/**
 * @param object  winner
 */
Pot.prototype.giveToWinner = function( winner ) {
  var potsCount = this.pots.length;
  var totalAmount = 0;

  for( var i=potsCount-1 ; i>=0 ; i-- ) {
    winner.public.chipsInPlay += this.pots[i].amount;
    totalAmount += this.pots[i].amount;
  }

  this.reset();
  return winner.public.name + ' wins the pot (' + totalAmount + ')';
}

/**
 * @param  number   seat
 */
Pot.prototype.removePlayer = function( seat ) {
  var potsCount = this.pots.length;
  for( var i=0 ; i<potsCount ; i++ ) {
    var placeInArray = this.pots[i].contributors.indexOf( seat );
    if( placeInArray >= 0 ) {
      this.pots[i].contributors.splice( placeInArray, 1 );
    }
  }
}

Pot.prototype.isEmpty = function() {
  return !this.pots[0].amount;
}


module.exports = Pot;