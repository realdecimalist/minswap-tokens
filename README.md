# Minswap tokens
The merge of deprecated verified-tokens and market cap repositories, which contains a list of tokens, exposes APIs for transparent access to circulating supply and total supply.

## Requirements
For tokens to be verified, ensure your token has a pool with at least **1000 ADA TVL** and follow the structures stated in the instructions below. Any token that has been verified does not meet the requirements in the future would still be unverified.

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
```
