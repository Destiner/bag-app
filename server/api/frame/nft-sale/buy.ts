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
const marketAddress = "0xdE33389BCDE526Ef33f6351e34d27A5E21097C5D";
const nftAddress = "0x02a94f6292a00233eb07b2d8d403e911924e1948";
const nftTokenId = 2;

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
    post_url: `${baseUrl}/explore/nft/${buyerAddress}`,
  });
});
