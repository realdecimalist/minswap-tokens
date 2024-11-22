import type { JSONSchemaType } from "ajv";

export type Category =
  | "DeFi"
  | "RealFi"
  | "GameFi"
  | "Meme"
  | "Bridge"
  | "Metaverse"
  | "Wallet"
  | "NFT"
  | "Oracle"
  | "AI"
  | "Launchpad"
  | "DAO"
  | "Stablecoin"
  | "Social"
  | "Media"
  | "Other";

interface TokenMetadata {
  tokenId: string;
  project: string;
  categories: Category[];
  socialLinks?: {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    coinMarketCap?: string;
    coinGecko?: string;
  };
  verified: boolean;
  decimals: number;
  maxSupply?: number | string | (number | string)[];
  treasury?: (string | number)[];
  burn?: (string | number)[];
  circulatingOnChain?: (string | number)[];
  treasuryNft?: {
    nftId: string;
    index: number;
  };
}

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
      type: "object",
      properties: {
        nftId: {
          type: "string",
        },
        index: {
          type: "number",
        },
      },
      required: ["nftId", "index"],
      nullable: true,
    },
  },
  required: ["tokenId", "project", "categories", "decimals", "verified"],
};

export type { TokenMetadata };
