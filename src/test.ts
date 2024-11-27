import path from "node:path";
import fs from "node:fs";
import { BlockFrostAdapter } from "./adapter";
import { MarketCapAPI } from "./apis/marketcapApi";
import { TokenAPI } from "./apis/tokenApi";
import type { TokenMetadata } from "./types";
import { getBlockFrostInstance } from "./utils";
import { load } from "js-yaml";

const blockFrostInstance = getBlockFrostInstance();
const blockFrostAdapter = new BlockFrostAdapter(blockFrostInstance);
const tokenApi = new TokenAPI();
const marketcapApi = new MarketCapAPI(blockFrostAdapter);

async function getToken(tokenId: string) {
  try {
    const __dirname = import.meta.dirname;
    const filePath = path.join(
      __dirname,
      `../need-update-apis/${tokenId}.yaml`
    );
    const tokenFileData = fs.readFileSync(filePath, "utf-8");
    const tokenData: TokenMetadata = {
      tokenId,
      ...(load(tokenFileData) as Omit<TokenMetadata, "tokenId">),
    };
    return tokenData;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function moveFile(tokenFileName: string) {
  const oldPath = `../need-update-apis/${tokenFileName}`;
  const newPath = `./tokens/${tokenFileName}`;
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error("Could not move file", err);
    }
  });
}

async function test() {
  const __dirname = import.meta.dirname;
  const tokenFileDir = path.join(__dirname, "../need-update-apis");
  fs.readdir(tokenFileDir, async (error, files) => {
    if (error) {
      console.log(error);
    }
    for (const file of files) {
      const tokenId = file.split(".")[0];
      const tokenInfo = await getToken(tokenId);
      if (
        tokenInfo
      ) {
        console.log(
          tokenInfo.tokenId.slice(0, 56),
          tokenInfo.tokenId.slice(56)
        );
        try {
          const marketcapInfo = await marketcapApi.getMarketCapInfo(tokenInfo);
          console.log(marketcapInfo);
        } catch {}
      }
    }
  });
}
test();
