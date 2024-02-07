import erc20Abi from "~/assets/abi/erc20";
import bagMarketAbi from "~/assets/abi/bagMarket";

import { encodeFunctionData, type Address, type Hex } from "viem";

function getStartImageUrl(baseUrl: string): string {
  const imageUrl = new URL(`${baseUrl}/api/frame/nft-sale/image/start`);
  return imageUrl.toString();
}

function getSuccessImageUrl(baseUrl: string): string {
  const imageUrl = new URL(`${baseUrl}/api/frame/nft-sale/image/success`);
  return imageUrl.toString();
}

function getErc20ApproveData(spender: Address, amount: bigint): Hex {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
  });
  return data;
}

function getMarketBuyData(): Hex {
  const data = encodeFunctionData({
    abi: bagMarketAbi,
    functionName: "buy",
    args: [],
  });
  return data;
}

export {
  getStartImageUrl,
  getSuccessImageUrl,
  getErc20ApproveData,
  getMarketBuyData,
};
