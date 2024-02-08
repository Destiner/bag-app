import { encodeFunctionData, type Address, type Hex } from "viem";

import erc1155Abi from "~/assets/abi/erc1155";

function getStartImageUrl(baseUrl: string): string {
  const imageUrl = new URL(`${baseUrl}/api/frame/claim-all/image/start`);
  return imageUrl.toString();
}

function getSuccessImageUrl(baseUrl: string): string {
  const imageUrl = new URL(`${baseUrl}/api/frame/claim-all/image/success`);
  return imageUrl.toString();
}

function getErc1155SafeTransferData(
  from: Address,
  to: Address,
  id: bigint,
  amount: bigint
): Hex {
  const data = encodeFunctionData({
    abi: erc1155Abi,
    functionName: "safeTransferFrom",
    args: [from, to, id, amount, "0x"],
  });
  return data;
}

export { getStartImageUrl, getSuccessImageUrl, getErc1155SafeTransferData };
