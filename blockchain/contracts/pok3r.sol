// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.16;

// import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./POK3RVRF.sol";

// contract POK3R is POK3RVRF {
//     // Safe hand and request counter
//     

//     // Player hand info
//     struct playerHand {
//         bool isPlayer0;
//         uint256 handId;
//     }

//     // Enum hand state
//     enum handState {
//         notStarted,
//         preFlop,
//         flop,
//         turn,
//         river,
//         finished
//     }

//     // Hand info
//     struct Hand {
//         uint8[] player0Cards;
//         uint8[] player1Cards;
//         uint8[] boardCards;
//         address currentPlayerTurn;
//         address player0;
//         address player1;
//         bool isStarted;
//         bool isRequestingRandomness;
//         bool isFinished;
//         uint256 potAmount;
//         handState handState;
//         bool playerHasTimedOut;
//         address handWinner;
//         uint256 handId;
//         uint256 timeoutTimer;
//         uint256 VRFTimeoutTimer;
//     }

//     // Bet limits
//     uint256 minBet = 0.1 ether;
//     uint256 maxBet = 10 ether;

//     // Hand counter
//     Counters.Counter public handCounter;

//     // Players can only play one hand
//     mapping(address => bool) public isPlaying;

//     // Track player hands
//     struct playerHand {
//         bool isPlayer0;
//         uint256 handId;
//     }

//     // Map player hands
//     mapping(address => playerHand) public _playerHand;

//     // Map whos playing in which hand
//     mapping(uint256 => address[]) public handOwners;

//     // Access hand info from handId
//     mapping(uint256 => Hand) public handIdToHand;

//     modifier onlyHandOwners(uint256 _handId) {
//         // Only hand owners can interact with hands
//     }

//     modifier onlyPlayableHand(uint256 _handId) {
//         // Only hands that have started but not finished may be interacted with
//     }

//     modifier onlyPlayer0(uint256 _handId) {
//         // It's player0's turn, only he can act
//     }

//     modifier onlyPlayer1(uint256 _handId) {
//         // It's player1's turn, only he can act
//     }

//     modifier onlyNotRequestingRandomness(uint256 _handId) {
//         // A hand is locked while it's requesting randomness
//     }

//     modifier onlyBetWithinLimits() {
//         // Players may only bet within set limits
//     }

//     modifier onlyPlayOneHand() {
//         // Players may only play 1 hand at a time
//     }

//     modifier onlyAlreadyPlaying() {
//         // Players may only call,raise,fold,etc. while they are in a hand
//     }

//     function requestGameWithPlayer(address otherPlayer, uint256 betAmount) public {
//         // Request to play a game with address otherPlayer
//         // if both players request each other within
//         // 30 minutes, and have equal bet amounts, 
//         // then a game is initiated and money is not returned
//     }

//     function returnBetFromNotStartedGame() public {
//         // If player request a game and was not accepted,
//         // they can get their initial bet back after 30 minutes
//     }

//     function dealHoleCards(uint256 handId) onlyHandOwners(handId) public {
//         // Start game and deal hole cards
//     }

//     function dealFlop(uint256 handId) public {
//         // Deal the flop after both players are done preFlop
//     }

//     function dealTurn(uint256 handId) public {
//         // Deal the turn after both players are done floop
//     }

//     function dealRiver(uint256 handId) public {
//         // Deal river after both players are done 
//     }

//     function bet() {}

//     function check() {}

//     function call() {}

//     function raise() {}

//     function goAllIn() {}

//     function fold() {}

//     function resolveHand() {
//         // After hand is over, calculate who won the hand
//         // Take our 1% cut from the hand pot
//         // Give the winner 99% money in the pot
//     }

//     function timeoutOtherPlayer() {
//         // A player has 30 minutes to make an action when it's their turn 
//         // if the 30 minutes pass and the player has not acted
//         // the other player immediately wins the whole pot
//     }

//     function resetHandIfVRFBroken() {
//         // After VRF is requested, there is a 30 minute timer to 
//         // fulfill it. 
//         // If for whatever reason, Chainlink VRF is broken, 
//         // and a request is not fulfilled, 
//         // then the players each receive 50% from the pot
//     }



// }