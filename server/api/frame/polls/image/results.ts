import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterBold from "@/assets/fonts/Inter-Bold.ttf";
// @ts-ignore
import Image from "@/components/frame/polls/Results.vue";
import { PollResultAnswer } from "~/utils/frames/polls";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pollQuestion = query.pollQuestion as string;
  const answer1 = query.answer1 as string | undefined;
  const answer2 = query.answer2 as string | undefined;
  const answer3 = query.answer3 as string | undefined;
  const answer4 = query.answer4 as string | undefined;
  const answer1VotesString = query.answer1Votes as string | undefined;
  const answer2VotesString = query.answer2Votes as string | undefined;
  const answer3VotesString = query.answer3Votes as string | undefined;
  const answer4VotesString = query.answer4Votes as string | undefined;
  const answer1Votes = answer1VotesString ? parseInt(answer1VotesString) : 0;
  const answer2Votes = answer2VotesString ? parseInt(answer2VotesString) : 0;
  const answer3Votes = answer3VotesString ? parseInt(answer3VotesString) : 0;
  const answer4Votes = answer4VotesString ? parseInt(answer4VotesString) : 0;
  const answers = [answer1, answer2, answer3, answer4];
  const answerVotes = [answer1Votes, answer2Votes, answer3Votes, answer4Votes];
  const validAnswers = answers
    .map((answer, index) => {
      return answer ? { text: answer, votes: answerVotes[index] } : undefined;
    })
    .filter(
      (answer) =>
        answer !== undefined &&
        answer.text !== undefined &&
        !Number.isNaN(answer.votes)
    ) as PollResultAnswer[];

  console.info("Poll results", answers, validAnswers);

  const svg = await satori(Image, {
    props: {
      poll: {
        title: pollQuestion,
      },
      answers: validAnswers,
    },
    width: 1146,
    height: 600,
    fonts: [
      {
        name: "Inter",
        data: Inter as unknown as Buffer,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: InterBold as unknown as Buffer,
        weight: 700,
        style: "normal",
      },
    ],
  });
  const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

  setResponseHeader(event, "Content-Type", "image/png");
  setResponseHeader(event, "Cache-Control", "max-age=10");
  return pngBuffer;
});
