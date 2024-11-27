import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { DefaultFetcherOptions } from "./types";

export function getBlockFrostInstance(options = DefaultFetcherOptions): BlockFrostAPI {
  return new BlockFrostAPI({
    projectId: process.env["BLOCKFROST_PROJECT_ID"] ?? "",
    requestTimeout: options.timeout,
  });
}

export function tryParseBigInt(value: string | number): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function formatNumber(value: bigint, decimals: number): string {
  if (value === 0n) {
    return '0';
  }
  const numberString = value.toString();
  if (numberString.length <= decimals) {
    return `0.${numberString.padStart(decimals, '0')}`;
  }

  const postfix = numberString.slice(numberString.length - decimals).replace(/0+$/g, "");
  const decimalPoint = postfix.length ? "." : "";
  const prefix = numberString.slice(0, numberString.length - decimals);
  return prefix + decimalPoint + postfix;
}

export function isBigInt(value: string | number): boolean {
  return !Number.isNaN(Number(value)) && value.toString() === tryParseBigInt(value)?.toString();
}

export function isAPIEndPoint(str: string | number): boolean {
  return typeof str === "string" && str.startsWith("https://");
}

export function isAddress(str: string | number): boolean {
  return typeof str === "string" && (str.startsWith("addr") || str.startsWith("stake"));
}

export async function getAmountFromURL(url: string): Promise<bigint> {
  const response = await fetch(url);
  const data = await response.text();
  return BigInt(data);
}
