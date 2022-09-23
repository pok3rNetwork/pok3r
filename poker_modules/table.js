var Deck = require('./deck'),
	Pot = require('./pot');

/**
 * The table "class"
 * @param string	id (the table id)
 * @param string	name (the name of the table)
 * @param object 	deck (the deck object that the table will use)
 * @param function 	eventEmitter (function that emits the events to the players of the room)
 * @param int 		seatsCount (the total number of players that can play on the table)
 * @param int 		bigBlind (the current big blind)
 * @param int 		smallBlind (the current smallBlind)
 * @param int 		maxBuyIn (the maximum amount of chips that one can bring to the table)
 * @param int 		minBuyIn (the minimum amount of chips that one can bring to the table)
 * @param bool 		privateTable (flag that shows whether the table will be shown in the lobby)
 */
var Table = function( id, name, eventEmitter, seatsCount, bigBlind, smallBlind, maxBuyIn, minBuyIn, privateTable ) {
	this.privateTable = privateTable;
	this.playersSittingInCount = 0;
	this.playersInHandCount = 0;
	this.lastPlayerToAct = null;
	this.gameIsOn = false;
	this.headsUp = false;
	this.seats = [];
	this.deck = new Deck;
	this.eventEmitter = eventEmitter;
	this.pot = new Pot;
	this.public = {
		id: id,
		name: name,
		seatsCount: seatsCount,
		playersSeatedCount: 0,
		bigBlind: bigBlind,
		smallBlind: smallBlind,
		minBuyIn: minBuyIn,
		maxBuyIn: maxBuyIn,
		pot: this.pot.pots,
		biggestBet: 0,
		dealerSeat: null,
		activeSeat: null,
		seats: [],
		phase: null,
		board: ['', '', '', '', ''],
		log: {
			message: '',
			seat: '',
			action: ''
		},
	};
	for( var i=0 ; i<this.public.seatsCount ; i++ ) {
		this.seats[i] = null;
	}
};

Table.prototype.emitEvent = function( eventName, eventData ){
	this.eventEmitter( eventName, eventData );
	this.log({
		message: '',
		action: '',
		seat: '',
		notification: ''
	});
};

/**
 * @param  number offset (the seat where search begins)
 * @param  string|array status (the status of the player who should be found)
 * @return number|null
 */
Table.prototype.findNextPlayer = function( offset, status ) {
	offset = typeof offset !== 'undefined' ? offset : this.public.activeSeat;
	status = typeof status !== 'undefined' ? status : 'inHand';

	if( status instanceof Array ) {
		var statusLength = status.length;
		if( offset !== this.public.seatsCount ) {
			for( var i=offset+1 ; i<this.public.seatsCount ; i++ ) {
				if( this.seats[i] !== null ) {
					var validStatus = true;
					for( var j=0 ; j<statusLength ; j++ ) {
						validStatus &= !!this.seats[i].public[status[j]];
					}
					if( validStatus ) {
						return i;
					}
				}
			}
		}
		for( var i=0 ; i<=offset ; i++ ) {
			if( this.seats[i] !== null ) {
				var validStatus = true;
				for( var j=0 ; j<statusLength ; j++ ) {
					validStatus &= !!this.seats[i].public[status[j]];
				}
				if( validStatus ) {
					return i;
				}
			}
		}
	} else {
		if( offset !== this.public.seatsCount ) {
			for( var i=offset+1 ; i<this.public.seatsCount ; i++ ) {
				if( this.seats[i] !== null && this.seats[i].public[status] ) {
					return i;
				}
			}
		}
		for( var i=0 ; i<=offset ; i++ ) {
			if( this.seats[i] !== null && this.seats[i].public[status] ) {
				return i;
			}
		}
	}

	return null;
};

/**
 * @param  number offset (the seat where search begins)
 * @param  string|array status (the status of the player who should be found)
 * @return number|null
 */
