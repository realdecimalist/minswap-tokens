import path, { format } from "path";
import { Adapter } from "./adapter";
import { TokenMetadata, tokenSchema } from "./token-schema";
import { DEFAULT_TOKEN_DIR, GetTokenOptions, SupplyFetcherResponse } from "./types";
import { formatNumber, getAmountFromURL, isAddress, isAPIEndPoint, isBigInt } from "./utils";
import { load } from "js-yaml";
import fs from 'fs';
import Ajv from "ajv";

const ajv = new Ajv();

export class MarketCapFetcher {
  private readonly adapter: Adapter;

  constructor (adapter: Adapter) {
    this.adapter = adapter;
  }

  public async getMarketCapInfo(tokenInfo: TokenMetadata): Promise<SupplyFetcherResponse> {
    const tokenId = tokenInfo.tokenId;
    const decimals = tokenInfo.decimals;
    let maxSupply;

    if (Array.isArray(tokenInfo.maxSupply)) {
      maxSupply = tokenInfo.maxSupply;
    } else {
      maxSupply = [tokenInfo.maxSupply];
    }

    const total = await this.getAmountFromArray(tokenId, maxSupply);

    if (!tokenInfo.circulating && !tokenInfo.burn && !tokenInfo.treasury && !tokenInfo.treasuryNft) {
      return {
        total: formatNumber(total, decimals)
      }
    }

    if (tokenInfo.circulating) {
      const circulating = await this.getAmountFromArray(
        tokenId,
        tokenInfo.circulating
      );
      return {
        total: formatNumber(total, decimals),
        circulating: formatNumber(circulating, decimals),
      };
    }

    if (tokenInfo.treasuryNft) {
      const treasuryRaw = tokenInfo.treasuryNft;
      const treasury = await this.adapter.getAmountFromNftId(treasuryRaw.nftId, treasuryRaw.index);
      return {
        total: formatNumber(total - treasury, decimals),
        circulating: formatNumber(total - treasury, decimals),
      };
    }

    const [treasury, burn] = await Promise.all([
      this.getAmountFromArray(tokenId, tokenInfo.treasury ?? []),
      this.getAmountFromArray(tokenId, tokenInfo.burn ?? []),
    ]);

    return {
      total: formatNumber(total - burn, decimals),
      circulating: formatNumber(total - treasury - burn, decimals),
    };
  };

  private async getAmountFromArray(
    token: string,
    values: (string | number)[]
  ): Promise<bigint> {
    const amounts = await Promise.all(values.map((value) => {
      if (isBigInt(value)) {
        return BigInt(value);
      }
      if (isAddress(value)) {
        return this.adapter.getAmountInAddress(value.toString(), token);
      }
      if (isAPIEndPoint(value)) {
        return getAmountFromURL(value.toString());
      }
      return this.adapter.getAmountFromAsset(value.toString());
    }))
    return amounts.reduce((sum, x) => sum + x, 0n);
  }


  async getToken(tokenId: string) {
    try {
      const filePath = path.join(
        __dirname,
        `${DEFAULT_TOKEN_DIR}/${tokenId}.yaml`
      );
      const tokenFileData = fs.readFileSync(filePath, "utf-8");
      const tokenData: TokenMetadata = {
        tokenId,
        ...(load(tokenFileData) as Omit<TokenMetadata, "tokenId">),
      };
      const validate = ajv.validate(tokenSchema, tokenData);
      return validate ? tokenData : null;
    } catch {
      return null;
    }
  };

  async getTokens(options?: GetTokenOptions) {
    const directory = path.join(__dirname, `${DEFAULT_TOKEN_DIR}`);
    const tokenList: TokenMetadata[] = [];
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const tokenString = file.substring(0, file.length - 5);
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
  };


}
