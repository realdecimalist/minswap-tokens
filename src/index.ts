import { TokenMetadata, tokenSchema } from "./token-schema";
import {
  DEFAULT_TIMEOUT,
  DEFAULT_TOKEN_DIR,
  FetcherOptions,
  GetToken,
  GetTokenOptions,
  GetTokens,
  SupplyFetcher,
} from "./types";
import { getBlockFrostInstance, getAmountFromArray, ajv } from "./utils";
import * as fs from "fs";
import { load } from "js-yaml";
import path from "path";

export const fetcher: SupplyFetcher = async (options: FetcherOptions) => {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const blockFrost = getBlockFrostInstance(timeout);
  const { tokenInfo } = options;
  const tokenId = tokenInfo.tokenId;
  let maxSupply;
  let circulating = null;

  if (Array.isArray(tokenInfo.maxSupply)) {
    maxSupply = tokenInfo.maxSupply;
  } else {
    maxSupply = [tokenInfo.maxSupply];
  }

  const total =
    (await getAmountFromArray(blockFrost, tokenId, maxSupply)) *
    BigInt(10 ** tokenInfo.decimals);

  if (tokenInfo.circulating) {
    circulating = await getAmountFromArray(
      blockFrost,
      tokenId,
      tokenInfo.circulating
    );
    return {
      total: total.toString(),
      circulating: circulating.toString(),
    };
  }

  const addresses = [...(tokenInfo.treasury ?? []), ...(tokenInfo.burn ?? [])];

  const aggregatedAmount = await getAmountFromArray(
    blockFrost,
    tokenId,
    addresses
  );

  return {
    total: total.toString(),
    circulating: (total - aggregatedAmount).toString(),
  };
};

export const getToken: GetToken = async (tokenId: string) => {
  try {
    const filePath = path.join(
      __dirname,
      `${DEFAULT_TOKEN_DIR}/${tokenId}.yaml`
    );
    const tokenFileData = fs.readFileSync(filePath, "utf-8");
    const tokenData = {
      tokenId,
      ...(load(tokenFileData) as Omit<TokenMetadata, "tokenId">),
    };
    const validate = ajv.validate(tokenSchema, tokenData);
    return validate ? tokenData : null;
  } catch {
    return null;
  }
};

export const getTokens: GetTokens = async (options?: GetTokenOptions) => {
  const directory = path.join(__dirname, `${DEFAULT_TOKEN_DIR}`);
  const tokenList: TokenMetadata[] = [];
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const tokenString = file.substring(0, file.length - 5);
    const token = await getToken(tokenString);
    if (!token) {
      continue;
    }
    const matchedVerify =
      !options?.verifiedOnly || (options?.verifiedOnly && token.verified);
    const matchedMarketCap =
      !options?.hasMarketCapOnly ||
      (options?.hasMarketCapOnly && !!token.maxSupply);
    if (matchedVerify && matchedMarketCap) {
      tokenList.push(token);
    }
  }
  return tokenList;
};