Table.prototype.findPreviousPlayer = function( offset, status ) {
	offset = typeof offset !== 'undefined' ? offset : this.public.activeSeat;
	status = typeof status !== 'undefined' ? status : 'inHand';

	if( status instanceof Array ) {
		var statusLength = status.length;
		if( offset !== 0 ) {
			for( var i=offset-1 ; i>=0 ; i-- ) {
				if( this.seats[i] !== null ) {
					var validStatus = true;
					for( var j=0 ; j<statusLength ; j++ ) {
						validStatus &= !!this.seats[i].public[status[j]];
					}
					if( validStatus ) {
						return i;
					}
				}
			}
		}
		for( var i=this.public.seatsCount-1 ; i>=offset ; i-- ) {
			if( this.seats[i] !== null ) {
				var validStatus = true;
				for( var j=0 ; j<statusLength ; j++ ) {
					validStatus &= !!this.seats[i].public[status[j]];
				}
				if( validStatus ) {
					return i;
				}
			}
		}
	} else {
		if( offset !== 0 ) {
			for( var i=offset-1 ; i>=0 ; i-- ) {
				if( this.seats[i] !== null && this.seats[i].public[status] ) {
					return i;
				}
			}
		}
		for( var i=this.public.seatsCount-1 ; i>=offset ; i-- ) {
			if( this.seats[i] !== null && this.seats[i].public[status] ) {
				return i;
			}
		}
	}

	return null;
};

// Start pok3r game
Table.prototype.initializeRound = function( changeDealer ) {
	changeDealer = typeof changeDealer == 'undefined' ? true : changeDealer ;

	if( this.playersSittingInCount > 1 ) {
		this.gameIsOn = true;
		this.public.board = ['', '', '', '', ''];
		this.deck.shuffle();
		this.headsUp = this.playersSittingInCount === 2;
		this.playersInHandCount = 0;

		for( var i=0 ; i<this.public.seatsCount ; i++ ) {
			if( this.seats[i] !== null && this.seats[i].public.sittingIn ) {
				if( !this.seats[i].public.chipsInPlay ) {
					this.seats[seat].sitOut();
					this.playersSittingInCount--;
				} else {
					this.playersInHandCount++;
					this.seats[i].prepareForNewRound();
				}
			}
		}

		if( this.public.dealerSeat === null ) {
			var randomDealerSeat = Math.ceil( Math.random() * this.playersSittingInCount );
			var playerCounter = 0;
			var i = -1;

			// VRF random - assign justice
			while( playerCounter !== randomDealerSeat && i < this.public.seatsCount ) {
				i++;
				if( this.seats[i] !== null && this.seats[i].public.sittingIn ) {
					playerCounter++;
				}
			}
			this.public.dealerSeat = i;
		} else if( changeDealer || this.seats[this.public.dealerSeat].public.sittingIn === false ) {
	
			this.public.dealerSeat = this.findNextPlayer( this.public.dealerSeat );
		}

		this.initializeSmallBlind();
	}
};

// SB == Set the table phase to 'smallBlind'
Table.prototype.initializeSmallBlind = function() {
	this.public.phase = 'smallBlind';

	if( this.headsUp ) {
		this.public.activeSeat = this.public.dealerSeat;
	} else {
		this.public.activeSeat = this.findNextPlayer( this.public.dealerSeat );
	}
	this.lastPlayerToAct = 10;

	this.seats[this.public.activeSeat].socket.emit('postSmallBlind');
	this.emitEvent( 'table-data', this.public );
};

// BB == Set the table phase to 'bigBlind'
Table.prototype.initializeBigBlind = function() {
	this.public.phase = 'bigBlind';
	this.actionToNextPlayer();
};

/**
 */
Table.prototype.initializePreflop = function() {
	this.public.phase = 'preflop';
	var currentPlayer = this.public.activeSeat;
	this.lastPlayerToAct = this.public.activeSeat;

	for( var i=0 ; i<this.playersInHandCount ; i++ ) {
		this.seats[currentPlayer].cards = this.deck.deal( 2 );
		this.seats[currentPlayer].public.hasCards = true;
		this.seats[currentPlayer].socket.emit( 'dealingCards', this.seats[currentPlayer].cards );
		currentPlayer = this.findNextPlayer( currentPlayer );
	}

	this.actionToNextPlayer();
};


Table.prototype.initializeNextPhase = function() {
	switch( this.public.phase ) {
		case 'preflop':
			this.public.phase = 'flop';
			this.public.board = this.deck.deal( 3 ).concat( ['', ''] );
			break;
		case 'flop':
			this.public.phase = 'turn';
			this.public.board[3] = this.deck.deal( 1 )[0];
			break;
		case 'turn':
			this.public.phase = 'river';
			this.public.board[4] = this.deck.deal( 1 )[0];
			break;
	}

	this.pot.addTableBets( this.seats );
	this.public.biggestBet = 0;
	this.public.activeSeat = this.findNextPlayer( this.public.dealerSeat );
	this.lastPlayerToAct = this.findPreviousPlayer( this.public.activeSeat );
	this.emitEvent( 'table-data', this.public );

	if( this.otherPlayersAreAllIn() ) {
		var that = this;
		setTimeout( function(){
			that.endPhase();
		}, 1000 );
	} else {
		this.seats[this.public.activeSeat].socket.emit('actNotBettedPot');
	}
};

