import { formatNumber, tryParseBigInt } from "../src/utils";

describe("Utils functions tests", () => {
  test("Should try parse bigint", () => {
    expect(tryParseBigInt(123456)).toBe(123456n);
    expect(tryParseBigInt("1234567890")).toBe(1234567890n);
    expect(tryParseBigInt("123456789n")).toBe(null);
    expect(tryParseBigInt("123_456_789")).toBe(null);
  });

  test("Should format number", () => {
    expect(formatNumber(BigInt(123456789123456789n), 5)).toEqual("1234567891234.56789");
    expect(formatNumber(BigInt(12345), 5)).toEqual("0.12345");
    expect(formatNumber(BigInt(1230003000), 5)).toEqual("12300.03");
    expect(formatNumber(BigInt(123), 5)).toEqual("0.00123");
    expect(formatNumber(123000n, 2)).toEqual("1230");
    expect(formatNumber(BigInt(0), 5)).toEqual("0");
  });
});
