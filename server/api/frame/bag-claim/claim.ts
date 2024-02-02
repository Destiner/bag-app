import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import type { Hex } from "viem";

import { getImageUrl } from "~/utils/frames/bag-claim";

import { getWalletAddress, getNftBalance } from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const privateKey = config.aaPrivateKey as Hex;

const contractAddress = "0x02A94f6292A00233eb07B2D8d403e911924E1948";

export default defineEventHandler(async (event) => {
  const body = await readBody<FrameRequest>(event);
  const validation = await getFrameMessage(body);
  if (!validation.isValid) {
    console.info("Invalid message");
    return getFrameHtmlResponse({
      image: getImageUrl(baseUrl, "Unable to authorize", "error"),
    });
  }
  const fid = validation.message.interactor.fid;
  if (!fid) {
    console.info("No FID");
    return getFrameHtmlResponse({
      image: getImageUrl(baseUrl, "FID not found", "error"),
    });
  }
  // Get the drop target address
  const bagAddress = await getWalletAddress(privateKey, fid);
  console.info("Address", bagAddress);
  const nftBalance = await getNftBalance(bagAddress, contractAddress, 1);
  // Check that the NFT is not claimed yet by this FID
  if (nftBalance > BigInt(0)) {
    console.info("Already claimed");
    return getFrameHtmlResponse({
      buttons: [
        {
          label: "View Wallet on Block Explorer",
          action: "post_redirect",
        },
      ],
      post_url: `${baseUrl}/api/frame/redirect?url=${baseUrl}/explore/address/${bagAddress}`,
      image: getImageUrl(baseUrl, "Already claimed!", "normal"),
    });
  }
  // Drop the NFT
  return getFrameHtmlResponse({
    image: getImageUrl(baseUrl, "Sold Out!", "normal"),
  });
});
