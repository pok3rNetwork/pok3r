/* eslint-disable jest/valid-expect */
const { ethers } = require('hardhat');
const { assert, expect } = require('chai');

describe('LobbyTracker - Ideal Scenarios', () => {
  let LobbyTracker, nfd;
  let deployer, clients; // eslint-disable-line no-unused-vars
  const null_addr = '0x0000000000000000000000000000000000000000';

  beforeEach(async () => {
    // Get ContractFactory and Signers
    [deployer, tosser, spare, ...clients] = await ethers.getSigners();
    clients = clients.slice(0, 11);

    const CoinFactory = await ethers.getContractFactory('nfd'); // non-fungible dollars
    nfd = await CoinFactory.connect(deployer).deploy();

    const LobbyTrackerFactory = await ethers.getContractFactory('LobbyTracker');
    LobbyTracker = await LobbyTrackerFactory.connect(deployer).deploy(
      nfd.address
    );

    for await (const client of clients) {
      await nfd.connect(client).quickMint();
      await nfd
        .connect(client)
        .approve(LobbyTracker.address, nfd.balanceOf(client.address));
    }

    await nfd.connect(tosser).quickMint();
    await nfd
      .connect(tosser)
      .approve(LobbyTracker.address, nfd.balanceOf(tosser.address));

    await nfd.connect(spare).quickMint();
    await nfd
      .connect(spare)
      .approve(LobbyTracker.address, nfd.balanceOf(spare.address));
  });

  describe('DepositTracker', () => {
    it('Should Allow NFD Deposits', async () => {
      for await (const client of clients) {
        await LobbyTracker.connect(client).deposit(10000);
        expect((await LobbyTracker.deposits(client.address)) == 10000);
      }
    });

    it('Should Allow NFD Withdrawals', async () => {
      for await (const client of clients) {
        await LobbyTracker.connect(client).deposit(10000);
        await LobbyTracker.connect(client).withdraw(10000);
        expect((await LobbyTracker.deposits(client.address)) == 0);
      }
    });
  });

  describe('LobbyTracker', () => {
    beforeEach(async () => {
      await LobbyTracker.connect(tosser).deposit(10000);
      await LobbyTracker.connect(spare).deposit(10000);
      for await (const client of clients) {
        await LobbyTracker.connect(client).deposit(10000);
      }
    });

    it('Should take from the deposit when creating a lobby', async () => {
      let numLobbies = 0;
      for await (const client of clients) {
        await LobbyTracker.connect(client).createLobby(20, 1000, 12);
        expect((await LobbyTracker.deposits(client.address)) == 9000);
        expect((await LobbyTracker.numLobbies()) == numLobbies);
        numLobbies += 1;
      }
    });

    it('Should take from the deposit when joining a lobby', async () => {
      await LobbyTracker.connect(tosser).createLobby(20, 1000, 12);

      for await (const client of clients) {
        await LobbyTracker.connect(client).joinLobby(1, 1000);
        expect((await LobbyTracker.deposits(client.address)) == 9000);
      }
    });

    it('Should allow feeless exit from waiting lobbies', async () => {
      await LobbyTracker.connect(tosser).createLobby(20, 1000, 12);

      for await (const client of clients) {
        await LobbyTracker.connect(client).joinLobby(1, 1000);
        expect((await LobbyTracker.deposits(client.address)) == 9000);
      }

      for await (const client of clients) {
        await LobbyTracker.connect(client).leaveLobby(1);
        expect((await LobbyTracker.deposits(client.address)) == 10000);
      }

      await LobbyTracker.connect(tosser).leaveLobby(1);
      expect((await LobbyTracker.deposits(tosser.address)) == 10000);
    });

    it('Should allow people to increase their deposits', async () => {
      await LobbyTracker.connect(tosser).createLobby(20, 1000, 12);

      for await (const client of clients) {
        await LobbyTracker.connect(client).joinLobby(1, 1000);
        await LobbyTracker.connect(client).increaseDeposit(1, 9000);
        expect((await LobbyTracker.deposits(client.address)) == 0);
      }

      await LobbyTracker.connect(tosser).increaseDeposit(1, 9000);
      expect((await LobbyTracker.deposits(tosser.address)) == 0);
    });

    it('Should allow the Owner to start the game', async () => {
      await LobbyTracker.connect(tosser).createLobby(20, 1000, 12);

      for await (const client of clients) {
        await LobbyTracker.connect(client).joinLobby(1, 1000);
      }

      await LobbyTracker.connect(deployer).startGame(1);
    });

    it('Should allow the Owner to abort the game', async () => {
      await LobbyTracker.connect(tosser).createLobby(20, 1000, 12);
      for await (const client of clients) {
        await LobbyTracker.connect(client).joinLobby(1, 1000);
      }
      await LobbyTracker.connect(deployer).startGame(1);

      await LobbyTracker.connect(deployer).abortGame(1);

      for await (const client of clients) {
        expect((await LobbyTracker.deposits(client.address)) == 10000);
      }
      expect((await LobbyTracker.deposits(tosser.address)) == 10000);
    });

    it('Should allow the Owner to facilitate the game', async () => {
      await LobbyTracker.connect(tosser).createLobby(20, 1000, 12);
      for await (const client of clients) {
        await LobbyTracker.connect(client).joinLobby(1, 1000);
      }
      await LobbyTracker.connect(deployer).startGame(1);

      await LobbyTracker.connect(deployer).disseminate(
        1,
        [
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
      );

      for await (const client of clients) {
        expect((await LobbyTracker.deposits(client.address)) == 9000);
      }

      const cut = parseInt(11000 / 1000);
      const winnings = 11000 - cut;
      expect((await LobbyTracker.deposits(tosser.address)) == 9000 + winnings);
      expect((await LobbyTracker.deposits(deployer.address)) == cut);
    });
  });
});
