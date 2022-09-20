(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Poker = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suits = {
    CLUB: "CLUB",
    DIAMOND: "DIAMOND",
    HEART: "HEART",
    SPADE: "SPADE",
};
var SHORT_NAMES = {
    c: "CLUB",
    d: "DIAMOND",
    h: "HEART",
    s: "SPADE",
};
var Card = /** @class */ (function () {
    function Card(suit, value) {
        var s;
        if (typeof suit == "string") {
            s = suit.length == 1 ? SHORT_NAMES[suit.toLowerCase()] : exports.Suits[suit];
            if (!s)
                throw new Error('Invalid suit! Supported suits are: CLUB,DIAMOND,HEART,SPADE. You can also use the first letter as well.');
        }
        else
            s = suit;
        this.suit = s;
        if (value < 2 || value > 14)
            throw new Error('Invalid card value, should be 2 to 14 where 11=J, 12=Q, 13=K and 14=A');
        this.value = value;
    }
    return Card;
}());
exports.Card = Card;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Card_1 = require("./Card");
var Deck = /** @class */ (function () {
    function Deck() {
        var suits = [Card_1.Suits.CLUB, Card_1.Suits.DIAMOND, Card_1.Suits.HEART, Card_1.Suits.SPADE];
        this.cards = Array.apply(null, new Array(52)).map(function (_, v) { return new Card_1.Card(suits[Math.floor(v / 13)], (v % 13) + 2); });
    }
    Deck.prototype.shuffle = function () {
        var currentIndex = this.cards.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) { // While there remain elements to shuffle...
            randomIndex = Math.floor(Math.random() * currentIndex); // Pick a remaining element...
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = this.cards[currentIndex];
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[randomIndex] = temporaryValue;
        }
    };
    Deck.prototype.getCards = function (count) {
        if (count === void 0) { count = 1; }
        return this.cards.splice(0, count);
    };
    return Deck;
}());
exports.Deck = Deck;

},{"./Card":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deck_1 = require("./deck");
var Holdem_1 = require("./Holdem");
var Game = /** @class */ (function () {
    /**
     * Inititalizes the Game
     *
     * @param playerMoney   Array of player money to start with, number of players will be of same length
     * @param initialBet    Minimum betting amount to start with
     */
    function Game(playerMoney, initialBet) {
        this.pot = 0;
        this.players = [];
        this.deck = new deck_1.Deck();
        this.table = [];
        this.round = [];
        this.__instance = new Holdem_1.Holdem();
        this.__roundStates = [];
        this.initialBet = initialBet;
        this.newRound(playerMoney);
    }
    /**
     * Starts a new game round
     *
     * @param playerMoney Money for individual players
     */
    Game.prototype.newRound = function (playerMoney) {
        var _this = this;
        this.pot = 0;
        this.deck = new deck_1.Deck();
        this.deck.shuffle();
        this.table = [];
        this.round = [];
        this.__roundStates = [];
        this.players = playerMoney.map(function (money) {
            return {
                money: money,
                hand: _this.deck.getCards(2),
                folded: false,
                active: true
            };
        });
    };
    /**
     * Returns the current game state
     */
    Game.prototype.getState = function () {
        var _this = this;
        return {
            communityCards: this.table.slice(0),
            pot: this.round.reduce(function (a, c) { return a + c.money; }, this.pot),
            players: this.players.map(function (p, i) {
                var availableActions = [];
                if (p.active) {
                    if (_this.table.length == 0) {
                        availableActions.push("bet", "fold");
                    }
                    else if (_this.round.length) {
                        if (_this.round[i].decision != "fold") {
                            availableActions.push("raise", "call", "check", "fold");
                        }
                    }
                }
                return {
                    money: p.money,
                    hand: p.hand,
                    folded: p.folded,
                    active: p.active,
                    currentDecision: (_this.round.length && _this.round[i].decision) || '',
                    currentBet: (_this.round.length && _this.round[i].money) || 0,
                    availableActions: availableActions
                };
            })
        };
    };
    /**
     * Starts the round if not started yet
     */
    Game.prototype.startRound = function () {
        var activePlayers = 0;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].money < 0)
                this.players[i].active = false;
            else {
                activePlayers++;
            }
            this.round[i] = {
                money: 0,
            };
        }
        if (activePlayers == 1) {
            this.round = [];
            throw new Error("Game cannot continue");
        }
    };
    /**
     * Bet the initial betting amount
     *
     * @param index Player index
     */
    Game.prototype.bet = function (index) {
        if (!this.round.length)
            throw new Error("Game round not started");
        if (this.round[index].decision)
            throw new Error("Please proceed to next round");
        this.round[index].money = this.initialBet;
        this.round[index].decision = "bet";
    };
    /**
     * Bet 0 unit of money
     *
     * @param index Player index
     */
    Game.prototype.check = function (index) {
        if (!this.round.length)
            throw new Error("Game round not started");
        if (this.round[index].decision)
            throw new Error("Please proceed to next round");
        if (this.table.length == 0)
            throw new Error("Cannot check in opening round");
        this.round[index].money = 0;
        this.round[index].decision = "check";
    };
    /**
     * Raise by a player
     *
     * @param index Player index
     * @param money Raise amount
     */
    Game.prototype.raise = function (index, money) {
        if (!this.round.length)
            throw new Error("Game round not started");
        if (this.players[index].money < money)
            throw new Error('Too much');
        if (this.round[index].decision && this.round[index].decision != "raise")
            throw new Error("Please proceed to next round");
        var raised_money = money;
        if (!this.table.length)
            raised_money = money + this.initialBet;
        this.round[index].money = raised_money;
        this.round[index].decision = "raise";
    };
    /**
     * Call by a player
     *
     * @param index Player index
     */
    Game.prototype.call = function (index) {
        if (!this.round.length)
            throw new Error("Game round not started");
        //if(this.round[index].decision) throw new Error("Please proceed to next round");
        var max_money = this.round.slice(0).sort(function (a, b) { return b.money - a.money; })[0].money;
        if (max_money == 0)
            max_money = this.initialBet; //fall back to initial betting amount
        this.round[index].money = max_money;
        this.round[index].decision = "call";
    };
    /**
     * Fold by a player
     *
     * @param index Player index
     */
    Game.prototype.fold = function (index) {
        if (!this.round.length)
            throw new Error("Game round not started");
        if (this.round[index].decision)
            throw new Error("Please proceed to next round");
        this.round[index].decision = "fold";
        this.players[index].folded = true;
    };
    /**
     * Whether the current round can be ended
     */
    Game.prototype.canEndRound = function () {
        var last_amount = -1;
        for (var i = 0; i < this.round.length; i++) {
            if (this.round[i].decision == "fold")
                continue;
            var money = this.round[i].money;
            if (last_amount < 0)
                last_amount = money;
            else if (money != last_amount)
                return false;
        }
        return true;
    };
    /**
     * Ends the current round.
     */
    Game.prototype.endRound = function () {
        if (!this.round.length)
            throw new Error("Game round not started");
        if (this.__roundStates.length == 4)
            throw new Error("Round is over, please invoke checkResult");
        var last_amount = -1;
        var pot = 0;
        for (var i = 0; i < this.round.length; i++) {
            if (this.round[i].decision == "fold")
                continue;
            var money = this.round[i].money;
            if (last_amount < 0)
                last_amount = money;
            else if (money != last_amount)
                throw new Error("Round is not over yet, please call or raise.");
            pot += money;
        }
        this.pot += pot;
        this.__roundStates.push(this.round.slice(0));
        if (this.__roundStates.length < 4) {
            var communityCardCountForThisRound = 1;
            if (this.table.length == 0)
                communityCardCountForThisRound = 3;
            this.table.push.apply(this.table, this.deck.getCards(communityCardCountForThisRound));
        }
    };
    /**
     * Returns the result of the current round
     */
    Game.prototype.checkResult = function () {
        var result = this.__instance.compareHands(this.players.map(function (m) { return m.hand; }), this.table);
        if (result.type == 'win') {
            if (result.index != undefined)
                this.players[result.index].money += this.pot;
            else
                throw new Error("This error will never happen");
        }
        else { //draw
            //split the pot among non-folded players
            var splitCount = this.players.filter(function (f) { return !f.folded; }).length;
            if (splitCount > 0) {
                var eachSplit = this.pot / splitCount;
                for (var i = 0; i < this.players.length; i++) {
                    if (!this.players[i].folded)
                        this.players[i].money += eachSplit;
                }
            }
        }
        this.newRound(this.players.map(function (m) { return m.money; }));
        return result;
    };
    /**
     * Returns the max possible hand value.
     * Note: Community cards are ignored.
     *
     * @param hand Array of cards
     */
    Game.prototype.computeHand = function (hand) {
        return this.__instance.computeHand(hand, hand);
    };
    return Game;
}());
exports.Game = Game;

},{"./Holdem":4,"./deck":6}],4:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var TieBreaker_1 = require("./TieBreaker");
exports.DESC = function (a, b) { return b.value - a.value; };
var ASC = function (a, b) { return a.value - b.value; };
var VASC = function (a, b) { return a - b; };
var HAND_HICARD = "Hi Card";
var HAND_PAIR = "Pair";
var HAND_TWOPAIRS = "Two pairs";
var HAND_THREEOFAKIND = "Three of a kind";
var HAND_STRAIGHT = "Straight";
var HAND_FLUSH = "Flush";
var HAND_FULLHOUSE = "Full House";
var HAND_FOUROFAKIND = "Four of a kind";
var HAND_STRAIGHTFLUSH = "Straight flush";
var HAND_ROYALFLUSH = "Royal flush";
var Holdem = /** @class */ (function () {
    function Holdem() {
        this.test_cache = {
            hicard: {
                suit: '',
                value: 0
            },
            pair: {
                value: 0,
                index: -1
            },
            two_pairs: {
                all_indices: [],
                pair_indices: []
            },
            three_of_a_kind: {
                value: 0,
                indices: []
            },
            four_of_a_kind: 0,
            straight: { result: false },
            flush: { result: false },
            straight_flush: false,
        };
        this.test_summary = {
            value: {},
            suit: {}
        };
        this.TestSeries = [
            { name: HAND_HICARD, fn: this.TestHicard },
            { name: HAND_PAIR, fn: this.TestPair },
            { name: HAND_TWOPAIRS, fn: this.TestTwoPairs },
            { name: HAND_THREEOFAKIND, fn: this.TestThreeOfAKind },
            { name: HAND_STRAIGHT, fn: this.TestStraight },
            { name: HAND_FLUSH, fn: this.TestFlush },
            { name: HAND_FULLHOUSE, fn: this.TestFullHouse },
            { name: HAND_FOUROFAKIND, fn: this.TestFourOfAKind },
            { name: HAND_STRAIGHTFLUSH, fn: this.TestStraightFlush },
            { name: HAND_ROYALFLUSH, fn: this.TestRoyalFlush }
        ];
        /*computeHandAllPartialStat(hand:Array<Card>){
            let stat = {
                hicard:0,
                pair:0,
                two_pairs:0,
                three_of_a_kind:0,
                straight:0,
                flush:0,
                full_house:0,
                four_of_a_kind:0,
                straight_flush:0,
                royal_flush:0
            };
            let result = this.computeHand(hand,hand);
            
        }*/
        /** TODO
        Maximum number of raises
        Most fixed-limit games will not allow more than a predefined number of raises in a betting round.
        The maximum number of raises depends on the casino house rules, and is usually posted conspicuously
        in the card room. Typically, an initial bet plus either three or four raises are allowed.
    
        Consider this example in a $20/$40 game, with a posted limit of a bet and three raises.
        During a $20 round with three players, play could proceed as follows:
    
        Player A bets $20.
        Player B puts in another bet, raises another $20, making it $40 to play.
        Player C puts in a third bet, raising another $20 on that, thus making it $60 to play.
        Player A puts in the fourth bet (they are usually said to cap the betting).
        Once Player A has made their final bet, Players B and C may only call another two and one
        bets (respectively); they may not raise again because the betting is capped.
    
        A common exception in this rule practiced in some card rooms is to allow unlimited raising
        when a pot is played heads up (when only two players are in the hand at the start of the
        betting round). Usually, this has occurred because all other players have folded, and only
        two remain, although it is also practiced when only two players get dealt in. Many card rooms
        will permit these two players to continue re-raising each other until one player is all in.
        */
    }
    //Simple value of the card. Lowest: 2 - Highest: Ace(14)
    Holdem.prototype.TestHicard = function (hand, mainCards) {
        var card = mainCards.slice(0).sort(exports.DESC)[0];
        this.test_cache.hicard = { suit: card.suit + '', value: card.value };
        return card.value;
    };
    //Two cards with the same value
    Holdem.prototype.TestPair = function (hand, mainCards) {
        for (var key in this.test_summary.value)
            if (this.test_summary.value[key].length == 2) {
                this.test_cache.pair = { value: Number(key), index: this.test_summary.value[key][0] };
                return true;
            }
        return false;
    };
    //Two times two cards with the same value
    Holdem.prototype.TestTwoPairs = function (hand, mainCards) {
        var all_indices = [];
        var pair_indices = [];
        for (var key in this.test_summary.value) {
            if (this.test_summary.value[key].length == 2) {
                var _a = this.test_summary.value[key], a = _a[0], b = _a[1];
                pair_indices.push(a);
                all_indices.push(a);
                all_indices.push(b);
            }
        }
        if (pair_indices.length == 2) {
            this.test_cache.two_pairs = { all_indices: all_indices, pair_indices: pair_indices };
            return true;
        }
    };
    //Three cards with the same value
    Holdem.prototype.TestThreeOfAKind = function (hand, mainCards) {
        for (var key in this.test_summary.value) {
            if (this.test_summary.value[key].length == 3) {
                this.test_cache.three_of_a_kind.value = Number(key);
                this.test_cache.three_of_a_kind.indices = this.test_summary.value[key];
                return true;
            }
        }
    };
    //Sequence of 5 cards in increasing value (Ace can precede 2 and follow up King)
    Holdem.prototype.TestStraight = function (hand, mainCards) {
        var seq_count = 0;
        var seq_start = -1;
        var seq = hand.slice(0).sort(ASC);
        for (var i = 0; i < seq.length - 1; i++) {
            if (seq[i].value === seq[i + 1].value - 1) {
                if (seq_start < 0)
                    seq_start = i;
                seq_count++;
            }
            else if (seq_count < 3) {
                seq_count = 0;
                seq_start = -1;
            }
        }
        var result = seq_count > 3 || (seq_count == 3 && seq_start == 0 && seq[seq.length - 1].value == 14);
        this.test_cache.straight.result = result;
        if (result) {
            this.test_cache.straight.start = hand.findIndex(function (f) { return f.suit == seq[seq_start].suit && f.value == seq[seq_start].value; });
        }
        return result;
    };
    //5 cards of the same suit
    Holdem.prototype.TestFlush = function (hand, mainCards) {
        for (var key in this.test_summary.suit) {
            if (this.test_summary.suit[key].length == 5) {
                this.test_cache.flush = { suit: key, result: true };
                return true;
            }
        }
        this.test_cache.flush = {
            result: false
        };
    };
    //Combination of three of a kind and a pair
    Holdem.prototype.TestFullHouse = function (hand, mainCards) {
        if (this.test_cache.three_of_a_kind.indices.length == 3 && this.test_cache.pair.value >= 2) {
            return this.test_cache.three_of_a_kind.value !== this.test_cache.pair.value;
        }
    };
    //Four cards of the same value
    Holdem.prototype.TestFourOfAKind = function (hand, mainCards) {
        for (var key in this.test_summary.value) {
            if (this.test_summary.value[key].length == 4) {
                this.test_cache.four_of_a_kind = Number(key);
                return true;
            }
        }
    };
    //Straight of the same suit
    Holdem.prototype.TestStraightFlush = function (hand, mainCards) {
        if (this.test_cache.straight.result && this.test_cache.flush.result) {
            if (hand[this.test_cache.straight.start].suit == this.test_cache.flush.suit) {
                this.test_cache.straight_flush = true;
                return true;
            }
        }
    };
    //Straight flush from Ten to Ace
    Holdem.prototype.TestRoyalFlush = function (hand, mainCards) {
        return this.test_cache.straight_flush && hand[this.test_cache.straight.start].value == 10;
    };
    Holdem.prototype.computeHand = function (allcards, mainCards) {
        var _this = this;
        this.test_cache = {
            hicard: { suit: '', value: 0 },
            pair: { value: 0, index: -1 },
            two_pairs: {
                all_indices: [],
                pair_indices: []
            },
            three_of_a_kind: {
                value: 0,
                indices: []
            },
            four_of_a_kind: 0,
            straight: { result: false },
            flush: { result: false },
            straight_flush: false,
        };
        this.test_summary = {
            value: {},
            suit: {}
        };
        for (var i = 0; i < allcards.length; i++) {
            var suit = allcards[i].suit + '';
            var value = allcards[i].value;
            if (!this.test_summary.suit[suit])
                this.test_summary.suit[suit] = [i];
            else
                this.test_summary.suit[suit].push(i);
            if (!this.test_summary.value[value])
                this.test_summary.value[value] = [i];
            else
                this.test_summary.value[value].push(i);
        }
        var result = this.TestSeries.map(function (t, i) { return i == 0 ? t.fn.call(_this, allcards, mainCards) : (t.fn.call(_this, allcards, mainCards) ? (i + 14) : 0); }).sort(VASC).pop();
        return {
            name: this.TestSeries[Math.max(result - 14, 0)].name,
            value: result
        };
    };
    Holdem.prototype.compareHands = function (hands, community) {
        var _this = this;
        var ranks = hands.map(function (f, index) {
            var hand = f.concat(community);
            return __assign({}, _this.computeHand(hand, f), { index: index, cache: _this.test_cache, hand: hand });
        }).sort(exports.DESC);
        if (ranks[0].value > ranks[1].value) {
            var result = { type: "win", index: ranks[0].index, name: ranks[0].name };
            if (result.name == HAND_HICARD)
                result.suit = ranks[0].cache.hicard.suit;
            return result;
        }
        else {
            //console.log(ranks);
            var highest_rank_name_1 = ranks[0].name;
            var result = __assign({}, TieBreaker_1.TieBreaker[highest_rank_name_1](ranks.filter(function (r) { return r.name == highest_rank_name_1; })), { 
                //put the highest rank name
                name: highest_rank_name_1 });
            return result;
        }
    };
    return Holdem;
}());
exports.Holdem = Holdem;

},{"./TieBreaker":5}],5:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var BreakTieUsingHiCard = function (ranks) {
    var max_card_index = -1;
    var max_card_value = 0;
    var max_card_map = {};
    for (var i = 0; i < ranks.length; i++) {
        var hicard = ranks[i].cache.hicard.value;
        if (max_card_value <= hicard) {
            max_card_value = hicard;
            max_card_index = i;
            if (!max_card_map[max_card_value])
                max_card_map[max_card_value] = 1;
            else
                max_card_map[max_card_value]++;
        }
    }
    if (max_card_index >= 0) {
        if (max_card_map[max_card_value] == 1) {
            return { type: 'win', index: ranks[max_card_index].index, value: max_card_value };
        }
    }
    return { type: 'draw' };
};
exports.TieBreaker = {
    /**
     * When No Player Has Even A Pair, Then The Highest Card Wins. When Both Players Have Identical High Cards,
     * The Next Highest Card Wins, And So On Until Five Cards Have Been Used. In The Unusual Circumstance
     * That Two Players Hold The Identical Five Cards, The Pot Would Be Split.
     *
     */
    "Hi Card": BreakTieUsingHiCard,
    /**
     * If Two Or More Players Hold A Single Pair Then Highest Pair Wins. If The Pairs Are Of The Same Value,
     * The Highest Kicker Card Determines The Winner. A Second And Even Third Kicker Can Be Used If Necessary
     */
    "Pair": function (ranks) {
        var max_pair_index = -1;
        var max_pair_val = 0;
        var max_pair_counter = {};
        for (var i = 0; i < ranks.length; i++) {
            if (max_pair_val <= ranks[i].cache.pair.value) {
                max_pair_val = ranks[i].cache.pair.value;
                max_pair_index = i;
                if (!max_pair_counter['max' + max_pair_val])
                    max_pair_counter['max' + max_pair_val] = [i];
                else
                    max_pair_counter['max' + max_pair_val].push(i);
            }
        }
        if (max_pair_index >= 0) {
            if (max_pair_counter['max' + max_pair_val].length == 1) {
                return { type: 'win', index: ranks[max_pair_index].index, value: max_pair_val };
            }
            var candidates = max_pair_counter['max' + max_pair_val].map(function (m) {
                var pair_value = ranks[m].cache.pair.value;
                return __assign({}, ranks[m], { hand: ranks[m].hand.filter(function (f) { return f.value != pair_value; }) });
            });
            return exports.TieBreaker["Hi Card"](candidates);
        }
        return { type: 'draw' };
    },
    /**
     * The Highest Pair Is Used To Determine The Winner. If Two Or More Players Have The Same Highest Pair,
     * Then The Highest Of The Second Pair Determines The Winner. If Both Players Hold Identical Two Pairs,
     * The Fifth Card Is Used To Break The Tie.
     */
    "Two pairs": function (ranks) {
        for (var check_highest = 0; check_highest < 2; check_highest++) {
            var max_pair_index = -1;
            var max_pair_val = 0;
            var max_pair_counter = {};
            for (var i = 0; i < ranks.length; i++) {
                var _a = ranks[i].cache.two_pairs.pair_indices, pa = _a[0], pb = _a[1];
                var my_highest_pair_index = void 0;
                if (ranks[i].hand[pa].value < ranks[i].hand[pb].value) {
                    my_highest_pair_index = check_highest == 0 ? pb : pa;
                }
                else {
                    my_highest_pair_index = check_highest == 0 ? pa : pb;
                }
                if (max_pair_val <= ranks[i].hand[my_highest_pair_index].value) {
                    max_pair_val = ranks[i].hand[my_highest_pair_index].value;
                    max_pair_index = i;
                    if (!max_pair_counter['max' + max_pair_val])
                        max_pair_counter['max' + max_pair_val] = [i];
                    else
                        max_pair_counter['max' + max_pair_val].push(i);
                }
            }
            if (max_pair_index >= 0) {
                if (max_pair_counter['max' + max_pair_val].length == 1) {
                    return { type: 'win', index: ranks[max_pair_index].index, value: max_pair_val };
                }
            }
        }
        //compare the last card
        var max_hand_value = 0;
        var max_hand_index = -1;
        var max_hand_counter = {};
        var _loop_1 = function (i) {
            var hand = ranks[i].hand;
            ranks[i].cache.two_pairs.all_indices.sort(function (a, b) { return b - a; }).forEach(function (f) { return hand.splice(f, 1); });
            if (max_hand_value <= hand[0].value) {
                max_hand_index = i;
                max_hand_value = hand[0].value;
                if (!max_hand_counter['max' + max_hand_value])
                    max_hand_counter['max' + max_hand_value] = 1;
                else
                    max_hand_counter['max' + max_hand_value]++;
            }
        };
        for (var i = 0; i < ranks.length; i++) {
            _loop_1(i);
        }
        if (max_hand_index >= 0) {
            if (max_hand_counter['max' + max_hand_value] == 1)
                return { type: 'win', index: ranks[max_hand_index].index, value: max_hand_value };
        }
        return { type: 'draw' };
    },
    /**
     * If More Than One Player Holds Three Of A Kind, Then The Higher Value Of The Cards Used To Make
     * The Three Of A Kind Determines The Winner. If Two Or More Players Have The Same Three Of A Kind,
     * Then A Fourth Card (And A Fifth If Necessary) Can Be Used As Kickers To Determine The Winner.
     */
    "Three of a kind": function (ranks) {
        var max_pair_index = -1;
        var max_pair_val = 0;
        var max_pair_counter = {};
        for (var i = 0; i < ranks.length; i++) {
            var val = ranks[i].cache.three_of_a_kind.value;
            if (max_pair_val <= val) {
                max_pair_val = val;
                max_pair_index = i;
                if (!max_pair_counter['max' + max_pair_val])
                    max_pair_counter['max' + max_pair_val] = [i];
                else
                    max_pair_counter['max' + max_pair_val].push(i);
            }
        }
        if (max_pair_index >= 0) {
            if (max_pair_counter['max' + max_pair_val].length == 1) {
                return { type: 'win', index: ranks[max_pair_index].index, value: max_pair_val };
            }
            var candidates = max_pair_counter['max' + max_pair_val].map(function (m) {
                var pair_value = ranks[m].cache.three_of_a_kind.value;
                return __assign({}, ranks[m], { hand: ranks[m].hand.filter(function (f) { return f.value != pair_value; }) });
            });
            return exports.TieBreaker["Hi Card"](candidates);
        }
        return { type: 'draw' };
    },
    /**
     * A Straight Is Any Five Cards In Sequence, But Not Necessarily Of The Same Suit. If More Than
     * One Player Has A Straight, The Straight Ending In The Card Wins. If Both Straights End In A Card
     * Of The Same Strength, The Hand Is Tied.
     */
    "Straight": BreakTieUsingHiCard,
    /**
     * A Flush Is Any Hand With Five Cards Of The Same Suit. If Two Or More Players Hold A Flush,
     * The Flush With The Highest Card Wins. If More Than One Player Has The Same Strength High
     * Card, Then The Strength Of The Second Highest Card Held Wins. This Continues Through The Five
     * Highest Cards In The Player's Hands.
     */
    "Flush": BreakTieUsingHiCard,
    /**
     * When Two Or More Players Have Full Houses, We Look First At The Strength Of The Three Of A
     * Kind To Determine The Winner. For Example, Aces Full Of Deuces (AAA22) Beats Kings Full Of
     * Jacks (KKKJJ). If There Are Three Of A Kind On The Table (Community Cards) In A Texas Holdem
     * Game That Are Used By Two Or More Players To Make A Full House, Then We Would Look At The
     * Strength Of The Pair To Determine A Winner.
     */
    "Full House": function (ranks) {
        for (var check_3k = 0; check_3k < 2; check_3k++) {
            var max_3k_index = -1;
            var max_3k_val = -1;
            var max_3k_counter = {};
            for (var i = 0; i < ranks.length; i++) {
                var val = ranks[i].cache[check_3k == 0 ? 'three_of_a_kind' : 'pair'].value;
                if (max_3k_val <= val) {
                    max_3k_index = i;
                    if (!max_3k_counter[max_3k_val])
                        max_3k_counter[max_3k_val] = 1;
                    else
                        max_3k_counter[max_3k_val]++;
                }
            }
            if (max_3k_index >= 0) {
                if (max_3k_counter[max_3k_val] == 1) {
                    return { type: 'win', index: ranks[max_3k_index].index, value: max_3k_val };
                }
            }
        }
        return { type: 'draw' };
    },
    /**
     * This One Is Simple. Four Aces Beats Any Other Four Of A Kind, Four Kings Beats Four Queens
     * Or Less And So On. The Only Tricky Part Of A Tie Breaker With Four Of A Kind Is When The Four
     * Falls On The Table In A Game Of Texas Holdem And Is Therefore Shared Between Two (Or More)
     * Players. A Kicker Can Be Used, However, If The Fifth Community Card Is Higher Than Any Card
     * Held By Any Player Still In The Hand, Then The Hand Is Considered A Tie And The Pot Is Split.
     */
    "Four of a kind": function (ranks) {
        for (var check_4k = 0; check_4k < 2; check_4k++) {
            var max_4k_index = -1;
            var max_4k_val = 0;
            var max_4k_counter = {};
            var _loop_2 = function (i) {
                var val = ranks[i].cache.four_of_a_kind;
                if (check_4k == 1) {
                    try {
                        val = ranks[i].hand.filter(function (f) { return f.value != val; })[0].value;
                    }
                    catch (e) {
                        return "break";
                    }
                }
                if (max_4k_val <= val) {
                    max_4k_val = val;
                    max_4k_index = i;
                    if (!max_4k_counter[max_4k_val])
                        max_4k_counter[max_4k_val] = 1;
                    else
                        max_4k_counter[max_4k_val]++;
                }
            };
            for (var i = 0; i < ranks.length; i++) {
                var state_1 = _loop_2(i);
                if (state_1 === "break")
                    break;
            }
            if (max_4k_index >= 0) {
                if (max_4k_counter[max_4k_val] == 1)
                    return { type: 'win', index: ranks[max_4k_index].index, value: max_4k_val };
            }
        }
        return { type: 'draw' };
    },
    /**
     * Straight Flushes Come In Varying Strengths From Five High To A King High. A King High Straight
     * Flush Loses Only To A Royal. If More Than One Player Has A Straight Flush, The Winner Is The
     * Player With The Highest Card Used In The Straight. A Queen High Straight Flush Beats A Jack
     * High And A Jack High Beats A Ten High And So On. The Suit Never Comes Into Play I.E. A Seven
     * High Straight Flush Of Diamonds Will Split The Pot With A Seven High Straight Flush Of Hearts.
     */
    "Straight flush": BreakTieUsingHiCard,
    /**
     * An Ace-High Straight Flush Is Called Royal Flush. A Royal Flush Is The Highest Hand In Poker.
     * Between Two Royal Flushes, There Can Be No Tie Breaker. If Two Players Have Royal Flushes,
     * They Split The Pot.
     */
    "Royal flush": function (ranks) {
        return { type: 'draw' };
    }
};

},{}],6:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./Card":1,"dup":2}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("./Game");
exports.Game = Game_1.Game;
var Deck_1 = require("./Deck");
exports.Deck = Deck_1.Deck;
var Card_1 = require("./Card");
exports.Card = Card_1.Card;
exports.Suits = Card_1.Suits;

},{"./Card":1,"./Deck":2,"./Game":3}]},{},[7])(7)
});
