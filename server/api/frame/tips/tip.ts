import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import { parseEther, type Hex } from "viem";

import { getImageUrl } from "~/utils/frames/tips";

import {
  getWalletAddress,
  getTokenBalance,
  getWarpcastProfile,
  execute,
  getErc20TransferData,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const privateKey = config.aaPrivateKey as Hex;
const pimlicoApiKey = config.pimlicoApiKey as string;

const degenAddress = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const tipAmount = parseEther("10");

export default defineEventHandler(async (event) => {
  const body = await readBody<FrameRequest>(event);
  const validation = await getFrameMessage(body);

  const query = getQuery(event);
  const targetUsername = query.username as string;
  const targetFidString = query.fid as string;
  const targetFid = parseInt(targetFidString);
  const targetName = query.name as string;
  const targetAvatar = query.avatar as string;
  const isActive = query.active as string;
  const user = {
    username: targetUsername,
    avatar: targetAvatar,
    name: targetName,
  };
  if (!targetFid || !targetName || !targetAvatar) {
    console.info("Missing user data");
    return getFrameHtmlResponse({
      image: getImageUrl(baseUrl, user, {
        text: "Missing user details",
        status: "error",
      }),
    });
  }
  if (!isActive) {
    console.info("Inactive user");
    return getFrameHtmlResponse({
      image: getImageUrl(baseUrl, user, {
        text: "User not active",
        status: "error",
      }),
    });
  }

  if (!validation.isValid) {
    console.info("Invalid message");
    return getFrameHtmlResponse({
      image: getImageUrl(baseUrl, user, {
        text: "Invalid message",
        status: "error",
      }),
    });
  }
  const fid = validation.message.interactor.fid;
  if (!fid) {
    console.info("No FID");
    return getFrameHtmlResponse({
      image: getImageUrl(baseUrl, user, {
        text: "FID not found",
        status: "error",
      }),
    });
  }
  // get "donor" account bag addr
  const sourceAddress = await getWalletAddress(privateKey, fid);
  // get "target" account bag addr
  const targetAddress = await getWalletAddress(privateKey, targetFid);
  console.info(`Source = ${sourceAddress}, target = ${targetAddress}`);
  // get "donor" account balance
  const tokenBalance = await getTokenBalance(sourceAddress, degenAddress);
  if (tokenBalance < tipAmount) {
    console.info("Low balance");
    return getFrameHtmlResponse({
      image: getImageUrl(baseUrl, user, {
        text: "Not enough $DEGEN",
        status: "error",
      }),
      buttons: [
        {
          label: "View Bag",
          action: "post_redirect",
        },
      ],
      post_url: `${baseUrl}/api/frame/redirect?url=${baseUrl}/explore/address/${sourceAddress}`,
    });
  }
  // send via pimlico/permissionless
  execute(
    pimlicoApiKey,
    privateKey,
    fid,
    degenAddress,
    getErc20TransferData(targetAddress, tipAmount),
    BigInt(0)
  );
  console.info("Tip submitted");
  return getFrameHtmlResponse({
    image: getImageUrl(baseUrl, user, {
      text: "Tip sent!",
      status: "success",
    }),
    buttons: [
      {
        label: "View Tx",
        action: "post_redirect",
      },
    ],
    post_url: `${baseUrl}/explore/tip/${sourceAddress}`,
  });
});
