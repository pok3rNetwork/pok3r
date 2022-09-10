# POK3R Network

>P2P Multiplayer Poker Powered by Web3

  [![Status](https://img.shields.io/badge/status-work--in--progress-success.svg)]()
  [![GitHub Issues](https://img.shields.io/github/issues/pok3rNetwork/pok3r.svg)](https://github.com/pok3rNetwork/pok3r/issues)
  [![GitHub Pull Requests](https://img.shields.io/github/issues-pr/pok3rNetwork/pok3r.svg)](https://github.com/pok3rNetwork/pok3r/pulls)
  [![License](https://img.shields.io/bower/l/bootstrap)]()

---

## Objective

Online gambling has exploded into a [$50b industry](https://www.grandviewresearch.com/industry-analysis/online-gambling-market) over the recent years and you may have seen the, just as recent, takeover of sports or twitch advertising by online betting or gambling platforms. Additionally [California's Proposition 27](https://lao.ca.gov/BallotAnalysis/Proposition?number=27&year=2022) is on the ballot; which would allow online & mobile sports wagering outside of tribal lands on the condition that tribes & casinos contribute funds toward state efforts to address homelessness. We feel that blockchain can solve issues in this space before they arise by keeping things transparent and verifiably random (where applicable).

To meet this surge in demand, we are making POK3R! It's a multiplayer, on-chain decentralized poker game with video feeds. While half of the game is simply playing your cards right, the other half is also being able to read your opponent's face and fake them out! Watch whales duke it out live or watch previously broadcasted matches as VODs and cheer them on in the chat.

---

## Features

### Priority Sponsor Integrations

> Potential prizes we may qualify for

#### Streaming & Storage Layer

##### IPFS & Filecoin

- Storage Wizard || Top 3 ($3k)

The best use of NFT.storage or web3.storage to use IPFS for content addressing and Filecoin for persistent, decentralized storage. Use of other tooling may also [qualify](https://ecosystem-wg.notion.site/Filecoin-IPFS-Hackathon-Judging-Criteria-fb29da31431c4c8da1be6c30e1d0ef82).

- Prize Pool || $500 x 25

##### Livepeer

- [LivePeer Studio](http://livepeer.studio/) Integration || ($5k, $3k, $2k)

Wow us with the best hacks using Livepeer Studio’s video Livestream or On Demand API in web3 gaming, metaverse, social, or creator applications.

Projects will be evaluated based on the following criteria:

1. Technicality: What is the complexity of the problem being addressed and your approach to solving it?
2. Originality: Are you tackling a new or unsolved problem, or creating unique solutions to an existing problem?
3. Practicality: How complete/functional is your project? Is it ready to be used by your intended audience?
4. UI/UX/DX: Is your app pleasant and/or intuitive to use? Have your team made a good effort at removing friction for the user?
5. Wow factor: Standout that deserves to be recognized!

#### EVM Layer

##### Polygon

- Scale your Decentralized applications on Polygon || ($5k, $3k, $2k)

- Best innovative dapp built on Polygon || ($3k)

- Prize Pool || $1k x 5

#### Communications & Messaging Layer

##### EPNS

- General Integration || ($4k, $2.5K, $1.5K, $400 x 5)

##### StreamrNetwork

- General Integration || ($2.5k, $1.5k, $1k)

#### Identity Providers

##### ENS

- General Integration || ($3k, $2k x 2, $1.5k x 2)

##### Unstoppable Domains

- Best use of Login with Unstoppable || ($1.5k + $1k credits, $1k + $750 credits, $700 + $500 credits, $300 x 6)

#### General Utility

##### QuickNode

- General Integration || ($2.5k, $1.5k, $1k)

##### Spruce

- Sign-In with Ethereum for a meaningful workflow in an application || ($1k)
- projects that integrate and use Sign-In with Ethereum || ($500 x 2)
- Meaningful Contribution to their library || ($1k)

### Roadmap

> Loose roadmap that outlines our path to the final product.

#### V1 - MVP

Game (More Backend, Less Solidity)

- off-chain logic (query REST api for game state information)
- on-chain escrow contract (owned & administered by same server)
- takes USDC Only
- house takes a cut of the bets
- handle 2 to 14 players (target: 6)

Frontend

- rainbow kit for Unstoppable Domains x ENS integration
- user can select which NFT to use for display by clicking their profile
- user can join OR start a game with a lobby code

Integrations (Up to $12.5k + $1000 in UD credits)

- Polygon
- ENS
- Unstoppable Domains
- QuickNode

#### V2 - Introducing Live Video & More Trustless Operation

Game (Less Backend, More Solidity)

- on-chain game logic (RNG by chainlink VRF)
- encrypted game state data (query by frontend to update clients)
- general ERC20 support (the lobby owner decides what ERC20 everyone buys in with)
- backend acts as fiduciary, wherever needed (scope to be determined)

Backend

- live video feeds (via wrtc)
- receive simultaneous video streams from frontend
- recombine into a single, aggregated lobby stream to deliver to all players
- optional: store a replay (and compress these recordings) on IPFS

Frontend

- live video feeds (via wrtc)
- stream video to REST server from frontend
- receive a single, aggregated lobby stream from backend (instead of (lobby.players).length)
- optional (if backend stores replay): download saved replays from User Profile page
- optional: replace rainbowkit with spruce but maintain Unstoppable Domains x ENS integrations

Integrations (Up to $5k)

- Spruce
- IPFS

#### V3 - (e)Sports Streaming & Betting

Game

- No game mechanics changes
- more read-only functions for the frontend (optimization)
- LivePeer integration (users need to place a minimum deposit of $10k USDC)
- excess is returned post-match
- audience betting handler

Backend

- store a replay (and compress these recordings) on IPFS
- store a replay on IPFS x LivePeer as NFTs w/ winning hand as the thumbnail (for a fee)
- use team account to cover the cost of streaming for public matches on LivePeer
- monitor game contract for LivePeer opt-in + payment
- submit a receipt to game contract for LivePeer deposit usage to allow refund

Frontend

- download saved replays from User Profile page
- public match browser
- StreamrNetwork pub/sub messaging for audience chatter
- place bets from match view
- EPNS "Match" & "Audience Betting" Notifications

Integrations (Up to $11.5k)

- EPNS
- StreamrNetwork
- LivePeer

### Total Potential Sponsorship Prizes

entire team prize || $26k + $1k in UD Credits

individual payout || $6.5k + $250 in UD Credits

> comparable to $40/hour or $78k salary

### Additional Thoughts (Roadmap V4)

- Valist to license to casinos? ($1k)
- The Graph($1.7k, $800) for... something (new subgraph or best use of existing)?
- Aut for game disputes ($5k) x Sismo for anti-sybil ($1.5k)

Worldcoin KYC

1. 🥇 $4k to the Best overall
2. 🧑‍⚖️ $3k to the Best governance app
3. 🤝 $3k to the Best social app
4. 🧞 $3k to the most creative use case
5. ✨ Up to 4x $1k to Honorable mentions
6. 🏊 $3k Prize Pool - distributed equally among all qualifying submissions

## CICD

### Pipeline Flow

1. developers make a FEATURE branch called "nickname-dev" or "nickname-dev-featurename"
2. these branches are pushed to "staging" after pull request & approvals/ peer review
3. staged features are then pushed to "production" or "main" when downtime is acceptable
4. the production branch autodeploys to the live environment after pushing

### Applications

- Vercel
- GitLab Runner?
- Docker?
