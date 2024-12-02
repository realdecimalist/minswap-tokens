import { load } from "js-yaml";

import fs from "node:fs";
import path from "node:path";
import { TOKENS_DIR } from "../consts";
import type { GetTokenOptions, TokenMetadata } from "../types";

export class TokenAPI {
  /**
   * Get token's metadata by its ID.
   * @param tokenId The concatenation of token policy ID and hex-coded token name.
   * @returns The token metadata followed the token schema.
   */
  public async getToken(tokenId: string) {
    try {
      const __dirname = import.meta.dirname;
      const filePath = path.join(__dirname, `../${TOKENS_DIR}/${tokenId}.yaml`);
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

  /**
   * Get all tokens' metadata by its ID.
   * @param options Only verified or only tokens with market cap.
   * @returns The list of all tokens' metadata.
   */
  public async getTokens(options?: GetTokenOptions) {
    const __dirname = import.meta.dirname;
    const directory = path.join(__dirname, TOKENS_DIR);
    const tokenList: TokenMetadata[] = [];
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const tokenString = file.split(".")[0];
      const token = await this.getToken(tokenString);
      if (!token) {
        continue;
      }
      const matchedVerify = !options?.verifiedOnly || (options?.verifiedOnly && token.verified);
      const matchedMarketCap = !options?.hasMarketCapOnly || (options?.hasMarketCapOnly && !!token.maxSupply);
      if (matchedVerify && matchedMarketCap) {
        tokenList.push(token);
      }
    }
    return tokenList;
  }
}
