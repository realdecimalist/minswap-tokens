import { supplyFetchers } from "@minswap/market-cap"
import { getBlockFrostInstance } from "../src/utils";
import { BlockFrostAdapter } from "../src/adapter";
import { MarketCapFetcher } from "../src/api";
import * as fs from 'fs';
import { DEFAULT_TOKEN_DIR, SupplyFetcherResponse } from "../src/types";
import path from "path";

const REPORT_DIR = path.join(__dirname, '../report');
const ERROR_TOLERANCE = 0.0001;

function moveFile(tokenName: string, flag = 1) {
  const oldPath = `./src/${DEFAULT_TOKEN_DIR}/${tokenName}`;
  let newPath = `${REPORT_DIR}/${tokenName}`;
  if (!flag) {
    newPath = `${REPORT_DIR}/diff/${tokenName}`;
  }
  if (flag === 2) {
    newPath = `${REPORT_DIR}/only-total/${tokenName}`;
  }
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error("Could not move file", err);
    }
  });
}

function compareMarketcapInfo(result: SupplyFetcherResponse, expected: SupplyFetcherResponse): boolean | string {

  if (result.circulating === expected.circulating && result.total === expected.total) {
    return true;
  }
  const circulatingError = Math.abs(parseFloat(result.circulating!) - parseFloat(expected.circulating!));
  const totalError = Math.abs(parseFloat(result.total!) - parseFloat(expected.total!));
  return circulatingError < ERROR_TOLERANCE && totalError < ERROR_TOLERANCE;
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
      moveFile(tokenFileName);
    } else {
      try {
        const result = await fetcher.getMarketCapInfo(tokenData);
        const expected = await supplyFetchers[tokenId]();
        if (!result || !expected) {
          console.log("Expected/Result notfound: ", tokenFileName);
        } else {
          const decimal = tokenData.decimals;

          if (!result.circulating || !result.total || !expected.circulating || !expected.total) {
            moveFile(tokenFileName, 2);
            continue;
          }
          if (!compareMarketcapInfo(result, expected) || typeof compareMarketcapInfo(result, expected) === "string") {
            console.log("Error Comparing: ", tokenFileName);
            console.log("Result: ", result, "Expected: ", expected, "Decimals: ", decimal);
            moveFile(tokenFileName, 0)
          };

        }
      } catch (error) {
        console.log("Error", error, tokenFileName);
        moveFile(tokenFileName, 0)
      }
    }
  }
}

test()
