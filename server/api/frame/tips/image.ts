import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterBold from "@/assets/fonts/Inter-Bold.ttf";
// @ts-ignore
import Image from "@/components/frame/tips/Image.vue";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const targetUsername = query.targetUsername as string;
  const targetAvatar = query.targetAvatar as string | undefined;
  const targetName = query.targetName as string;
  const messageText = query.messageText as string;
  const messageType = query.messageStatus as string;
  const svg = await satori(Image, {
    props: {
      target: {
        username: targetUsername,
        avatar: targetAvatar,
        name: targetName,
      },
      message: {
        text: messageText,
        status: messageType,
      },
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
