import type { JSONSchemaType } from "ajv";

import type { TokenMetadata } from "./types";

export const tokenSchema: JSONSchemaType<TokenMetadata> = {
  type: "object",
  properties: {
    tokenId: { type: "string" },
    project: { type: "string" },
    categories: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "DeFi",
          "RealFi",
          "GameFi",
          "Meme",
          "Bridge",
          "Metaverse",
          "Wallet",
          "NFT",
          "Oracle",
          "AI",
          "Launchpad",
          "DAO",
          "Stablecoin",
          "Social",
          "Media",
          "Other",
        ],
      },
    },
    socialLinks: {
      type: "object",
      properties: {
        website: { type: "string", nullable: true },
        twitter: { type: "string", nullable: true },
        discord: { type: "string", nullable: true },
        telegram: { type: "string", nullable: true },
        coinMarketCap: { type: "string", nullable: true },
        coinGecko: { type: "string", nullable: true },
      },
      nullable: true,
    },
    verified: { type: "boolean", default: true },
    maxSupply: {
      type: ["number", "string"],
      items: {
        type: ["string", "number"],
      },
      nullable: true,
    },
    decimals: { type: "number" },
    treasury: {
      type: "array",
      items: { type: ["string", "number"] },
      nullable: true,
    },
    burn: {
      type: "array",
      items: { type: ["string", "number"] },
      nullable: true,
    },
    circulatingOnChain: {
      type: "array",
      items: {
        type: ["string", "number"],
      },
      nullable: true,
    },
    treasuryNft: {
      type: "string",
      nullable: true,
    },
  },
  required: ["tokenId", "project", "categories", "decimals", "verified"],
};
