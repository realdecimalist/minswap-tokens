import type { BlockFrostAPI } from "@blockfrost/blockfrost-js";

export interface Adapter {
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
   * After obtaining a list of addresses possessing a specific asset in descending order, this retrieve the amount associated with the first address returned.
   * This function currently supports Shen and DJED.
   * @param tokenId The token's policy ID.
   * @param nftId The concatenation of token's policy ID and hex-coded token name.
   */
  getAmountInFirstAddressHoldingAsset(tokenId: string, nftId: string): Promise<bigint>;
}

export class BlockFrostAdapter implements Adapter {
  private readonly blockFrost: BlockFrostAPI;

  constructor(blockFrost: BlockFrostAPI) {
    this.blockFrost = blockFrost;
  }

  async getAmountInAddress(address: string, tokenId: string): Promise<bigint> {
    const values = address.startsWith("stake")
      ? await this.blockFrost.accountsAddressesAssetsAll(address)
      : await this.blockFrost.addresses(address).then((resp) => resp.amount);
    let amount = 0n;
    for (const value of values) {
      if (value.unit === tokenId) {
        amount += BigInt(value.quantity);
      }
    }
    return amount;
  }

  async getOnchainAmountOfAsset(assetId: string): Promise<bigint> {
    const assetInfo = await this.blockFrost.assetsById(assetId);
    return BigInt(assetInfo?.quantity);
  }

  async getAmountInFirstAddressHoldingAsset(tokenId: string, nftId: string): Promise<bigint> {
    const addresses = await this.blockFrost.assetsAddresses(nftId);
    return await this.getAmountInAddress(addresses[0]["address"], tokenId);
  }
}
