import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import type { Hex } from "viem";

import { getImageUrl } from "~/utils/frames/degen-raffle";

import {
  getWalletAddress,
  getNftBalance,
  getTokenBalance,
  transferToken,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const privateKey = config.aaPrivateKey as Hex;
const adminMnemonic = config.sponsorMnemonic as string;

const nftAddress = "0x02A94f6292A00233eb07B2D8d403e911924E1948";
const degenAddress = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const dateStart = 1706807845000;

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
  const castHash = validation.message.raw.action.cast.hash;
  // Get the drop target address
  const bagAddress = await getWalletAddress(privateKey, fid);
  // Check that the NFT is not spinned yet by this FID
  const tokenBalance = await getTokenBalance(bagAddress, degenAddress);
  if (tokenBalance > BigInt(0)) {
    console.info("Already spinned");
    return getFrameHtmlResponse({
      buttons: [
        {
          label: "View Bag on Block Explorer",
          action: "post_redirect",
        },
      ],
      post_url: `${baseUrl}/api/frame/redirect?url=${baseUrl}/explore/address/${bagAddress}`,
      image: getImageUrl(baseUrl, "Already participated!", "normal"),
    });
  }
  const nftBalance = await getNftBalance(bagAddress, nftAddress, 1);
  const nftMultiplier = nftBalance > BigInt(0) ? BigInt(2) : BigInt(1);
  // Exponential time-based decay, starting from 1e18 and ending at 1e9 in 24 hours
  const timeMultiplier = BigInt(
    Math.floor(
      Math.pow(10, 18) *
        Math.pow(0.95, (Date.now() - dateStart) / (24 * 60 * 60 * 1000))
    )
  );
  // Add a random multiplier between 100 and 500
  const randomMultiplier = BigInt(
    Math.floor(Math.random() * (500 - 100 + 1) + 100)
  );
  const amount = nftMultiplier * timeMultiplier * randomMultiplier;
  console.info(
    "Amount",
    amount,
    nftMultiplier,
    timeMultiplier,
    randomMultiplier
  );
  // Send the tokens
  const txHash = await transferToken(
    adminMnemonic,
    degenAddress,
    bagAddress,
    amount
  );
  // Show the drop status screen + link to the block explorer
  if (!txHash) {
    console.warn("Unable to send");
    return getFrameHtmlResponse({
      buttons: [
        {
          label: "Retry",
          action: "post",
        },
      ],
      post_url: `${baseUrl}/api/frame/degen-raffle/spin`,
      image: getImageUrl(
        baseUrl,
        "Something went wrong, please try again",
        "error"
      ),
    });
  } else {
    console.info("Sent");
    return getFrameHtmlResponse({
      buttons: [
        {
          label: "View on Block Explorer",
          action: "post_redirect",
        },
      ],
      post_url: `${baseUrl}/api/frame/redirect?url=${baseUrl}/explore/tx/${txHash}`,
      image: getImageUrl(
        baseUrl,
        `You won ${(amount / BigInt("1000000000000000000")).toString()} DEGEN!`,
        "success"
      ),
    });
  }
});
