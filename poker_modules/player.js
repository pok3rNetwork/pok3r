/**
 * @param string id (ethereum wallet addess immutable)
 * @param object socket (socket.io)
 * @param string name (gamertag)
 * @param int chips (# of PNC poker network chips metamask)
 */
var Player = function( socket, name, chips ) {
	this.public = {
		name: name,
		chipsInPlay: 0,
		sittingIn: false,
		inHand: false,
		hasCards: false,
        cards: [],
        bet: 0
	};
	this.socket = socket;
	this.chips = chips;
	this.room = null;
	this.sittingOnTable = false;
	this.seat = null;
	this.cards = [];
	this.evaluatedHand = {};
}

// Leave table 
Player.prototype.leaveTable = function() {
	if( this.sittingOnTable !== false ) {
		this.sitOut();
		// Remove chips
		this.chips += this.public.chipsInPlay;
		this.public.chipsInPlay = 0;
		// Remove the player
		this.sittingOnTable = false;
		this.seat = null;
	}
}

/**
 * @param  string   tableId
 * @param  number   seat    
 * @param  number   chips   
 */
Player.prototype.sitOnTable = function( tableId, seat, chips ) {
    chips = parseInt(chips);
    this.chips -= chips;
    this.public.chipsInPlay = chips;
    this.seat = seat;
    this.sittingOnTable = tableId;
}


Player.prototype.sitOut = function() {
	if( this.sittingOnTable !== false ) {
		this.public.sittingIn = false;
		this.public.inHand = false;
	}
}


Player.prototype.fold = function() {
	// The player has no cards now
	this.cards = [];
	this.public.hasCards = false;
    this.public.inHand = false;
}

/**
 * @param number amount
 */

// BETTING
Player.prototype.bet = function( amount ) {
    amount = parseInt(amount);
    if( amount > this.public.chipsInPlay ) {
        amount = this.public.chipsInPlay;
    }
    this.public.chipsInPlay -= amount;
    this.public.bet += +amount;
}

/**
 * @param number amount
 */
Player.prototype.raise = function( amount ) {
    amount = parseInt(amount);
    if( amount > this.public.chipsInPlay ) {
        amount = this.public.chipsInPlay;
    }
    this.public.chipsInPlay -= amount;
    this.public.bet += +amount;
}


Player.prototype.prepareForNewRound = function() {
    this.cards = [];
    this.public.cards = [];
    this.public.hasCards = false;
    this.public.bet = 0;
    this.public.inHand = true;
    this.evaluatedHand = {};
}

/**
 * @param array board 
 * @return object 
 */
