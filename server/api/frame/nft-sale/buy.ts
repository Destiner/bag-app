import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import { parseEther, type Hex, Address } from "viem";

import {
  getStartImageUrl,
  getSuccessImageUrl,
  getErc20ApproveData,
  getMarketBuyData,
} from "~/utils/frames/nft-sale";
import {
  execute,
  getWalletAddress,
  getErrorImageUrl,
  getTokenBalance,
  getNftBalance,
  multiExecute,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const neynarApiKey = config.neynarApiKey as string;
const privateKey = config.aaPrivateKey as Hex;
const pimlicoApiKey = config.pimlicoApiKey as string;

const degenAddress = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const priceAmount = parseEther("100");
// TODO change this
const marketAddress = "0x46D83644c8f3cB1DD9FEF13096DF4119997Fc27c";
// TODO change this
const nftAddress = "0x4741856059b0C81093dabeBae23fFF93A13D3965";
// TODO change this
const nftTokenId = 1;

export default defineEventHandler(async (event) => {
  const body = await readBody<FrameRequest>(event);
  const validation = await getFrameMessage(body, {
    neynarApiKey,
  });

  // validate message
  // if (!validation.isValid) {
  //   console.info("Invalid message");
  //   return getFrameHtmlResponse({
  //     image: getErrorImageUrl(baseUrl, "Invalid message"),
  //   });
  // }
  // get buyer fid
  // const fid = validation.message.interactor.fid;
  const fid = 7963;
  if (!fid) {
    console.info("No FID");
    return getFrameHtmlResponse({
      image: getErrorImageUrl(baseUrl, "No FID"),
    });
  }

  const buyerAddress = await getWalletAddress(privateKey, fid);

  // check $degen balance
  const tokenBalance = await getTokenBalance(buyerAddress, degenAddress);
  if (tokenBalance < priceAmount) {
    console.info("Low balance");
    return getFrameHtmlResponse({
      image: getErrorImageUrl(baseUrl, "Not enough $DEGEN"),
      buttons: [
        {
          label: "View Bag",
          action: "post_redirect",
        },
      ],
      post_url: `${baseUrl}/explore/address/${buyerAddress}`,
    });
  }

  // check that market still has the NFT
  const nftBalance = await getNftBalance(marketAddress, nftAddress, nftTokenId);
  if (nftBalance < BigInt(1)) {
    console.info("Sold out");
    return getFrameHtmlResponse({
      image: getErrorImageUrl(baseUrl, "Sold out!"),
    });
  }

  // buy NFT
  multiExecute(pimlicoApiKey, privateKey, fid, [
    // approve
    {
      to: degenAddress,
      data: getErc20ApproveData(marketAddress, priceAmount),
      value: BigInt(0),
    },
    // buy
    {
      to: marketAddress,
      data: getMarketBuyData(),
      value: BigInt(0),
    },
  ]);
  console.info("Bought");
  // show success frame
  return getFrameHtmlResponse({
    image: getSuccessImageUrl(baseUrl),
    buttons: [
      {
        label: "Show Bag",
        action: "post_redirect",
      },
    ],
    post_url: `${baseUrl}/explore/address/${buyerAddress}`,
  });
});
