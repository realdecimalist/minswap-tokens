# Minswap tokens

## Requirements

```yaml
# 1 token = 1 yaml file
# filename: policyId + tokenName (like cardano-token-registry)
# merge verified-tokens and market-cap into 1 new repo, then archive those 2 old repos (to avoid breaking changes with integrators)

projectName: Minswap
categories:
- DeFi
- DAO

socialLinks:
  website: https://
  discord: ...

unverified: true # default false, if a token violate verification policy then turn on

maxSupply: 500000000
# or
maxSupply: https://...

treasuryWallets:
- addr...
- addr...
- https://...

burnWallets:
- addr...
- https://...

# total = max - burn
# circulating = max - burn - treasury
```
