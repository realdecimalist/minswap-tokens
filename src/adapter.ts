import type { BlockFrostAPI } from "@blockfrost/blockfrost-js";

export interface Adapter {
  getAmountInAddress(address: string, tokenId: string): Promise<bigint>;

  getAmountFromAsset(assetId: string): Promise<bigint>;

  getAmountFromNftId(tokenId: string, nftId: string, index: number): Promise<bigint>;
}

export class BlockFrostAdapter implements Adapter {
  private readonly blockFrost: BlockFrostAPI;

  constructor(_blockFrost: BlockFrostAPI) {
    this.blockFrost = _blockFrost;
  }

  async getAmountInAddress(address: string, tokenId: string): Promise<bigint> {
    const values = address.startsWith("stake1")
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

  async getAmountFromAsset(assetId: string): Promise<bigint> {
    const assetInfo = await this.blockFrost.assetsById(assetId);
    return BigInt(assetInfo?.quantity);
  }

  async getAmountFromNftId(tokenId: string, nftId: string, index: number): Promise<bigint> {
    const addresses = await this.blockFrost.assetsAddresses(nftId);
    return await this.getAmountInAddress(
      addresses[index]["address"],
      tokenId
    );
  }
}