/**
 */
Table.prototype.actionToNextPlayer = function() {
	this.public.activeSeat = this.findNextPlayer( this.public.activeSeat, ['chipsInPlay', 'inHand'] );

	switch( this.public.phase ) {
		case 'smallBlind':
			this.seats[this.public.activeSeat].socket.emit( 'postSmallBlind' );
			break;
		case 'bigBlind':
			this.seats[this.public.activeSeat].socket.emit( 'postBigBlind' );
			break;
		case 'preflop':
			if( this.otherPlayersAreAllIn() ) {
				this.seats[this.public.activeSeat].socket.emit( 'actOthersAllIn' );
			} else {
				this.seats[this.public.activeSeat].socket.emit( 'actBettedPot' );
			}
			break;
		case 'flop':
		case 'turn':
		case 'river':
			// If someone has betted
			if( this.public.biggestBet ) {
				if( this.otherPlayersAreAllIn() ) {
					this.seats[this.public.activeSeat].socket.emit( 'actOthersAllIn' );
				} else {
					this.seats[this.public.activeSeat].socket.emit( 'actBettedPot' );
				}
			} else {
				this.seats[this.public.activeSeat].socket.emit( 'actNotBettedPot' );
			}
			break;
	}

	this.emitEvent( 'table-data', this.public );
};

/**
 */
Table.prototype.showdown = function() {
	this.pot.addTableBets( this.seats );

	var currentPlayer = this.findNextPlayer( this.public.dealerSeat );
	var bestHandRating = 0;

	for( var i=0 ; i<this.playersInHandCount ; i++ ) {
		this.seats[currentPlayer].evaluateHand( this.public.board );
	
		if( this.seats[currentPlayer].evaluatedHand.rating > bestHandRating ) {
			this.seats[currentPlayer].public.cards = this.seats[currentPlayer].cards;
		}
		currentPlayer = this.findNextPlayer( currentPlayer );
	}
	
	var messages = this.pot.destributeToWinners( this.seats, currentPlayer );

	var messagesCount = messages.length;
	for( var i=0 ; i<messagesCount ; i++ ) {
		this.log({
			message: messages[i],
			action: '',
			seat: '',
			notification: ''
		});
		this.emitEvent( 'table-data', this.public );
	}

	var that = this;
	setTimeout( function(){
		that.endRound();
	}, 2000 );
};

/**
 */
Table.prototype.endPhase = function() {
	switch( this.public.phase ) {
		case 'preflop':
		case 'flop':
		case 'turn':
			this.initializeNextPhase();
			break;
		case 'river':
			this.showdown();
			break;
	}
};

/**
 * @param int seat
 */
Table.prototype.playerPostedSmallBlind = function() {
	var bet = this.seats[this.public.activeSeat].public.chipsInPlay >= this.public.smallBlind ? this.public.smallBlind : this.seats[this.public.activeSeat].public.chipsInPlay;
	this.seats[this.public.activeSeat].bet( bet );
	this.log({
		message: this.seats[this.public.activeSeat].public.name + ' posted the small blind',
		action: 'bet',
		seat: this.public.activeSeat,
		notification: 'Posted blind'
	});
	this.public.biggestBet = this.public.biggestBet < bet ? bet : this.public.biggestBet;
	this.emitEvent( 'table-data', this.public );
	this.initializeBigBlind();
};

/**
 * @param int seat
 */
Table.prototype.playerPostedBigBlind = function() {
	var bet = this.seats[this.public.activeSeat].public.chipsInPlay >= this.public.bigBlind ? this.public.bigBlind : this.seats[this.public.activeSeat].public.chipsInPlay;
	this.seats[this.public.activeSeat].bet( bet );
	this.log({
		message: this.seats[this.public.activeSeat].public.name + ' posted the big blind',
		action: 'bet',
		seat: this.public.activeSeat,
		notification: 'Posted blind'
	});
	this.public.biggestBet = this.public.biggestBet < bet ? bet : this.public.biggestBet;
	this.emitEvent( 'table-data', this.public );
	this.initializePreflop();
};

/**
 */
