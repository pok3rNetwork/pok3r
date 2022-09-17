// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./DepositTracker.sol";

contract LobbyTracker is DepositTracker {
    struct Lobby {
        bool waiting;
        bool active;
        address[] players;
        uint[] deposits;
        uint minBet;
    }

    mapping(uint => Lobby) public lobbies;
    uint public numLobbies;

    constructor(address _tokenAddress) DepositTracker(_tokenAddress) {}

    // LOBBY CREATION
    function createLobby(uint minBet, uint deposit) public {
        require(deposit <= deposits[msg.sender], "deposit > inEscrow");
        require(minBet <= deposit, "deposit < minBet");
        deposits[msg.sender] -= deposit;
        numLobbies++;
        Lobby storage thisLobby = lobbies[numLobbies];
        thisLobby.waiting = true;
        thisLobby.players.push(msg.sender);
        thisLobby.deposits.push(deposit);
        thisLobby.minBet = minBet;
    }

    // LOBBY VIEWER
    function lobby(uint id) internal view returns (Lobby memory) {
        return lobbies[id];
    }

    function isJoinable(uint id, address player) public view returns (bool) {
        (bool isPlayer, , , ) = stat(id, player);
        if (
            lobby(id).players.length >= 12 ||
            lobby(id).players.length == 0 ||
            lobby(id).active ||
            lobby(id).waiting == false ||
            isPlayer ||
            deposits[player] < lobby(id).minBet
        ) return false;
        else return true;
    }

    function activePlayers(uint id) public view returns (uint) {
        uint players = 0;

        for (uint i; i <= lobby(id).deposits.length - 1; i++) {
            if (lobby(id).deposits[i] > 0) players++;
        }

        return players;
    }

    function leader(uint id) public view returns (address) {
        address leadPlayer;
        uint deposit;

        for (uint i; i <= lobby(id).deposits.length - 1; i++) {
            uint thisDeposit = lobby(id).deposits[i];
            if (thisDeposit >= deposit) {
                leadPlayer = lobby(id).players[i];
                deposit = thisDeposit;
            }
        }

        return leadPlayer;
    }

    function inProgress(uint id) public view returns (bool) {
        if (lobby(id).active == false) return false;
        return activePlayers(id) > 1;
    }

    function stat(uint id, address player)
        public
        view
        returns (
            bool isPlayer,
            uint playerId,
            uint deposit,
            bool isLeading
        )
    {
        if (lobby(id).players.length > 0) {
            for (uint i; i <= lobby(id).players.length - 1; i++) {
                if (player == lobby(id).players[i]) {
                    isPlayer = true;
                    playerId = i;
                    isLeading = true;
                    deposit = lobby(id).deposits[i];
                    for (uint j; j <= lobby(id).players.length - 1; j++) {
                        if (lobby(id).deposits[i] > deposit) isLeading = false;
                    }
                }
            }
        } else {
            isPlayer = false;
            playerId = 0;
            deposit = 0;
            isLeading = false;
        }
    }

    // LOBBY EXPLORER
    function joinableLobbies()
        public
        view
        returns (Lobby[] memory, uint[] memory)
    {
        uint amount;
        for (uint i = 1; i <= numLobbies; i++) {
            if (isJoinable(i, msg.sender)) amount++;
        }

        uint[] memory ids = new uint[](amount);
        Lobby[] memory result = new Lobby[](amount);
        uint index;
        for (uint i = 1; i <= numLobbies; i++) {
            if (isJoinable(i, msg.sender)) {
                result[index] = lobby(i);
                ids[index] = i;
                index++;
            }
        }

        return (result, ids);
    }

    function activeLobbies()
        public
        view
        returns (Lobby[] memory, uint[] memory)
    {
        uint amount;
        for (uint i = 1; i <= numLobbies; i++) {
            if (inProgress(i)) amount++;
        }

        uint[] memory ids = new uint[](amount);
        Lobby[] memory result = new Lobby[](amount);
        uint index;
        for (uint i = 1; i <= numLobbies; i++) {
            if (inProgress(i)) {
                result[index] = lobby(i);
                ids[index] = i;
                index++;
            }
        }

        return (result, ids);
    }

    // LOBBY ACTIONS
    function joinLobby(uint lobbyId, uint deposit) public {
        require(isJoinable(lobbyId, msg.sender), "Not Joinable");
        require(deposit >= lobby(lobbyId).minBet, "deposit < minBet");

        deposits[msg.sender] -= deposit;
        lobbies[lobbyId].players.push(msg.sender);
        lobbies[lobbyId].deposits.push(deposit);
    }

    function increaseDeposit(uint lobbyId, uint amount) public {
        (bool isPlayer, uint playerId, uint deposit, ) = stat(
            lobbyId,
            msg.sender
        );

        require(isPlayer && deposit > 0, "!activePlayer");

        deposits[msg.sender] -= amount;
        lobbies[lobbyId].deposits[playerId] += amount;
    }

    // to leave mid-game, see ejectPlayer method
    function leaveLobby(uint lobbyId) public {
        (bool isPlayer, uint playerId, uint deposit, ) = stat(
            lobbyId,
            msg.sender
        );

        require(isPlayer, "!player");
        require(
            lobby(lobbyId).active == false && lobby(lobbyId).waiting == true,
            "gameActive"
        );

        deposits[msg.sender] += deposit;

        if (activePlayers(lobbyId) == 1) {
            delete lobbies[lobbyId];
        } else {
            uint amount = lobbies[lobbyId].deposits.length;
            uint[] memory lobbyDeposits = new uint[](amount - 1);
            address[] memory players = new address[](amount - 1);
            uint index;

            for (uint i; i <= amount - 1; i++) {
                if (i != playerId) {
                    lobbyDeposits[index] = lobby(lobbyId).deposits[i];
                    players[index] = lobby(lobbyId).players[i];
                    index++;
                }
            }

            lobbies[lobbyId].deposits = lobbyDeposits;
            lobbies[lobbyId].players = players;
        }
    }

    function startGame(uint id) public onlyOwner {
        require(
            activePlayers(id) > 1 &&
                lobby(id).active == false &&
                lobby(id).waiting == true,
            "inappropriateTiming"
        );
        lobbies[id].active = true;
        lobbies[id].waiting = false;
    }

    // Have the client send a withdrawal claim to the backend to fulfill request if the person wants to leave early
    // Cannot leave lobby mid round
    function ejectPlayer(uint lobbyId, address player) public onlyOwner {
        (bool isPlayer, uint playerId, uint deposit, bool isLeading) = stat(
            lobbyId,
            player
        );

        require(isPlayer == true && deposit > 0, "!activePlayer");
        require(lobby(lobbyId).waiting == false, "inappropriateTiming");

        uint cut = deposit / 1000;
        uint take = deposit - cut;

        uint numPlayers = activePlayers(lobbyId);

        if (isLeading || (inProgress(lobbyId) && numPlayers > 2)) {
            deposits[player] += take;
            deposits[msg.sender] += cut;
        } else deposits[player] += deposit;

        lobbies[lobbyId].deposits[playerId] = 0;

        // end the game
        if (numPlayers == 2) ejectPlayer(lobbyId, leader(lobbyId));
        else if (numPlayers == 1) lobbies[lobbyId].active = false;
    }

    function abortGame(uint id) public onlyOwner {
        address[] memory players = lobby(id).players;

        for (uint i; i <= players.length - 1; i++) {
            address thisPlayer = players[i];
            deposits[thisPlayer] += lobby(id).deposits[i];
            lobbies[id].deposits[i] = 0;
        }

        lobbies[id].active = false;
    }

    // fired after every round
    function disseminate(
        uint id,
        bool[] memory increment,
        uint[] memory amount
    ) public onlyOwner {
        require(
            lobby(id).waiting == false && lobby(id).active == true,
            "inappropriateTiming"
        );
        require(
            amount.length == increment.length &&
                amount.length == lobby(id).players.length,
            "badRequest"
        );

        for (uint i; i <= amount.length - 1; i++) {
            if (increment[i] == true) lobbies[id].deposits[i] += amount[i];
            else lobbies[id].deposits[i] -= amount[i];
        }

        if (activePlayers(id) == 1) ejectPlayer(id, leader(id));
    }
}
