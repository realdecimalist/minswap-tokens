import { TokenMetadata } from "./token-schema";
import { DEFAULT_TIMEOUT, DEFAULT_TOKEN_DIR, FetcherOptions, GetToken, GetTokenOptions, GetTokens, SupplyFetcher } from "@/types";
import { getAmountInAddresses, getBlockFrostInstance } from "@/utils";
import * as fs from 'fs';
import { load } from "js-yaml";
import path from "path";

export const fetcher: SupplyFetcher = async (options: FetcherOptions) => {
  const { tokenInfo, tokenId } = options;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const blockFrost = getBlockFrostInstance(timeout);
  const total = Number(tokenInfo.maxSupply);
  const decimals = tokenInfo.decimals;
  const treasuryAddresses = tokenInfo.treasury;
  const burnAddresses = tokenInfo.burn;
  let treasury = Number(await getAmountInAddresses(blockFrost, tokenId, treasuryAddresses ?? []));
  let burn = Number(await getAmountInAddresses(blockFrost, tokenId, burnAddresses ?? []));

  if (decimals) {
    const decimal = 10 ** decimals;
    treasury /= decimal;
    burn /= decimal;
  }

  return {
    total: total.toString(),
    circulating: (total - treasury - burn),
  };
};

export const getToken: GetToken = async (tokenString: string) => {
  const filePath = path.join(__dirname, `${DEFAULT_TOKEN_DIR}/${tokenString}.yaml`);
  const tokenFileData = fs.readFileSync(filePath, "utf-8");
  return <TokenMetadata>load(tokenFileData);
}

export const getTokens: GetTokens = async (options?: GetTokenOptions) => {
  const directory = path.join(__dirname, `${DEFAULT_TOKEN_DIR}`);
  const tokenList: TokenMetadata[] = [];
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const tokenString = file.substring(0, file.length - 5);
    const token = await getToken(tokenString);
    const matchedVerify = (!options?.verifiedOnly) || (options?.verifiedOnly && token.verified);
    const matchedMarketCap = (!options?.hasMarketCapOnly) || (options?.hasMarketCapOnly && !!token.maxSupply);
    if (matchedVerify && matchedMarketCap) {
      tokenList.push(token);
    }
  }
  return tokenList;
}




