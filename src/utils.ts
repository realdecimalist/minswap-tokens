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

  const postfix = numberString
    .slice(numberString.length - decimals)
    .replace(/0+$/g, "");
  const decimalPoint = postfix.length ? "." : "";
  const prefix = numberString.slice(0, numberString.length - decimals);
  return prefix + decimalPoint + postfix;
}

export function isBigInt(value: string | number): boolean {
  return (
    !Number.isNaN(Number(value)) &&
    value.toString() === tryParseBigInt(value)?.toString()
  );
}

export function isAPIEndPoint(str: string | number): boolean {
  return typeof str === "string" && str.startsWith("https://");
}

export function isAddress(str: string | number): boolean {
  return (
    typeof str === "string" &&
    (str.startsWith("addr") || str.startsWith("stake"))
  );
}

export async function getAmountFromURL(
  url: string,
  decimals: number
): Promise<bigint | null> {
  const response = await fetch(url);
  let data = await response.text();
  //
  if (data.includes(".")) {
    const [prefix, postfix] = data.split(".");
    console.log({ prefix, postfix, decimals });
    if (postfix.length > decimals) {
      return null;
    }
    data = prefix + postfix.padEnd(decimals, "0");
  }

  return tryParseBigInt(data);
}
