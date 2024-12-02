import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import type { Adapter, BlockFrostOptions } from "./types";

export class BlockFrostAdapter implements Adapter {
  private readonly blockFrost: BlockFrostAPI;

  constructor(options?: BlockFrostOptions) {
    this.blockFrost = new BlockFrostAPI(options);
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
}
