import { kv } from "@vercel/kv";
import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import { type Hex, Address, formatEther, parseEther } from "viem";

import { getImageUrl } from "~/utils/frames/claim-token";
import {
  getWalletAddress,
  getErrorImageUrl,
  getTokenBalance,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const neynarApiKey = config.neynarApiKey as string;
const privateKey = config.aaPrivateKey as Hex;

const tokenAddress = "0xAfb89a09D82FBDE58f18Ac6437B3fC81724e4dF6";
const minAmount = parseEther("3500");

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

  const isClaimed = await kv.get<boolean>(
    `token-claim-${tokenAddress}-${bagAddress}`
  );
  if (isClaimed) {
    console.info("Already claimed");
    return getFrameHtmlResponse({
      buttons: [
        {
          label: "Show Wallet",
          action: "link",
          target: `https://basescan.org/address/${mainAddress}#tokentxns`,
        },
      ],
      image: getImageUrl(
        baseUrl,
        "Already claimed",
        "You have already claimed this token",
        "Try another account or come back later"
      ),
    });
  }

  const tokenBalance = await getTokenBalance(bagAddress, tokenAddress);
  if (tokenBalance === BigInt(0)) {
    kv.set(`token-claim-${tokenAddress}-${bagAddress}`, true);
    console.info("No $DOG");
    return getFrameHtmlResponse({
      buttons: [
        {
          label: "Show Wallet",
          action: "link",
          target: `https://basescan.org/address/${mainAddress}#tokentxns`,
        },
      ],
      image: getImageUrl(
        baseUrl,
        "No $DOG",
        "nothing to claim",
        "try another account or come back later"
      ),
    });
  }

  if (tokenBalance < minAmount) {
    console.info("Not enough $DOG");
    return getFrameHtmlResponse({
      image: getImageUrl(
        baseUrl,
        "Not enough $DOG",
        "The amount is too low",
        "try another account or come back later"
      ),
    });
  }

  const balanceString = formatEther(tokenBalance);
  return getFrameHtmlResponse({
    image: getImageUrl(
      baseUrl,
      `${balanceString} $DOG`,
      "your balance",
      "20% fee is applied to cover gas fees and dev costs"
    ),
    buttons: [
      {
        label: "Claim",
        action: "post",
      },
    ],
    post_url: `${baseUrl}/api/frame/claim-token/claim`,
  });
});
