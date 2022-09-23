var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	lessMiddleware = require('less-middleware'),
	path = require('path'),
	Table = require('./poker_modules/table'),
	Player = require('./poker_modules/player');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(lessMiddleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

if ( 'development' == app.get('env') ) {
	app.use( express.errorHandler() );
}

var players = [];
var tables = [];
var eventEmitter = {};

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);

app.get('/', function( req, res ) {
	res.render('index');
});

app.get('/lobby-data', function( req, res ) {
	var lobbyTables = [];
	for ( var tableId in tables ) {
		if( !tables[tableId].privateTable ) {
			lobbyTables[tableId] = {};
			lobbyTables[tableId].id = tables[tableId].public.id;
			lobbyTables[tableId].name = tables[tableId].public.name;
			lobbyTables[tableId].seatsCount = tables[tableId].public.seatsCount;
			lobbyTables[tableId].playersSeatedCount = tables[tableId].public.playersSeatedCount;
			lobbyTables[tableId].bigBlind = tables[tableId].public.bigBlind;
			lobbyTables[tableId].smallBlind = tables[tableId].public.smallBlind;
		}
	}
	res.send( lobbyTables );
});

app.get('/table-10/:tableId', function( req, res ) {
	res.redirect('/');
});

app.get('/table-6/:tableId', function( req, res ) {
	res.redirect('/');
});

app.get('/table-2/:tableId', function( req, res ) {
	res.redirect('/');
});

// The table data
app.get('/table-data/:tableId', function( req, res ) {
	if( typeof req.params.tableId !== 'undefined' && typeof tables[req.params.tableId] !== 'undefined' ) {
		res.send( { 'table': tables[req.params.tableId].public } );
	}
});

