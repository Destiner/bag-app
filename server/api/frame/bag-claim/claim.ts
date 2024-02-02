import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
// import { kv } from "@vercel/kv";
import type { Hex } from "viem";

import { getImageUrl } from "~/utils/frames/bag-claim";

import {
  // getAccountAddress,
  getWalletAddress,
  // isActive,
  // isRecasted,
  getNftBalance,
  // zoraAdminMint,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const privateKey = config.aaPrivateKey as Hex;
// const adminMnemonic = config.sponsorMnemonic as string;

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
  // const castHash = validation.message.raw.action.cast.hash;
  // Get the drop target address
  const bagAddress = await getWalletAddress(privateKey, fid);
  console.info("Address", bagAddress);
  const nftBalance = await getNftBalance(bagAddress, contractAddress, 1);
  // Check that the NFT is not claimed yet by this FID
  // const isClaimed = (await kv.get<boolean>(`claim:${fid}`)) || false;
  if (nftBalance > BigInt(0)) {
    console.info("Already claimed");
    return getFrameHtmlResponse({
      buttons: [
        {
          label: "View Wallet on Block Explorer",
          action: "post_redirect",
        },
      ],
      post_url: `${baseUrl}/api/redirect?url=${baseUrl}/explore/address/${bagAddress}`,
      image: getImageUrl(baseUrl, "Already claimed!", "normal"),
    });
  }
  // Check that the user is recasted OR is active
  // const userIsActive = await isActive(fid);
  // if (!userIsActive) {
  //   const userIsRecasted = await isRecasted(fid, castHash);
  //   if (!userIsRecasted) {
  //     console.info("Not eligible", userIsActive, userIsRecasted);
  //     return getFrameHtmlResponse({
  //       buttons: [
  //         {
  //           label: "Retry",
  //           action: "post",
  //         },
  //       ],
  //       post_url: `${baseUrl}/api/frame/bag-claim/claim`,
  //       image: getImageUrl(baseUrl, "Please recast and try again", "error"),
  //     });
  //   }
  // }
  // Drop the NFT
  return getFrameHtmlResponse({
    image: getImageUrl(baseUrl, "Sold Out!", "normal"),
  });
  // const txHash = await zoraAdminMint(adminMnemonic, contractAddress, 1, bagAddress);
  // // Show the drop status screen + link to the block explorer
  // if (!txHash) {
  //   console.warn("Unable to mint");
  //   return getFrameHtmlResponse({
  //     buttons: [
  //       {
  //         label: "Retry",
  //         action: "post",
  //       },
  //     ],
  //     post_url: `${baseUrl}/api/frame/bag-claim/claim`,
  //     image: getImageUrl(
  //       baseUrl,
  //       "Something went wrong, please try again",
  //       "error"
  //     ),
  //   });
  // } else {
  //   console.info("Minted");
  //   // await kv.set(`claim:${fid}`, true);
  //   return getFrameHtmlResponse({
  //     buttons: [
  //       {
  //         label: "View on Block Explorer",
  //         action: "post_redirect",
  //       },
  //     ],
  //     post_url: `${baseUrl}/api/redirect?url=${baseUrl}/explore/tx/${txHash}`,
  //     image: getImageUrl(baseUrl, "Your bag is created!", "success"),
  //   });
  // }
});
