import type { Adapter } from "../adapters";
import type { MarketCapInfoResponse, TokenMetadata } from "../types";
import { formatNumber, getAmountFromURL, isAPIEndPoint, isAddress, isBigInt } from "../utils";

const nullResponse = {
  total: null,
  circulating: null,
};

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
  public async getMarketCapInfo(tokenInfo: TokenMetadata): Promise<MarketCapInfoResponse> {
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

    const total = await this.getAmountFromArray(tokenId, maxSupply, decimals);
    if (total === null) {
      return nullResponse;
    }

    if (!tokenInfo.circulatingOnChain && !tokenInfo.burn && !tokenInfo.treasury && !tokenInfo.treasuryNft) {
      return {
        total: formatNumber(total, decimals),
      };
    }

    if (tokenInfo.treasuryNft) {
      const treasuryRaw = tokenInfo.treasuryNft;

      const treasury = await this.adapter.getAmountInFirstAddressHoldingAsset(tokenId, treasuryRaw);
      return {
        total: formatNumber(total - treasury, decimals),
        circulating: formatNumber(total - treasury, decimals),
      };
    }

    const [treasury, burn] = await Promise.all([
      this.getAmountFromArray(tokenId, tokenInfo.treasury ?? [], decimals),
      this.getAmountFromArray(tokenId, tokenInfo.burn ?? [], decimals),
    ]);

    if (burn === null || treasury === null) {
      return nullResponse;
    }

    if (tokenInfo.circulatingOnChain) {
      const circulatingOnChain = await this.getAmountFromArray(tokenId, tokenInfo.circulatingOnChain, decimals);

      if (circulatingOnChain === null) {
        return nullResponse;
      }

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
    values: (string | number)[],
    decimals: number,
  ): Promise<bigint | null> {
    const amounts = await Promise.all(
      values.map((value) => {
        if (isBigInt(value)) {
          return BigInt(value);
        }
        if (isAddress(value)) {
          return this.adapter.getAmountInAddress(value.toString(), token);
        }
        if (isAPIEndPoint(value)) {
          return getAmountFromURL(value.toString(), decimals);
        }
        return this.adapter.getOnchainAmountOfAsset(value.toString());
      }),
    );
    let amount = 0n;
    for (const value of amounts) {
      if (value === null) {
        return null;
      }
      amount += value;
    }
    return amount;
  }
}