io.sockets.on('connection', function( socket ) {

	/**
	 * When a player enters a room
	 * @param object table-data
	 */
	socket.on('enterRoom', function( tableId ) {
		if( typeof players[socket.id] !== 'undefined' && players[socket.id].room === null ) {
			socket.join( 'table-' + tableId );
			players[socket.id].room = tableId;
		}
	});

	/**
	 * When a player leaves a room
	 */
	socket.on('leaveRoom', function() {
		if( typeof players[socket.id] !== 'undefined' && players[socket.id].room !== null && players[socket.id].sittingOnTable === false ) {
			socket.leave( 'table-' + players[socket.id].room );
			players[socket.id].room = null;
		}
	});

	/**
	 */
	socket.on('disconnect', function() {
		if( typeof players[socket.id] !== 'undefined' ) {
			if( players[socket.id].sittingOnTable !== false && typeof tables[players[socket.id].sittingOnTable] !== 'undefined' ) {
				var seat = players[socket.id].seat;
				var tableId = players[socket.id].sittingOnTable;
				tables[tableId].playerLeft( seat );
			}
			delete players[socket.id];
		}
	});

	/**
	 * When a player leaves the table
	 * @param function callback
	 */
	socket.on('leaveTable', function( callback ) {
		// If the player was sitting on a table
		if( players[socket.id].sittingOnTable !== false && tables[players[socket.id].sittingOnTable] !== false ) {
			// The seat on which the player was sitting
			var seat = players[socket.id].seat;
			var tableId = players[socket.id].sittingOnTable;
			tables[tableId].playerLeft( seat );
			callback( { 'success': true, 'totalChips': players[socket.id].chips } );
		}
	});

	/**
	 * When a new player enters the application
	 * @param string newScreenName
	 * @param function callback
	 */
	socket.on('register', function( newScreenName, callback ) {
		if( typeof newScreenName !== 'undefined' ) {
			var newScreenName = newScreenName.trim();
			if( newScreenName && typeof players[socket.id] === 'undefined' ) {
				var nameExists = false;
				for( var i in players ) {
					if( players[i].public.name && players[i].public.name == newScreenName ) {
						nameExists = true;
						break;
					}
				}
				if( !nameExists ) {
					// Creating the player object
					players[socket.id] = new Player( socket, newScreenName, 1000 );
					callback( { 'success': true, screenName: newScreenName, totalChips: players[socket.id].chips } );
				} else {
					callback( { 'success': false, 'message': 'This name is taken' } );
				}
			} else {
				callback( { 'success': false, 'message': 'Please enter a screen name' } );
			}
		} else {
			callback( { 'success': false, 'message': '' } );
		}
	});

	/**
	 * When a player requests to sit on a table
	 * @param function callback
	 */
	socket.on('sitOnTheTable', function( data, callback ) {
		if( 
			typeof data.seat !== 'undefined'
			// A table id is specified
			&& typeof data.tableId !== 'undefined'
			&& typeof tables[data.tableId] !== 'undefined'
			&& typeof data.seat === 'number'
			&& data.seat >= 0 
			&& data.seat < tables[data.tableId].public.seatsCount
			&& typeof players[socket.id] !== 'undefined'
			// The seat is empty
			&& tables[data.tableId].seats[data.seat] == null
			&& players[socket.id].sittingOnTable === false
			&& players[socket.id].room === data.tableId
			&& typeof data.chips !== 'undefined'
			&& !isNaN(parseInt(data.chips)) 
			&& isFinite(data.chips)
			// The chips number is an integer
			&& data.chips % 1 === 0
		){
			// The chips the player chose are less than the total chips the player has
			if( data.chips > players[socket.id].chips )
				callback( { 'success': false, 'error': 'You don\'t have that many chips' } );
			else if( data.chips > tables[data.tableId].public.maxBuyIn || data.chips < tables[data.tableId].public.minBuyIn )
				callback( { 'success': false, 'error': 'The amount of chips should be between the maximum and the minimum amount of allowed buy in' } );
			else {
				callback( { 'success': true } );
				tables[data.tableId].playerSatOnTheTable( players[socket.id], data.seat, data.chips );
			}
		} else {
			callback( { 'success': false } );
		}
	});

	/**
	 * When a player who sits on the table but is not sitting in, requests to sit in
	 * @param function callback
	 */
	socket.on('sitIn', function( callback ) {
		if( players[socket.id].sittingOnTable !== false && players[socket.id].seat !== null && !players[socket.id].public.sittingIn ) {
			var tableId = players[socket.id].sittingOnTable;
			tables[tableId].playerSatIn( players[socket.id].seat );
			callback( { 'success': true } );
		}
	});

	/**
	 * @param bool postedBlind (Shows if the user posted the blind or not)
	 * @param function callback
	 */
	socket.on('postBlind', function( postedBlind, callback ) {
		if( players[socket.id].sittingOnTable !== false ) {
			var tableId = players[socket.id].sittingOnTable;
			var activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] 
				&& typeof tables[tableId].seats[activeSeat].public !== 'undefined' 
				&& tables[tableId].seats[activeSeat].socket.id === socket.id 
				&& ( tables[tableId].public.phase === 'smallBlind' || tables[tableId].public.phase === 'bigBlind' ) 
			) {
				if( postedBlind ) {
					callback( { 'success': true } );
					if( tables[tableId].public.phase === 'smallBlind' ) {
						// The player posted the small blind
						tables[tableId].playerPostedSmallBlind();
					} else {
						// The player posted the big blind
						tables[tableId].playerPostedBigBlind();
					}
				} else {
					tables[tableId].playerSatOut( players[socket.id].seat );
					callback( { 'success': true } );
				}
			}
		}
	});

	/**
	 * When a player checks
	 * @param function callback
	 */
	socket.on('check', function( callback ){
		if( players[socket.id].sittingOnTable !== 'undefined' ) {
			var tableId = players[socket.id].sittingOnTable;
			var activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] 
				&& tables[tableId].seats[activeSeat].socket.id === socket.id 
				&& !tables[tableId].public.biggestBet || ( tables[tableId].public.phase === 'preflop' && tables[tableId].public.biggestBet === players[socket.id].public.bet )
				&& ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 
			) {
				callback( { 'success': true } );
				tables[tableId].playerChecked();
			}
		}
	});

	/**
	 * When a player folds
	 * @param function callback
	 */
	socket.on('fold', function( callback ){
		if( players[socket.id].sittingOnTable !== false ) {
			var tableId = players[socket.id].sittingOnTable;
			var activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] && tables[tableId].seats[activeSeat].socket.id === socket.id && ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 ) {
				callback( { 'success': true } );
				tables[tableId].playerFolded();
			}
		}
	});

	/**
	 * When a player calls
	 * @param function callback
	 */
	socket.on('call', function( callback ){
		if( players[socket.id].sittingOnTable !== 'undefined' ) {
			var tableId = players[socket.id].sittingOnTable;
			var activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] && tables[tableId].seats[activeSeat].socket.id === socket.id && tables[tableId].public.biggestBet && ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 ) {
				callback( { 'success': true } );
				tables[tableId].playerCalled();
			}
		}
	});

	/**
	 * When a player bets
	 * @param number amount
	 * @param function callback
	 */
	socket.on('bet', function( amount, callback ){
		if( players[socket.id].sittingOnTable !== 'undefined' ) {
			var tableId = players[socket.id].sittingOnTable;
			var activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] && tables[tableId].seats[activeSeat].socket.id === socket.id && !tables[tableId].public.biggestBet && ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 ) {
				amount = parseInt( amount );
				if ( amount && isFinite( amount ) && amount <= tables[tableId].seats[activeSeat].public.chipsInPlay ) {
					callback( { 'success': true } );
					tables[tableId].playerBetted( amount ); 
				}
			}
		}
	});

	/**
	 * @param function callback
	 */
	socket.on('raise', function( amount, callback ){
		if( players[socket.id].sittingOnTable !== 'undefined' ) {
			var tableId = players[socket.id].sittingOnTable;
			var activeSeat = tables[tableId].public.activeSeat;
			
			if(
				typeof tables[tableId] !== 'undefined' 
				&& tables[tableId].seats[activeSeat].socket.id === socket.id
				&& tables[tableId].public.biggestBet
				&& ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1
				&& !tables[tableId].otherPlayersAreAllIn()
			) {
				amount = parseInt( amount );
				if ( amount && isFinite( amount ) ) {
					amount -= tables[tableId].seats[activeSeat].public.bet;
					if( amount <= tables[tableId].seats[activeSeat].public.chipsInPlay ) {
						// Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
						callback( { 'success': true } );
						// The amount should not include amounts previously betted
						tables[tableId].playerRaised( amount );
					}
				}
			}
		}
	});

	/**
	 * When a message from a player is sent
	 * @param string message
	 */
	socket.on('sendMessage', function( message ) {
		message = message.trim();
		if( message && players[socket.id].room ) {
			socket.broadcast.to( 'table-' + players[socket.id].room ).emit( 'receiveMessage', { 'message': htmlEntities( message ), 'sender': players[socket.id].public.name } );
		}
	});
});

/**
 * Event emitter function that will be sent to the table objects

 * @param string tableId
 */
var eventEmitter = function( tableId ) {
	return function ( eventName, eventData ) {
		io.sockets.in( 'table-' + tableId ).emit( eventName, eventData );
	}
}

/**
 * Changes certain characters in a string to html entities
 * @param string str
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

tables[0] = new Table( 0, '10-handed Table', eventEmitter(0), 10, 2, 1, 200, 40, false );
tables[1] = new Table( 1, '6-handed Table', eventEmitter(1), 6, 4, 2, 400, 80, false );
tables[2] = new Table( 2, '2-handed Table', eventEmitter(2), 2, 8, 4, 800, 160, false );
tables[3] = new Table( 3, '6-handed Private Table', eventEmitter(3), 6, 20, 10, 2000, 400, true );