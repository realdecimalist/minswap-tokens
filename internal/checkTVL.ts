import * as SDK from "@minswap/sdk";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { ADA } from "@minswap/sdk";
import path from "node:path";
import fs from "node:fs";
import type { TokenMetadata } from "@/token-schema";
import { load, dump } from "js-yaml";

const MINIMUM_TVL = 1000_000000n; // 1000 ADA
const TOKEN_DIR = "../src/tokens";
const LIMIT_PAGINATION = 100;

const STABLE_COINS = [
  "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61.446a65644d6963726f555344", // DJED
  "f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880.69555344", // iUSD
  "25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935.55534443", // USDC
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad.5553444d", // USDM
  "92776616f1f32c65a173392e4410a3d8c39dcf6ef768c73af164779c.4d79555344", // MyUSD
];

const blockfrostAPI = new BlockFrostAPI({
  projectId: process.env["BLOCKFROST_PROJECT_ID"],
  network: "mainnet",
});

const blockfrostAdapter = new SDK.BlockfrostAdapter({
  networkId: SDK.NetworkId.MAINNET,
  blockFrost: blockfrostAPI,
});

export async function verifyTVL() {
  const tokenDir = path.join(__dirname, TOKEN_DIR);
  fs.readdir(tokenDir, async function (error, files) {
    if (error) {
      throw error;
    }
    for (const file of files) {
      const filePath = path.join(tokenDir, file);
      const tokenData = <TokenMetadata>load(fs.readFileSync(filePath, "utf8"));
      const tokenId = file.substring(0, file.length - 5);
      const verified = {
        verified: await checkTVL(tokenId),
      };
      const yamlString = dump({ ...tokenData, ...verified });
      fs.writeFileSync(filePath, yamlString, "utf8");
    }
  });
}

async function checkTVL(tokenId: string): Promise<boolean> {
  const [v1Pools, { pools: v2Pools }] = await Promise.all([
    getAllV1Pools(),
    blockfrostAdapter.getAllV2Pools(),
  ]);

  if (STABLE_COINS.includes(tokenId)) {
    return true;
  }

  let maxTVL = 0n;
  const poolV1 = v1Pools.find(
    (pool) => pool.assetA === SDK.Asset.toString(ADA) && pool.assetB === tokenId
  );

  maxTVL = (poolV1?.reserveA ?? 0n) * 2n;

  const poolV2 = v2Pools.find(
    (pool) => pool.assetA === SDK.Asset.toString(ADA) && pool.assetB === tokenId
  );

  const reserveV2 = (poolV2?.reserveA ?? 0n) * 2n;
  if (maxTVL < reserveV2) {
    maxTVL = reserveV2;
  }

  return maxTVL >= MINIMUM_TVL;
}

async function getAllV1Pools() {
  const v1Pools: SDK.PoolV1.State[] = [];

  let flag = true;
  let page = 1;
  while (flag) {
    const paginatedPools = await blockfrostAdapter.getV1Pools({
      page,
      count: LIMIT_PAGINATION,
    });
    v1Pools.push(...paginatedPools);
    if (paginatedPools.length < LIMIT_PAGINATION) {
      flag = false;
    }
    page++;
  }

  return v1Pools;
}

verifyTVL();