Table.prototype.playerFolded = function() {
	this.seats[this.public.activeSeat].fold();
	this.log({
		message: this.seats[this.public.activeSeat].public.name + ' folded',
		action: 'fold',
		seat: this.public.activeSeat,
		notification: 'Fold'
	});
	this.emitEvent( 'table-data', this.public );

	this.playersInHandCount--;
	this.pot.removePlayer( this.public.activeSeat );
	if( this.playersInHandCount <= 1 ) {
		this.pot.addTableBets( this.seats );
		var winnersSeat = this.findNextPlayer();
		this.pot.giveToWinner( this.seats[winnersSeat] );
		this.endRound();
	} else {
		if( this.lastPlayerToAct == this.public.activeSeat ) {
			this.endPhase();
		} else {
			this.actionToNextPlayer();
		}
	}
};

/**
 */
Table.prototype.playerChecked = function() {
	this.log({
		message: this.seats[this.public.activeSeat].public.name + ' checked',
		action: 'check',
		seat: this.public.activeSeat,
		notification: 'Check'
	});

	this.emitEvent( 'table-data', this.public );

	if( this.lastPlayerToAct === this.public.activeSeat ) {
		this.endPhase();
	} else {
		this.actionToNextPlayer();
	}
};

/**
 */
Table.prototype.playerCalled = function() {
	var calledAmount = this.public.biggestBet - this.seats[this.public.activeSeat].public.bet;
	this.seats[this.public.activeSeat].bet( calledAmount );

	this.log({
		message: this.seats[this.public.activeSeat].public.name + ' called',
		action: 'call',
		seat: this.public.activeSeat,
		notification: 'Call'
	});

	this.emitEvent( 'table-data', this.public );

	if( this.lastPlayerToAct === this.public.activeSeat || this.otherPlayersAreAllIn() ) {
		this.endPhase();
	} else {
		this.actionToNextPlayer();
	}
};

/**
 */
Table.prototype.playerBetted = function( amount ) {
	this.seats[this.public.activeSeat].bet( amount );
	this.public.biggestBet = this.public.biggestBet < this.seats[this.public.activeSeat].public.bet ? this.seats[this.public.activeSeat].public.bet : this.public.biggestBet;

	this.log({
		message: this.seats[this.public.activeSeat].public.name + ' betted ' + amount,
		action: 'bet',
		seat: this.public.activeSeat,
		notification: 'Bet ' + amount
	});

	this.emitEvent( 'table-data', this.public );

	var previousPlayerSeat = this.findPreviousPlayer();
	if( previousPlayerSeat === this.public.activeSeat ) {
		this.endPhase();
	} else {
		this.lastPlayerToAct = previousPlayerSeat;
		this.actionToNextPlayer();
	}
};

/**
 */
Table.prototype.playerRaised = function( amount ) {
	this.seats[this.public.activeSeat].raise( amount );
	var oldBiggestBet = this.public.biggestBet;
	this.public.biggestBet = this.public.biggestBet < this.seats[this.public.activeSeat].public.bet ? this.seats[this.public.activeSeat].public.bet : this.public.biggestBet;
	var raiseAmount = this.public.biggestBet - oldBiggestBet;
	this.log({
		message: this.seats[this.public.activeSeat].public.name + ' raised to ' + this.public.biggestBet,
		action: 'raise',
		seat: this.public.activeSeat,
		notification: 'Raise ' + raiseAmount
	});
	this.emitEvent( 'table-data', this.public );

	var previousPlayerSeat = this.findPreviousPlayer();
	if( previousPlayerSeat === this.public.activeSeat ) {
		this.endPhase();
	} else {
		this.lastPlayerToAct = previousPlayerSeat;
		this.actionToNextPlayer();
	}
};

/**
 * @param object 	player
 * @param int 		seat
 */
Table.prototype.playerSatOnTheTable = function( player, seat, chips ) {
	this.seats[seat] = player;
	this.public.seats[seat] = player.public;

	this.seats[seat].sitOnTable( this.public.id, seat, chips );

	// Increase the counters of the table
	this.public.playersSeatedCount++;
	
	this.playerSatIn( seat );
};

/**
 * Adds a player who is sitting on the table, to the game
 * @param int seat
 */
Table.prototype.playerSatIn = function( seat ) {
	this.log({
		message: this.seats[seat].public.name + ' sat in',
		action: '',
		seat: '',
		notification: ''
	});
	this.emitEvent( 'table-data', this.public );

	this.seats[seat].public.sittingIn = true;
	this.playersSittingInCount++;
	
	this.emitEvent( 'table-data', this.public );

	if( !this.gameIsOn && this.playersSittingInCount > 1 ) {
		// Initialize the game
		this.initializeRound( false );
	}
};

/**
 * @param int seat
 */
