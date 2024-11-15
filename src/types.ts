import { TokenMetadata } from "./token-schema";

export type FetcherOptions = {
  /**
   * Fetch timeout in milliseconds. Default to 20s
   */
  timeout?: number;
  tokenInfo: TokenMetadata;
  tokenId: string
};

export const DEFAULT_TIMEOUT = 20_000;
export const DEFAULT_TOKEN_DIR = 'tokens';

export type GetTokenOptions = {
  verifiedOnly?: boolean,
  hasMarketCapOnly?: boolean
}

export type SupplyFetcherResponse = {
  total?: string;
  circulating?: number;
};

export type SupplyFetcher = (options: FetcherOptions) => Promise<SupplyFetcherResponse>;

export type GetToken = (tokenString: string) => Promise<TokenMetadata>;

export type GetTokens = (options: GetTokenOptions) => Promise<TokenMetadata[]>;
