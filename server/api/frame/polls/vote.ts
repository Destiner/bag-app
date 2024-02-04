import { getFrameMessage, getFrameHtmlResponse } from "@coinbase/onchainkit";
import type { FrameRequest } from "@coinbase/onchainkit";
import { parseEther, type Hex } from "viem";

import { getStartImageUrl, getEasAttestData } from "~/utils/frames/polls";

import {
  getWalletAddress,
  getTokenBalance,
  execute,
  getErc20TransferData,
} from "~/utils/frames";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;
const privateKey = config.aaPrivateKey as Hex;
const pimlicoApiKey = config.pimlicoApiKey as string;

const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUid =
  "0x251738edaada1c1fabac0f9d05174205c4e76183c2ae920e18263ce74297966b";

export default defineEventHandler(async (event) => {
  const body = await readBody<FrameRequest>(event);
  const validation = await getFrameMessage(body);

  const query = getQuery(event);
  const pollIdString = query.pollId as string;
  const pollId = parseInt(pollIdString);
  const answerIndex = validation.message?.button;
  // validate answer
  if (!answerIndex) {
    console.info("Invalid button index");
    return getFrameHtmlResponse({
      image: getStartImageUrl(baseUrl, "Invalid button index"),
    });
  }

  // validate message
  if (!validation.isValid) {
    console.info("Invalid message");
    return getFrameHtmlResponse({
      image: getStartImageUrl(baseUrl, "Invalid message"),
    });
  }
  // get voter fid
  const fid = validation.message.interactor.fid;
  if (!fid) {
    console.info("No FID");
    return getFrameHtmlResponse({
      image: getStartImageUrl(baseUrl, "No FID"),
    });
  }
  // vote using eas
  execute(
    pimlicoApiKey,
    privateKey,
    fid,
    easContractAddress,
    getEasAttestData(schemaUid, pollId, answerIndex),
    BigInt(0)
  );
  console.info("Vote submitted");
  // fetch results
  // show results
});