Player.prototype.evaluateHand = function( board ) {
	var cards = this.cards.concat( board );
	var cardNamess = [ '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A' ];
    var cardNames = { 'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack', 'T': 'ten', '9': 'nine', '8': 'eight', '7': 'seven', '6': 'six', '5': 'five', '4': 'four', '3': 'three', '2': 'deuce' }

    var getCardName = function( cardValue, plural ) {
        if( typeof plural !== 'undefined' && plural == true ) {
            return cardValue == '6' ? cardNames[cardValue] + 'es' : cardNames[cardValue] + 's';
        } else {
            return cardNames[cardValue];
        }
    }

    // Swaps cards 
    var swap = function( index1, index2 ) {
        if ( cardNamess.indexOf( cards[index1][0] ) < cardNamess.indexOf( cards[index2][0] )){
            var tmp = cards[index1];
            cards[index1] = cards[index2];
            cards[index2] = tmp;
        }
    };
	
	var rateHand = function( hand ) {
		return cardNamess.indexOf( hand[0][0] ) * 30941 + cardNamess.indexOf( hand[1][0] ) * 2380 + cardNamess.indexOf( hand[2][0] ) * 183 + cardNamess.indexOf( hand[3][0] ) * 14 + cardNamess.indexOf( hand[4][0] );
	}
    
    // Sort 7 cards
    cards.sort( function( a, b ) {
        return cardNamess.indexOf( b[0] ) - cardNamess.indexOf( a[0] );
    });

    var straight = [],
        flushes = {},
        pairs = {};
        flushes['s'] = [],
        flushes['h'] = [],
        flushes['d'] = [],
        flushes['c'] = [],
        evaluatedHand = {
            'rank'      : '',
            'name'      : '',
            'rating'    : 0,
            'cards'     : [],
        };
        
    // Suit of  first card
    flushes[ cards[0][1] ].push( cards[0] );
    straight.push( cards[0] );

    // For the rest of the cards
    for( var i=1 ; i<7 ; i++ ) {
        flushes[ cards[i][1] ].push( cards[i] );

        var currentCardValue = cardNamess.indexOf( cards[i][0] );
        var previousCardValue = cardNamess.indexOf( straight[straight.length-1][0] );
        
        if( currentCardValue + 1 == previousCardValue ) {
            straight.push( cards[i] );
        }
        else if( currentCardValue != previousCardValue && straight.length < 5 ) {
            straight = [cards[i]];
        }
        else if( currentCardValue == previousCardValue ) {
            if( typeof pairs[ cards[i][0] ] == 'undefined' ) {
                pairs[ cards[i][0] ] = [ cards[i-1], cards[i] ];
            } else {
                pairs[ cards[i][0] ].push( cards[i] );
            }
        }
    }

    if( straight.length >= 4 ) {
        if( straight[straight.length-1][0] == '2' && cards[0][0] == 'A' ) {
            straight.push( cards[0] );
        }
        
        if( straight.length >= 5 ) {
            evaluatedHand.rank = 'straight';
            evaluatedHand.cards = straight.slice( 0, 5 );
        }
    }
	
    for( var i in flushes ) {
		var flushLength = flushes[i].length;
        if( flushLength >= 5 ) {
            if( evaluatedHand.rank == 'straight' ) {
				var straightFlush = [flushes[i][0]];
				var j=1;
				while( j < flushLength && straightFlush.length < 5 ) {
					var currentCardValue = cardNamess.indexOf( flushes[i][j][0] );
					var previousCardValue = cardNamess.indexOf( flushes[i][j-1][0] );

					if( currentCardValue+1 == previousCardValue ) {
						straightFlush.push( flushes[i][j] );
					}
					else if( currentCardValue != previousCardValue && straightFlush.length < 5 ) {
						straightFlush = [flushes[i][j]];
					}
					j++;
				}
				if( straightFlush.length == 4 && straightFlush[3][0] == '2' && cards.indexOf('A'+i) >= 0 ) {
					straightFlush.push('A'+i);
				}
				if( straightFlush.length == 5 ) {
					evaluatedHand.cards = straightFlush;
					if( evaluatedHand.cards[0][0] == 'A' ) {
						evaluatedHand.rank = 'royal flush';
					} else {
						evaluatedHand.rank = 'straight flush';
					}
				}
            } 
			if( evaluatedHand.rank != 'straight flush' && evaluatedHand.rank != 'royal flush' ) {
                evaluatedHand.rank = 'flush';
                evaluatedHand.cards = flushes[i].slice( 0, 5 );
            }
            break;
        }
    }

    if( !evaluatedHand.rank ) {
        var numberOfPairs = 0;
        for( var i in pairs ) {
            numberOfPairs++;
        }
        var kickers = 0;
        var i = 0;
        if( numberOfPairs ) {
            if( numberOfPairs == 1 ) {
                evaluatedHand.cards = pairs[Object.keys(pairs)[0]];
                if( evaluatedHand.cards.length == 2 ) {
                    evaluatedHand.rank = 'pair';
                    while( kickers < 3 ) {
                        if( cards[i][0] != evaluatedHand.cards[0][0] ) {
                            evaluatedHand.cards.push( cards[i] );
                            kickers++;
                        }
                        i++;
                    }
                }
                // If it is a three of a kind
                else if( evaluatedHand.cards.length == 3 ) {
                    evaluatedHand.rank = 'three of a kind';
                    while( kickers < 2 ) {
                        if( cards[i][0] != evaluatedHand.cards[0][0] ) {
                            evaluatedHand.cards.push( cards[i] );
                            kickers++;
                        }
                        i++;
                    }
                }
                else if( evaluatedHand.cards.length == 4 ) {
                    evaluatedHand.rank = 'four of a kind';
                    while( kickers < 1 ) {
                        if( cards[i][0] != evaluatedHand.cards[0][0] ) {
                            evaluatedHand.cards.push( cards[i] );
                            kickers++;
                        }
                        i++;
                    }
                }
            }
            else if( numberOfPairs == 2 ) {
                if( pairs[Object.keys(pairs)[0]].length > pairs[Object.keys(pairs)[1]].length || ( pairs[Object.keys(pairs)[0]].length == pairs[Object.keys(pairs)[1]].length && cardNamess.indexOf( Object.keys(pairs)[0] ) > cardNamess.indexOf( Object.keys(pairs)[1] ) ) ){
                    evaluatedHand.cards = pairs[ Object.keys(pairs)[0] ];
                    delete pairs[ Object.keys(pairs)[0] ];
                } else { 
                    evaluatedHand.cards = pairs[ Object.keys(pairs)[1] ];
                    delete pairs[ Object.keys(pairs)[1] ];
                }
                
                if( evaluatedHand.cards.length == 2 ) {
                    for( var j=0 ; j<2 ; j++ ) {
                        evaluatedHand.cards.push( pairs[Object.keys(pairs)[0]][j] );
                    }
                    evaluatedHand.rank = 'two pair';
                    while( kickers < 1 ) {
                        if( cards[i][0] != evaluatedHand.cards[0][0] && cards[i][0] != evaluatedHand.cards[2][0]) {
                            evaluatedHand.cards.push( cards[i] );
                            kickers++;
                        }
                        i++;
                    }
                }
                else if( evaluatedHand.cards.length == 3 ) {
					evaluatedHand.rank = 'full house';
					for( var j=0 ; j<2 ; j++ ) {
						evaluatedHand.cards.push( pairs[Object.keys(pairs)[0]][j] );
					}
                } else {
                    evaluatedHand.rank = 'four of a kind';
                    while( kickers < 1 ) {
                        if( cards[i][0] != evaluatedHand.cards[0][0] ) {
                            evaluatedHand.cards.push( cards[i] );
                            kickers++;
                        }
                        i++;
                    }
                }
            } else {
                var pairKeys = [ Object.keys(pairs)[0], Object.keys(pairs)[1], Object.keys(pairs)[2] ];
				for( var j in pairs ) {
					if( pairs[j].length == 3 ) {
						evaluatedHand.rank = 'full house';
						evaluatedHand.cards = pairs[j];
                        delete pairs[j];
						break;
					}
				}
				if( !evaluatedHand.cards.length ) {
					evaluatedHand.rank = 'two pair';
					if( cardNamess.indexOf( pairKeys[0] ) > cardNamess.indexOf( pairKeys[1] ) ) {
						if( cardNamess.indexOf( pairKeys[0] ) > cardNamess.indexOf( pairKeys[2] ) ) {
							evaluatedHand.cards = pairs[ pairKeys[0] ];
							delete pairs[ pairKeys[0] ];
						} else {
							evaluatedHand.cards = pairs[ pairKeys[2] ];
							delete pairs[ pairKeys[2] ];
						}
					} else {
						if( cardNamess.indexOf( pairKeys[1] ) > cardNamess.indexOf( pairKeys[2] ) ) {
							evaluatedHand.cards = pairs[ pairKeys[1] ];
							delete pairs[ pairKeys[1] ];
						} else {
							evaluatedHand.cards = pairs[ pairKeys[2] ];
							delete pairs[ pairKeys[2] ];
						}
					}
				}
                if( cardNamess.indexOf( Object.keys(pairs)[0] ) > cardNamess.indexOf( Object.keys(pairs)[1] ) ) {
                    for( var j=0 ; j<2 ; j++ ) {
						evaluatedHand.cards.push( pairs[Object.keys(pairs)[0]][j] );
                    }
                } else {
                    for( var j=0 ; j<2 ; j++ ) {
						evaluatedHand.cards.push( pairs[Object.keys(pairs)[1]][j] );
                    }
                }
                
				if( evaluatedHand.rank == 'two pair' ) {
					while( kickers < 1 ) {
						if( cards[i][0] != evaluatedHand.cards[0][0] && cards[i][0] != evaluatedHand.cards[2][0]) {
							evaluatedHand.cards.push( cards[i] );
							kickers++;
						}
						i++;
					}
				}
            }
        }
    }

    if( !evaluatedHand.rank ) {
        evaluatedHand.rank = 'high card';
        evaluatedHand.cards = cards.slice( 0, 5 );
    }
	
    // From Poker hand evaluator npm texas hold em 
	switch( evaluatedHand.rank ) {
		case 'high card':
			evaluatedHand.name = getCardName( evaluatedHand.cards[0][0] ) + ' high';
			evaluatedHand.rating = rateHand( evaluatedHand.cards );
			break;
		case 'pair':
            evaluatedHand.name = 'a pair of ' + getCardName( evaluatedHand.cards[0][0], true );
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 1000000;
			break;
		case 'two pair':
			evaluatedHand.name = 'two pair, ' + getCardName( evaluatedHand.cards[0][0], true ) + ' and ' + getCardName( evaluatedHand.cards[2][0], true );
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 2000000;
			break;
		case 'three of a kind':
            evaluatedHand.name = 'three of a kind, ' + getCardName( evaluatedHand.cards[0][0], true );
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 3000000;
			break;
		case 'straight':
            evaluatedHand.name = 'a straight to ' + getCardName( straight[0][0] );
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 4000000;
			break;
		case 'flush':
            evaluatedHand.name = 'a flush, ' + getCardName( evaluatedHand.cards[0][0] ) + ' high';
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 5000000;
			break;
		case 'full house':
			evaluatedHand.name = 'a full house, ' + getCardName( evaluatedHand.cards[0][0], true ) + ' full of ' + getCardName( evaluatedHand.cards[3][0], true );
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 6000000;
			break;
		case 'four of a kind':
            evaluatedHand.name = 'four of a kind, ' + getCardName( evaluatedHand.cards[0][0], true );
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 7000000;
			break;
		case 'straight flush':
			evaluatedHand.name = 'a straight flush, ' + getCardName( evaluatedHand.cards[4][0] ) + ' to ' + getCardName( evaluatedHand.cards[0][0] );
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 8000000;
			break;
		case 'royal flush':
			evaluatedHand.name = 'a royal flush';
			evaluatedHand.rating = rateHand( evaluatedHand.cards ) + 8000000;
			break;
	}
	this.evaluatedHand = evaluatedHand;
}

module.exports = Player;