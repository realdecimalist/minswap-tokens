import { supplyFetchers } from "@minswap/market-cap";
import { BlockFrostAdapter } from "./adapter";
import { MarketCapFetcher } from "./api";
import { getBlockFrostInstance } from "./utils";

async function main() {
  const tokenId =
    "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd615368656e4d6963726f555344";
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
