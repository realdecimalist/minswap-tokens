import { supplyFetchers } from "@minswap/market-cap";
import { BlockFrostAdapter } from "./adapter";
import { MarketCapFetcher } from "./api";
import { getBlockFrostInstance } from "./utils";

async function main() {
  const tokenId =
    "f6696363e9196289ef4f2b4bf34bc8acca5352cdc7509647afe6888f54454459";
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
