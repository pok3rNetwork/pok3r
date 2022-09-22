const maxUint =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';

async function getTokens(signer, token, LobbyTracker) {
  const tkn = token.connect(signer);
  console.log('minting');
  await (await tkn.quickMint()).wait(1);

  console.log('approving');
  await (await tkn.approve(LobbyTracker.address, maxUint)).wait(1);
}

async function depositTokens(signer, token, LobbyTracker) {
  const lt = LobbyTracker.connect(signer);
  const balance = await token.balanceOf(signer.address);
  console.log('depositing');
  await (await lt.deposit(balance)).wait(1);
  console.log('creating lobby');
  await (await lt.createLobby(20, 1000, 12)).wait(1);
}

async function initSigner(signer, token, LobbyTracker) {
  console.log(`\nInitializing ${signer.address}`);
  await getTokens(signer, token, LobbyTracker);
  await depositTokens(signer, token, LobbyTracker);
  console.log('success');
}

async function initialize(signers, token, LobbyTracker) {
  for await (signer of signers) {
    await initSigner(signer, token, LobbyTracker);
  }

  console.log(`\njoining lobby(1) from ${signers[1].address}`);
  await (await LobbyTracker.connect(signers[1]).joinLobby(1, 1000)).wait(1);

  console.log('\nTest Tokens Minted, Approved, & Deposited\n');
}

module.exports = initialize;
