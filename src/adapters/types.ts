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

  /**
   * Get the amount held in the address holding a specific asset by the asset's ID.
   * After obtaining a list of addresses possessing a specific asset in ascending order from the blockchain's point of view, this retrieve the amount associated with the first address returned.
   * This function currently supports Shen and DJED.
   * @param address The first address holding the asset returned in ascending order from the blockchain's point of view.
   * @param tokenId The concatenation of token's policy ID and hex-coded token name.
   */
  getAmountInFirstAddressHoldingAsset(address: string, tokenId: string): Promise<bigint>;
};
