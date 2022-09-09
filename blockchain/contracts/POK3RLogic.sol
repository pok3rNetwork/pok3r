// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract POK3RLogic is Ownable {
    // Counter for handId
    using Counters for Counters.Counter;

    struct Deck {
        uint8[] cards;
    }

    struct Hand {
        bytes32 player0Card0IndexKeccak256;
        bytes32 player0Card1IndexKeccak256;
        bytes32 player1Card0IndexKeccak256;
        bytes32 player1Card1IndexKeccak256;
        uint8[] player0FulfilledCards;
        uint8[] player1FulfilledCards;
        uint8 currentPlayerTurn;
        address[] players;
        address player0;
        address player1;
        bool isStarted;
        bool isPreStarted;
        bool player0Accepts;
        bool player1Accepts;
        bool isStale;
        bool isRequestingRandomness;
        bool isWithdrawn;
        bool isFinished;
        bool isWinningsRetrieved;
        address handWinner;
        uint256 betAmount;
        Deck deck;
        uint256 handId;
    }

    mapping(uint256 => Hand) public handIdToHand;
    mapping(address => uint256) public playerToHandId;
    mapping(address => uint256) public requestedPlayerToHandId;
    mapping(address => bool) public isPlaying;

    Counters.Counter public handCounter;

    constructor() payable {
        /// Increment hand counter to leave 0th index hand as dummy hand for playerToHand map
        handCounter.increment();
    }

    modifier isNotPlaying(address player) {
        require(
            isPlaying[player],
            "Error: In v1, you can only play one hand at a time."
        );
        _;
    }

    modifier isPlayingM(address player) {
        require(
            !isPlaying[player],
            "Error: To perfrom this action you must be in a hand."
        );
        _;
    }

    function requestGameWithPlayer(address otherPlayer)
        public
        payable
        isNotPlaying(msg.sender)
    {
        require(
            msg.value > 0.001 ether,
            "Error: Sorry, we have to pay the bills around here. The min bet is 0.001 ether."
        );

        uint256 handId = handCounter.current();
        Deck memory deck = Deck(new uint8[](0));
        Hand memory hand = Hand(
            0x0000000000000000000000000000000000000000000000000000000000000000,
            0x0000000000000000000000000000000000000000000000000000000000000000,
            0x0000000000000000000000000000000000000000000000000000000000000000,
            0x0000000000000000000000000000000000000000000000000000000000000000,
            new uint8[](0),
            new uint8[](0),
            0,
            new address[](0),
            msg.sender,
            otherPlayer,
            false,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            0x0000000000000000000000000000000000000000,
            msg.value,
            deck,
            handId
        );

        handIdToHand[handId] = hand;
        isPlaying[msg.sender] = true;
        playerToHandId[msg.sender] = handId;
        requestedPlayerToHandId[otherPlayer] = handId;
        handCounter.increment();
    }

    function foldHand() public isPlayingM(msg.sender) {
        isPlaying[msg.sender] = false;

        Hand storage hand = handIdToHand[playerToHandId[msg.sender]];

        hand.isFinished = true;

        // Other player wins
        if (hand.player0 == msg.sender) {
            hand.handWinner = hand.player1;
        } else {
            hand.handWinner = hand.player0;
        }

        playerToHandId[msg.sender] = 0;
    }

    function acceptGameRequeset() public payable isNotPlaying(msg.sender) {
        Hand storage hand = handIdToHand[requestedPlayerToHandId[msg.sender]];
        require(
            hand.betAmount == msg.value,
            "Error: Please send the required bet amount. You can view this on our website or on the solidity contract."
        );

        hand.player1Accepts = true;
        hand.isStarted = true;
    }

    /// Dev
    /// Commit the hashes of (Player Address + Card Index + random salt) which will be revelased after the hand
    /// the card index corresponds to the index of cards in a ranomdly shuffled 52 card deck
    /// returned from Chainlink VRF
    /// Therefore, we can prove that we did not know what cards each player will have ahead of the hand starting
    /// However, once the hand starts, we, and the player, will know their hands.
    /// Thus, there is an assumption of trust that we as the casino are not feeding
    /// the other player the hands.
    /// We will work on solving this issue moving forward.
    function commitCardHashes(
        bytes32 player0Card0IndexKeccak256,
        bytes32 player0Card1IndexKeccak256,
        bytes32 player1Card0IndexKeccak256,
        bytes32 player1Card1IndexKeccak256
    ) public onlyOwner {}

    /// Chainlink VRF will call this function with two random uint256 numbers
    /// which we will turn into a shuffled deck of 52 cards,
    /// from which we will randomly deal 2 cards to each player,
    /// and 5 cards for the board.
    function assignDeckToHand() public {}

    function rakeInWinnings() public payable isPlayingM(msg.sender) {
        Hand storage hand = handIdToHand[playerToHandId[msg.sender]];
        require(hand.isFinished, "Error: This hand is not over.");
        require(
            hand.isWinningsRetrieved,
            "Error: This hand's winnings have already been retrieved."
        );
        require(
            hand.handWinner == msg.sender,
            "Error: You have not won this hand."
        );
        hand.isWinningsRetrieved = true;
        (bool sent, ) = address(payable(msg.sender)).call{
            value: hand.betAmount
        }("");
        require(sent, "Failed to send Ether.");
        return;
    }
}
