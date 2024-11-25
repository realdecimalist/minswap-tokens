import fs from "node:fs";
import path from "node:path";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import * as SDK from "@minswap/sdk";
import { dump, load } from "js-yaml";

import type { TokenMetadata } from "@/types";

const MINIMUM_TVL = 1000_000000n; // 1000 ADA
const LIMIT_PAGINATION = 100;
const __dirname = import.meta.dirname;
const TOKEN_DIR = path.join(__dirname, "../src/tokens");

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
  const [v1Pools, { pools: v2Pools }] = await Promise.all([getAllV1Pools(), blockfrostAdapter.getAllV2Pools()]);

  fs.readdir(tokenDir, async function (error, files) {
    if (error) {
      throw error;
    }
    for (const file of files) {
      const filePath = path.join(tokenDir, file);
      const tokenData = <TokenMetadata>load(fs.readFileSync(filePath, "utf8"));
      const tokenId = file.substring(0, file.length - 5);
      const newVerified = await checkTVL(v1Pools, v2Pools, tokenId);

      if (newVerified === tokenData.verified) {
        continue;
      }

      const tokenInfo = {
        ...tokenData,
        verified: newVerified,
      };

      let yamlString = "";
      for (const [key, value] of Object.entries(tokenInfo)) {
        yamlString += `${dump({ [key]: value }, { lineWidth: -1 })}\n`;
      }
      fs.writeFileSync(filePath, yamlString, "utf8");
    }
  });
}

async function checkTVL(v1Pools: SDK.PoolV1.State[], v2Pools: SDK.PoolV2.State[], tokenId: string): Promise<boolean> {
  if (STABLE_COINS.includes(tokenId)) {
    return true;
  }

  let maxTVL = 0n;

  const poolV1 = v1Pools.find((pool) => pool.assetA === SDK.Asset.toString(SDK.ADA) && pool.assetB === tokenId);

  maxTVL = (poolV1?.reserveA ?? 0n) * 2n;

  const poolV2 = v2Pools.find((pool) => pool.assetA === SDK.Asset.toString(SDK.ADA) && pool.assetB === tokenId);

  const reserveV2 = (poolV2?.reserveA ?? 0n) * 2n;
  if (maxTVL < reserveV2) {
    maxTVL = reserveV2;
  }

  return maxTVL >= MINIMUM_TVL;
}

async function getAllV1Pools() {
  const v1Pools: SDK.PoolV1.State[] = [];

  let page = 1;
  while (true) {
    const paginatedPools = await blockfrostAdapter.getV1Pools({
      page,
      count: LIMIT_PAGINATION,
    });
    if (paginatedPools.length === 0) {
      break;
    }
    v1Pools.push(...paginatedPools);
    page++;
  }
  return v1Pools;
}

verifyTVL();