Table.prototype.playerLeft = function( seat ) {
	this.log({
		message: this.seats[seat].public.name + ' left',
		action: '',
		seat: '',
		notification: ''
	});

	// If someone is really sitting on that seat
	if( this.seats[seat].public.name ) {
		var nextAction = '';

		// If the player is sitting in, make them sit out first
		if( this.seats[seat].public.sittingIn ) {
			this.playerSatOut( seat, true );
		}

		this.seats[seat].leaveTable();

		// Empty the seat
		this.public.seats[seat] = {};
		this.public.playersSeatedCount--;

		if( this.public.playersSeatedCount < 2 ) {
			this.public.dealerSeat = null;
		}

		this.seats[seat] = null;
		this.emitEvent( 'table-data', this.public );

		if( this.playersInHandCount < 2 ) {
			this.endRound();
		}
		else if( this.lastPlayerToAct === seat && this.public.activeSeat === seat ) {
			this.endPhase();
		}
	}
};

/**
 * Changes the data of the table when a player sits out
 * @param int 	seat 			(the numeber of the seat)
 * @param bool 	playerLeft		(flag that shows that the player actually left the table)
 */
Table.prototype.playerSatOut = function( seat, playerLeft ) {
	if( typeof playerLeft == 'undefined' ) {
		playerLeft = false;
	}

	if( !playerLeft ) {
		this.log({
			message: this.seats[seat].public.name + ' sat out',
			action: '',
			seat: '',
			notification: ''
		});
		this.emitEvent( 'table-data', this.public );
	}

	if( this.seats[seat].public.bet ) {
		this.pot.addPlayersBets( this.seats[seat] );
	}
	this.pot.removePlayer( this.public.activeSeat );

	var nextAction = '';
	this.playersSittingInCount--;

	if( this.seats[seat].public.inHand ) {
		this.seats[seat].sitOut();
		this.playersInHandCount--;

		if( this.playersInHandCount < 2 ) {
			if( !playerLeft ) {
				this.endRound();
			}
		} else {
			if( this.public.activeSeat === seat && this.lastPlayerToAct !== seat ) {
				this.actionToNextPlayer();
			}
			else if( this.lastPlayerToAct === seat && this.public.activeSeat === seat ) {
				if( !playerLeft ) {
					this.endPhase();
				}
			}
			// If the player was the last to act but not the player who should act
			else if ( this.lastPlayerToAct === seat ) {
				this.lastPlayerToAct = this.findPreviousPlayer( this.lastPlayerToAct );
			}
		}
	} else {
		this.seats[seat].sitOut();
	}
	this.emitEvent( 'table-data', this.public );
};

Table.prototype.otherPlayersAreAllIn = function() {
	// Check if the players are all in
	var currentPlayer = this.public.activeSeat;
	var playersAllIn = 0;
	for( var i=0 ; i<this.playersInHandCount ; i++ ) {
		if( this.seats[currentPlayer].public.chipsInPlay === 0 ) {
			playersAllIn++;
		}
		currentPlayer = this.findNextPlayer( currentPlayer );
	}

	return playersAllIn >= this.playersInHandCount-1;
};

/**
 */
Table.prototype.removeAllCardsFromPlay = function() {
	// For each seat
	for( var i=0 ; i<this.public.seatsCount ; i++ ) {
		// If a player is sitting on the current seat
		if( this.seats[i] !== null ) {
			this.seats[i].cards = [];
			this.seats[i].public.hasCards = false;
		}
	}
};

/**
 */
Table.prototype.endRound = function() {
	// If there were any bets, they are added to the pot
	this.pot.addTableBets( this.seats );
	if( !this.pot.isEmpty() ) {
		var winnersSeat = this.findNextPlayer( 0 );
		this.pot.giveToWinner( this.seats[winnersSeat] );
	}

	for( i=0 ; i<this.public.seatsCount ; i++ ) {
		if( this.seats[i] !== null && this.seats[i].public.chipsInPlay <=0 && this.seats[i].public.sittingIn ) {
			this.seats[i].sitOut();
			this.playersSittingInCount--;
		}
	}

	if( this.playersSittingInCount < 2 ) {
		this.stopGame();
	} else {
		this.initializeRound();
	}
};

/**
 */
Table.prototype.stopGame = function() {
	this.public.phase = null;
	this.pot.reset();
	this.public.activeSeat = null;
	this.public.board = ['', '', '', '', ''];
	this.public.activeSeat = null;
	this.lastPlayerToAct = null;
	this.removeAllCardsFromPlay();
	this.gameIsOn = false;
	this.emitEvent( 'gameStopped', this.public );
};

/**
 */
Table.prototype.log = function(log) {
	this.public.log = null;
	this.public.log = log;
}

module.exports = Table;