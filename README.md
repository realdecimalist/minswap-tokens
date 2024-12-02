# 😽 Minswap tokens

## Overview

The merge of deprecated verified-tokens and market cap repositories, which contains a list of tokens, exposes APIs for transparent access to circulating supply and total supply.

As of latest update, we consider `circulating = maxSupply - treasury - burn` and `total = maxSupply - burn` as standard formulas for calculating marketcap information.

In cases where `circulatingOnChain` is provided directly according to the asset's quantity on-chain or through external APIs, the `circulating` is the value of `circulatingOnChain`.

For tokens providing with `treasuryOnChain`, the `circulating` is the quantity of the address containing the assets. In default, the amount is retrieved from the oldest address from the blockchain's point of view.

## How to add my token

### Requirements

As token verification prerequisites, ensure your token has:

- A pool with at least **1000 ADA TVL**,
- A post of your policy ID on Twitter or your policy ID displayed on your landing page,
- A logo added in the [Cardano Token Registry](https://github.com/cardano-foundation/cardano-token-registry) or CIP-68 metadata.

For tokens to be verified:

1. Create a transaction transfer **100 ADA** to Minswap wallet receiving token verification fee below. This fee appears as the cost for lifetime maintain this repository.
2. Metadata includes: **the last 4 numbers of asset's policyId and asset's ticker** (for example, Verify 70c6 MIN).
3. Attach the transaction hash to a comment in the yaml file pull request (instructions below).

Minswap wallet receiving token verification fee: `addr1q85g6fkwzr2cf984qdmntqthl3yxnw4pst4mpgeyygdlnehqlcgwvr6c9vmajz96vnmmset3earqt5wl0keg0kw60eysdgwnej`

Any token that has been verified does **not** meet the requirements in the future would still be unverified.

### Create pull request

Create a pull request adding yaml file according to the following structure in the `src/tokens`:

```yaml
# 1 token = 1 yaml file
# filename/assetId: policyId + hex-coded token name

project: Minswap
# among DeFi, RealFi, GameFi, Meme, Bridge, Metaverse, Wallet, NFT, Oracle, AI, Launchpad, DAO, Stablecoin, Social, Media, Risk Ratings, Index Vaults, DePIN, Other
categories:
  - DeFi
  - DAO

decimals: 0
# not required, among website, twitter, discord, telegram, coinMarketCap, coinGecko, only endpoints with SSL (HTTPs) are approved
socialLinks:
  website: https://
  discord: ...

verified: true # default true, if a token violate verification policy then switch to false

# the following fields are not required
# for `big number`, it's a big number with no decimals. For example, if your token has a max supply of 50,000,000 tokens with 6 decimals, the value needs to be 50000000 × 10^6 = 50000000000000
# for `URIs`, currently only URI which returns a big number (no decimals) are supported
maxSupply: big number
# or
maxSupply: https://...

treasury:
  - big number
  - addr...
  - stake...
  - https://...
  - assetId

burn:
  - big number
  - addr...
  - stake...
  - https://...
  - assetId

circulatingOnChain:
  - big number
  - addr...
  - stake...
  - https://...
  - assetId

treasuryOnChain: addr...
```

Alternatively, create an issue with above information and our team will update accordingly. However, please note that the pull request will be processed faster.
Our team will verify and approve in first-in-first-out order.

## Usage

```ts
import {
  BlockFrostAdapter,
  MarketCapAPI,
  TokenAPI,
} from "@minswap/minswap-tokens";

const MIN_TOKEN =
  "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e";

// getting token info
const tokenApi = new TokenAPI();

const minTokenInfo = await tokenApi.getToken(MIN_TOKEN);

console.log(minTokenInfo);

// getting Market Cap info
const blockFrostAdapter = new BlockFrostAdapter({
  projectId: "<your_project_id_here>",
  requestTimeout: 20_000,
});

const marketCapApi = new MarketCapAPI(blockFrostAdapter);

const minMarketCapInfo = await marketCapApi.getMarketCapInfo(minTokenInfo);
console.log(minMarketCapInfo);
// { circulating: '240813714.66121483', total: '5000000000' }
```
