import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";

import type { Adapter } from "./adapter";
import type { TokenMetadata } from "./types";
import type {
  GetTokenOptions,
  MarketCapInfoResponse,
} from "./types";
import { DEFAULT_TOKEN_DIR } from "./const";
import {
  formatNumber,
  getAmountFromURL,
  isAPIEndPoint,
  isAddress,
  isBigInt,
} from "./utils";

export class MarketCapAPI {
  private readonly adapter: Adapter;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
  }

  /**
   * Get market cap information of an asset.
   * @param tokenInfo Token metadata followed by the token schema.
   * @returns The maximum supply of an asset.
   * @returns The circulating amount of an asset.
   */
  public async getMarketCapInfo(
    tokenInfo: TokenMetadata
  ): Promise<MarketCapInfoResponse> {
    if (!tokenInfo.maxSupply) {
      throw new Error("MarketCap has not been configured.");
    }

    const tokenId = tokenInfo.tokenId;
    const decimals = tokenInfo.decimals;
    let maxSupply: (string | number)[];

    if (Array.isArray(tokenInfo.maxSupply)) {
      maxSupply = tokenInfo.maxSupply;
    } else {
      maxSupply = [tokenInfo.maxSupply];
    }

    const total = await this.getAmountFromArray(tokenId, maxSupply);

    if (
      !tokenInfo.circulatingOnChain &&
      !tokenInfo.burn &&
      !tokenInfo.treasury &&
      !tokenInfo.treasuryNft
    ) {
      return {
        total: formatNumber(total, decimals),
      };
    }

    if (tokenInfo.treasuryNft) {
      const treasuryRaw = tokenInfo.treasuryNft;

      const treasury = await this.adapter.getAmountInFirstAddressHoldingAsset(
        tokenId,
        treasuryRaw
      );
      return {
        total: formatNumber(total - treasury, decimals),
        circulating: formatNumber(total - treasury, decimals),
      };
    }

    const [treasury, burn] = await Promise.all([
      this.getAmountFromArray(tokenId, tokenInfo.treasury ?? []),
      this.getAmountFromArray(tokenId, tokenInfo.burn ?? []),
    ]);

    if (tokenInfo.circulatingOnChain) {
      const circulatingOnChain = await this.getAmountFromArray(
        tokenId,
        tokenInfo.circulatingOnChain
      );
      return {
        total: formatNumber(total - burn, decimals),
        circulating: formatNumber(circulatingOnChain - treasury, decimals),
      };
    }

    return {
      total: formatNumber(total - burn, decimals),
      circulating: formatNumber(total - treasury - burn, decimals),
    };
  }

  private async getAmountFromArray(
    token: string,
    values: (string | number)[]
  ): Promise<bigint> {
    const amounts = await Promise.all(
      values.map((value) => {
        if (isBigInt(value)) {
          return BigInt(value);
        }
        if (isAddress(value)) {
          return this.adapter.getAmountInAddress(value.toString(), token);
        }
        if (isAPIEndPoint(value)) {
          return getAmountFromURL(value.toString());
        }
        return this.adapter.getOnchainAmountOfAsset(value.toString());
      })
    );
    return amounts.reduce((sum, x) => sum + x, 0n);
  }
}

export class TokenAPI {
  /**
   * Get token's metadata by its ID.
   * @param tokenId The concatenation of token policy ID and hex-coded token name.
   * @returns The token metadata followed the token schema.
   */
  public async getToken(tokenId: string) {
    try {
      const __dirname = import.meta.dirname;
      const filePath = path.join(
        __dirname,
        `${DEFAULT_TOKEN_DIR}/${tokenId}.yaml`
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

  /**
   * Get all tokens' metadata by its ID.
   * @param options Only verified or only tokens with market cap.
   * @returns The list of all tokens' metadata.
   */
  public async getTokens(options?: GetTokenOptions) {
    const __dirname = import.meta.dirname;
    const directory = path.join(__dirname, `${DEFAULT_TOKEN_DIR}`);
    const tokenList: TokenMetadata[] = [];
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const tokenString = file.split(".")[0];
      const token = await this.getToken(tokenString);
      if (!token) {
        continue;
      }
      const matchedVerify =
        !options?.verifiedOnly || (options?.verifiedOnly && token.verified);
      const matchedMarketCap =
        !options?.hasMarketCapOnly ||
        (options?.hasMarketCapOnly && !!token.maxSupply);
      if (matchedVerify && matchedMarketCap) {
        tokenList.push(token);
      }
    }
    return tokenList;
  }
}
