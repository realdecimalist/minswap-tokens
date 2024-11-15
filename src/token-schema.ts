import { JSONSchemaType } from "ajv";

interface TokenMetadata {
  project: string;
  categories: string[];
  socialLinks: { [key: string]: string };
  verified: boolean;
  maxSupply: number | string;
  decimals: number;
  treasury?: string[];
  burn?: string[];
}

export const schema: JSONSchemaType<TokenMetadata> = {
  type: "object",
  properties: {
    project: { type: "string" },
    categories: { type: "array", items: { type: "string" } },
    socialLinks: {
      type: "object",
      additionalProperties: { type: "string" },
      required: [],
    },
    verified: { type: "boolean", default: true },
    maxSupply: { type: ["number", "string"] },
    decimals: { type: "number" },
    treasury: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
    burn: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
  },
  required: [
    "project",
    "categories",
    "socialLinks",
    "maxSupply",
    "decimals",
    "verified",
  ],
};

export type { TokenMetadata };
