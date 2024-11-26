import { Ajv, type JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

import type { TokenMetadata } from "./types";
import { ADDRESS_REGEX, URI_REGEX } from "./const";

const ajv = new Ajv({
  validateFormats: true,
  validateSchema: true
});

addFormats(ajv);

// ajv.addFormat("uri", /^https:\/\/.*/);
// ajv.addFormat("address", /^(addr1|stake1)[a-z0-9]+/);

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
      minItems: 1,
      uniqueItems: true,
    },
    decimals: { type: "number" },
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
      additionalProperties: false
    },
    verified: { type: "boolean", default: true },
    maxSupply: {
      type: ["number", "string"],
      items: {
        type: ["string", "number"],
      },
      nullable: true,
    },
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
  additionalProperties: false,
  required: ["tokenId", "project", "categories", "decimals", "verified"],
};
