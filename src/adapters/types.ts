import type { Options as BlockFrostJsOptions } from "@blockfrost/blockfrost-js/lib/types";

export type BlockFrostOptions = BlockFrostJsOptions;

export type Adapter = {
  /**
   * Get asset amount from an address.
   * @param address The addresses.
   * @param tokenId The concatenation of token's policy ID and hex-coded token name.
   */
  getAmountInAddress(address: string, tokenId: string): Promise<bigint>;

  /**
   * Get the amount of an asset on-chain by its ID.
   * @param assetId The concatenation of token's policy ID and the hex-coded token name.
   */
  getOnchainAmountOfAsset(assetId: string): Promise<bigint>;
};
