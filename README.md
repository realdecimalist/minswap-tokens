# Minswap tokens

## Overview

The merge of deprecated verified-tokens and market cap repositories, which contains a list of tokens, exposes APIs for transparent access to circulating supply and total supply.

As of latest update, we consider `circulating = maxSupply - treasury - burn` and `total = maxSupply - burn` as standard formulas for calculating marketcap information.

In cases where `circulatingOnChain` is provided directly according to the asset's quantity on-chain or through external APIs, the `circulating` is the value of `circulatingOnChain`.

For tokens providing with `treasuryNft`, the `circulating` is the quantity of the asset in the latest address containing it.

## Requirements
As token verification prerequisites, ensure your token has a pool with at least **1000 ADA TVL**  and follow the structure stated in the instructions below.

For tokens to be verified:
1. Create a transaction transfer **100 ADA** to Minswap wallet receiving token verification fee below.
2. Metadata includes: **the last 4 numbers of asset's policyId and asset's ticker**.
3. Attach the transaction hash to a comment in the yaml file pull request (instructions below).


Minswap wallet receiving token verification fee: `addr1q85g6fkwzr2cf984qdmntqthl3yxnw4pst4mpgeyygdlnehqlcgwvr6c9vmajz96vnmmset3earqt5wl0keg0kw60eysdgwnej`

Any token that has been verified does not meet the requirements in the future would still be unverified.



## How to add my token

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
# not required, among website, twitter, discord, telegram, coinMarketCap, coinGecko
socialLinks:
  website: https://
  discord: ...

verified: true # default true, if a token violate verification policy then switch to false

# the following fields are not required
maxSupply: 500000000 # either number or string
# or
maxSupply: https://...

treasury:
  - addr...
  - stake...
  - https://...
  - assetId

burn:
  - addr...
  - stake...
  - https://...
  - assetId

circulatingOnChain:
  - addr...
  - stake...
  - https://...
  - assetId

treasuryNft: assetId
```

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
