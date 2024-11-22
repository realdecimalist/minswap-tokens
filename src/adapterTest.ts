import { supplyFetchers } from "@minswap/market-cap";
import { BlockFrostAdapter } from "./adapter";
import { MarketCapFetcher } from "./api";
import { getBlockFrostInstance } from "./utils";

async function main() {
  const tokenId =
    "86340a33acf14b5c967584c9a20e984695ab3289696d138048f572be4255524e5a";
  const blockFrostInstance = getBlockFrostInstance();
  const blockFrostAdapter = new BlockFrostAdapter(blockFrostInstance);
  const fetcher = new MarketCapFetcher(blockFrostAdapter);
  const tokenData = await fetcher.getToken(tokenId);

  if (tokenData) {
    const result = await fetcher.getMarketCapInfo(tokenData);
    const expected = await supplyFetchers[tokenId]();
    console.log(result, expected);
  }
}

main();
