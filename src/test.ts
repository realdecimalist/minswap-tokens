import { fetcher, getToken } from ".";
import { TokenMetadata } from "./token-schema";
import { DEFAULT_TIMEOUT } from "./types";
import { getBlockFrostInstance } from "./utils";

const tokenTest: TokenMetadata = {
  tokenId: '016be5325fd988fea98ad422fcfd53e5352cacfced5c106a932a35a442544e',
  project: 'Butane',
  categories: ["DeFi"],
  socialLinks: {
    website: 'https://butane.dev',
    twitter: 'https://twitter.com/butaneprotocol',
    discord: 'https://discord.gg/butane',
    telegram: 'https://t.me/butaneprotocol'
  },
  verified: true,
  maxSupply: 25000000,
  decimals: 6,
  circulating: [ '016be5325fd988fea98ad422fcfd53e5352cacfced5c106a932a35a442544e' ]
}

async function main() {
  const blockFrost = getBlockFrostInstance(DEFAULT_TIMEOUT);
  const tokenId = 'f13ac4d66b3ee19a6aa0f2a22298737bd907cc95121662fc971b5275535452494b45';
  const tokenInfo = await getToken(tokenId);
  console.log(tokenInfo);
  if (tokenInfo) {
    const amount = await fetcher({tokenInfo})
    console.log(amount);
  }

}
main()
