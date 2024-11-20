import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { DEFAULT_TIMEOUT } from "./types";
import Ajv from "ajv";

export const ajv = new Ajv();

export function getBlockFrostInstance(requestTimeout: number): BlockFrostAPI {
  return new BlockFrostAPI({
    projectId: process.env["BLOCKFROST_PROJECT_ID"] ?? "",
    requestTimeout,
  });
}

export function tryParseBigInt(value: string | number): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function isBigInt(value: string | number): boolean {
  return (
    !isNaN(Number(value)) &&
    value.toString() === tryParseBigInt(value)?.toString()
  );
}

export function isAPIEndPoint(str: string | number): boolean {
  return typeof str === "string" && str.startsWith("https://");
}

export function isAddress(str: string | number): boolean {
  return (
    typeof str === "string" &&
    (str.startsWith("addr1") || str.startsWith("stake1"))
  );
}

export async function getAmountFromAsset(
  blockFrost: BlockFrostAPI,
  assetId: string
): Promise<bigint> {
  try {
    const assetInfo = await blockFrost.assetsById(assetId);
    return BigInt(assetInfo?.quantity);

  } catch (error) {
    throw error;
  }
}

export async function fetchDataFromURL(url: string): Promise<bigint> {
  const response = await fetch(url);
  const data = await response.text();
  return BigInt(data.replace(".", ""));
}

export async function getAmountFromArray(
  blockFrost: BlockFrostAPI,
  token: string,
  values: (string | number)[]
): Promise<bigint> {
  const amounts = await Promise.all(values.map((value) => {
    if (isBigInt(value)) {
      return BigInt(value);
    }
    if (isAddress(value)) {
      return getAmountInAddress(blockFrost, token, value.toString());
    }
    if (isAPIEndPoint(value)) {
      return fetchDataFromURL(value.toString());
    }
    return getAmountFromAsset(blockFrost, token);
  }))

  return amounts.reduce((sum, x) => sum + x, 0n);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAmountInAddress(
  blockFrost: BlockFrostAPI,
  token: string,
  address: string
) {
  const value = address.startsWith("stake1")
    ? await blockFrost.accountsAddressesAssetsAll(address)
    : await blockFrost.addresses(address).then((resp) => resp.amount);
  const amount = value
    .filter(({ unit }) => unit === token)
    .reduce((sum, x) => {
      return sum + BigInt(x.quantity);
    }, 0n);
  return amount;
}

