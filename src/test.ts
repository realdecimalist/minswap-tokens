import * as fs from "fs";
import path from "node:path";
import { supplyFetchers } from "@minswap/market-cap";
import { BlockFrostAdapter } from "../src/adapter";
import { MarketCapFetcher } from "../src/api";
import { DEFAULT_TOKEN_DIR, type SupplyFetcherResponse } from "../src/types";
import { getBlockFrostInstance } from "../src/utils";

// const REPORT_DIR = path.join(__dirname, "../report");
const ERROR_TOLERANCE = 0.0001;

// function moveFile(tokenName: string, flag = 1) {
//   const oldPath = `./src/${DEFAULT_TOKEN_DIR}/${tokenName}`;
//   let newPath = `${REPORT_DIR}/${tokenName}`;
//   if (!flag) {
//     newPath = `${REPORT_DIR}/diff/${tokenName}`;
//   }
//   fs.rename(oldPath, newPath, (err) => {
//     if (err) {
//       console.error("Could not move file", err);
//     }
//   });
// }

function compareMarketcapInfo(result: SupplyFetcherResponse, expected: SupplyFetcherResponse) {
  if (result.circulating === expected.circulating && result.total === expected.total) {
    return {
      match: true,
      circulating: 0,
      total: 0
    };
  }
  const circulatingError = Math.abs(Number.parseFloat(result.circulating!) - Number.parseFloat(expected.circulating!));
  const totalError = Math.abs(Number.parseFloat(result.total!) - Number.parseFloat(expected.total!));
  return {
    match: circulatingError < ERROR_TOLERANCE && totalError < ERROR_TOLERANCE,
    circulating: circulatingError,
    total: totalError
  }
}

async function test() {
  const blockFrostInstance = getBlockFrostInstance();
  const blockFrostAdapter = new BlockFrostAdapter(blockFrostInstance);
  const fetcher = new MarketCapFetcher(blockFrostAdapter);
  const tokenDir = path.join(__dirname, `${DEFAULT_TOKEN_DIR}`);
  const tokenFileNames = fs.readdirSync(tokenDir);
  for (const tokenFileName of tokenFileNames) {
    const tokenId = tokenFileName.substring(0, tokenFileName.length - 5);
    const tokenData = await fetcher.getToken(tokenId);
    // error when reading files or yaml file does not follow the right schema
    if (!tokenData) {
      console.log(
        tokenFileName,
        "Error when reading files or yaml file does not follow the right schema"
      );
    } else {
      if (!tokenData.maxSupply) {
        continue;
      }
      try {
        const result = await fetcher.getMarketCapInfo(tokenData);
        const expected = await supplyFetchers[tokenId]();
        if (!result || !expected) {
          console.log("Expected/Result notfound: ", tokenFileName);
        } else {
          const res = compareMarketcapInfo(result, expected);
          if (!res.match) {
            console.log("Error comparing: ", tokenFileName);
            console.log("Result: ", result, "Expected: ", expected);
            console.log("Error: ", res.circulating, res.total);
          }
        }
      } catch (error) {
        console.log("Error", error, tokenFileName);
      }
    }
  }
}

test();
