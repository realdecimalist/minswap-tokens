export function tryParseBigInt(value: string | number): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function formatNumber(value: bigint, decimals: number): string {
  if (value === 0n) {
    return "0";
  }
  const numberString = value.toString();
  if (numberString.length <= decimals) {
    return `0.${numberString.padStart(decimals, "0")}`;
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

export async function getAmountFromURL(url: string, decimals: number): Promise<bigint | null> {
  const response = await fetch(url);
  let amount = await response.text();
  // format to support APIs which return amount with decimal places
  if (amount.includes(".")) {
    const [prefix, postfix] = amount.split(".");
    if (postfix.length > decimals) {
      return null;
    }
    amount = prefix + postfix.padEnd(decimals, "0");
  }

  return tryParseBigInt(amount);
}
