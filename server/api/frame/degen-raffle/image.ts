import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterBold from "@/assets/fonts/Inter-Bold.ttf";
import hatImage from "@/assets/images/hat.png";
// @ts-ignore
import Image from "@/components/frame/degen-raffle/Image.vue";

function base64ImageToBuffer(base64Image: string): Buffer | null {
  const base64ImageWithoutPrefix = base64Image.split(";base64,").pop();
  if (!base64ImageWithoutPrefix) {
    return null;
  }
  return Buffer.from(base64ImageWithoutPrefix, "base64");
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const messageText = query.text;
  const messageType = query.type;
  const svg = await satori(Image, {
    props: {
      message: {
        text: messageText,
        type: messageType,
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
        name: "InterBold",
        data: InterBold as unknown as Buffer,
        weight: 700,
        style: "normal",
      },
    ],
  });
  const hatImageBuffer = base64ImageToBuffer(hatImage);
  const images: Buffer[] = [];
  if (hatImageBuffer) {
    images.push(hatImageBuffer);
  }
  const pngBuffer = await sharp(Buffer.from(svg))
    .composite(images.map((image) => ({ input: image })))
    .toFormat("png")
    .toBuffer();

  setResponseHeader(event, "Content-Type", "image/png");
  setResponseHeader(event, "Cache-Control", "max-age=10");
  return pngBuffer;
});
