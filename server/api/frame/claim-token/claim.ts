import { kv } from "@vercel/kv";
import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import { type Hex, Address, parseEther } from "viem";

import { getImageUrl } from "~/utils/frames/claim-token";
import {
  getWalletAddress,
  getErrorImageUrl,
  getTokenBalance,
  multiExecuteBiconomy,
  getErc20TransferData,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const neynarApiKey = config.neynarApiKey as string;
const biconomyPaymasterApi = config.biconomyPaymasterApi as string;
const privateKey = config.aaPrivateKey as Hex;
const pimlicoApiKey = config.pimlicoApiKey as string;

const adminAddress = "0xa75a19Cae746f1058d3217Cb6367effD93c73B53";
const tokenAddress = "0xAfb89a09D82FBDE58f18Ac6437B3fC81724e4dF6";
const FEE_DENOMINATOR = BigInt(4); // 25%
const minAmount = parseEther("4000");

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
  console.info("Validated");
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
        "You have already claimed this token using this wallet"
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
        "check your wallet if you have already claimed"
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

  const feeAmount = tokenBalance / FEE_DENOMINATOR;
  const claimAmount = tokenBalance - feeAmount;
  console.info("Claiming", {
    bagAddress,
    mainAddress,
    fee: feeAmount.toString(),
    claim: claimAmount.toString(),
  });
  const txs: {
    to: Address;
    data: Hex;
    value: bigint;
  }[] = [
    {
      to: tokenAddress,
      data: getErc20TransferData(adminAddress, feeAmount),
      value: BigInt(0),
    },
    {
      to: tokenAddress,
      data: getErc20TransferData(mainAddress, claimAmount),
      value: BigInt(0),
    },
  ];
  kv.set(`token-claim-${tokenAddress}-${bagAddress}`, true);
  await multiExecuteBiconomy(
    biconomyPaymasterApi,
    pimlicoApiKey,
    privateKey,
    fid,
    txs
  );
  console.info("Claimed");
  // show success frame
  return getFrameHtmlResponse({
    image: getImageUrl(
      baseUrl,
      "Success!",
      "claimed $DOG",
      "might take a few minutes; retry later if needed"
    ),
    buttons: [
      {
        label: "View Transaction",
        action: "link",
        target: `https://basescan.org/address/${mainAddress}#tokentxns`,
      },
    ],
  });
});
