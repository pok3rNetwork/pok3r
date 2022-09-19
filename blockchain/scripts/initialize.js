async function initialize(signers, token, LobbyTracker) {
  for await (signer of signers) {
    await token.connect(signer).quickMint();
    const balance = await token.balanceOf(signer.address);
    await token.connect(signer).approve(LobbyTracker.address, balance);
    await LobbyTracker.connect(signer).deposit(balance);
    await LobbyTracker.connect(signer).createLobby(20, 1000, 12);
  }

  console.log('\nTest Tokens Minted, Approved, & Deposited\n');
}

module.exports = initialize;
