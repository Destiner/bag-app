import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import { parseEther, type Hex, Address } from "viem";

import {
  getStartImageUrl,
  getSuccessImageUrl,
  getErc1155SafeTransferData,
} from "~/utils/frames/claim-all";
import {
  execute,
  getWalletAddress,
  getErrorImageUrl,
  getTokenBalance,
  getNftBalance,
  multiExecute,
  getErc20TransferData,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const neynarApiKey = config.neynarApiKey as string;
const privateKey = config.aaPrivateKey as Hex;
const pimlicoApiKey = config.pimlicoApiKey as string;

const degenAddress = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const nftAddress = "0x02a94f6292a00233eb07b2d8d403e911924e1948";

export default defineEventHandler(async (event) => {
  const body = await readBody<FrameRequest>(event);
  const validation = await getFrameMessage(body, {
    neynarApiKey,
  });

  // validate message
  if (!validation.isValid) {
    console.info("Invalid message");
    return getFrameHtmlResponse({
      image: getErrorImageUrl(baseUrl, "Invalid message"),
    });
  }
  // get buyer fid
  const fid = validation.message.interactor.fid;
  if (!fid) {
    console.info("No FID");
    return getFrameHtmlResponse({
      image: getErrorImageUrl(baseUrl, "No FID"),
    });
  }

  const bagAddress = await getWalletAddress(privateKey, fid);
  const mainAddress = validation.message.interactor.verified_accounts[0] as
    | Address
    | undefined;
  if (!mainAddress) {
    console.info("No connected address");
    return getFrameHtmlResponse({
      image: getErrorImageUrl(baseUrl, "No connected address"),
    });
  }

  const degenBalance = await getTokenBalance(bagAddress, degenAddress);
  const bagNftBalance = await getNftBalance(bagAddress, nftAddress, 1);
  const purpleBagNftBalance = await getNftBalance(bagAddress, nftAddress, 2);

  const txs: {
    to: Address;
    data: Hex;
    value: bigint;
  }[] = [];
  // Transfer degen
  if (degenBalance > BigInt(0)) {
    txs.push({
      to: degenAddress,
      data: getErc20TransferData(mainAddress, degenBalance),
      value: BigInt(0),
    });
  }
  // Transfer nft 1
  if (bagNftBalance > BigInt(0)) {
    txs.push({
      to: nftAddress,
      data: getErc1155SafeTransferData(
        bagAddress,
        mainAddress,
        BigInt(1),
        bagNftBalance
      ),
      value: BigInt(0),
    });
  }
  // Transfer nft 2
  if (purpleBagNftBalance > BigInt(0)) {
    txs.push({
      to: nftAddress,
      data: getErc1155SafeTransferData(
        bagAddress,
        mainAddress,
        BigInt(2),
        purpleBagNftBalance
      ),
      value: BigInt(0),
    });
  }
  if (txs.length === 0) {
    console.info("Nothing to claim");
    return getFrameHtmlResponse({
      image: getErrorImageUrl(baseUrl, "Nothing to claim"),
    });
  }
  multiExecute(pimlicoApiKey, privateKey, fid, txs);
  console.info("Claimed");
  // show success frame
  return getFrameHtmlResponse({
    image: getSuccessImageUrl(baseUrl),
    buttons: [
      {
        label: "Show Tx",
        action: "post_redirect",
      },
    ],
    post_url: `${baseUrl}/explore/transfer/${bagAddress}/${mainAddress}`,
  });
});
