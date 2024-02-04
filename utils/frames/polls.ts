import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import {
  createPublicClient,
  encodeFunctionData,
  zeroAddress,
  type Hex,
  zeroHash,
} from "viem";

import easAbi from "~/assets/abi/eas";

interface Poll {
  question: string;
  answers: string[];
}

interface PollResultAnswer {
  text: string;
  votes: number;
}

interface PollResults {
  question: string;
  answers: PollResultAnswer[];
}

function getStartImageUrl(baseUrl: string, pollQuestion: string): string {
  const imageParams = {
    pollQuestion,
  };
  const urlParams = new URLSearchParams(imageParams);
  const imageUrl = new URL(`${baseUrl}/api/frame/polls/image/start`);
  imageUrl.search = urlParams.toString();
  return imageUrl.toString();
}

function getResultsImageUrl(
  baseUrl: string,
  pollQuestion: string,
  pollAnswers: PollResultAnswer[]
): string {
  const imageParams = {
    pollQuestion,
    answer1: pollAnswers[0]?.text,
    answer2: pollAnswers[1]?.text,
    answer3: pollAnswers[2]?.text,
    answer4: pollAnswers[3]?.text,
    answer1Votes: pollAnswers[0]?.votes?.toString(),
    answer2Votes: pollAnswers[1]?.votes?.toString(),
    answer3Votes: pollAnswers[2]?.votes?.toString(),
    answer4Votes: pollAnswers[3]?.votes?.toString(),
  };
  const urlParams = new URLSearchParams(imageParams);
  const imageUrl = new URL(`${baseUrl}/api/frame/polls/image/results`);
  imageUrl.search = urlParams.toString();
  return imageUrl.toString();
}

function getEasAttestData(
  schemaUid: string,
  pollId: number,
  answerIndex: number
): Hex {
  const schemaEncoder = new SchemaEncoder("uint32 poll,uint8 answer");
  const encodedData = schemaEncoder.encodeData([
    { name: "poll", value: pollId.toString(), type: "uint32" },
    { name: "answer", value: answerIndex.toString(), type: "uint8" },
  ]);
  const data = encodeFunctionData({
    abi: easAbi,
    functionName: "attest",
    args: [
      {
        schema: schemaUid as Hex,
        data: {
          recipient: zeroAddress,
          expirationTime: BigInt(0),
          revocable: true,
          refUID: zeroHash,
          data: encodedData as Hex,
          value: BigInt(0),
        },
      },
    ],
  });
  return data;
}

async function getPoll(id: number): Promise<Poll> {
  // Fetch onchain or from the offchain registry
  return {
    question: "Cats vs Dogs",
    answers: ["cats", "dogs"],
  };
}

export { getStartImageUrl, getPoll, getEasAttestData };
export type { Poll, PollResultAnswer, PollResults };
