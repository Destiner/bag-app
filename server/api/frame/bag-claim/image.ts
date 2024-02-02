import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
import tokenImage from "@/assets/images/token.png";
import confettiImage from "@/assets/images/confetti.png";
// @ts-ignore
import Image from "@/components/frame/bag-claim/Image.vue";

function base64ImageToBuffer(base64Image: string): Buffer | null {
  const base64ImageWithoutPrefix = base64Image.split(";base64,").pop();
  if (!base64ImageWithoutPrefix) {
    return null;
  }
  return Buffer.from(base64ImageWithoutPrefix, "base64");
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const messageText = query.text as string;
  const messageType = query.type as string;
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
    ],
  });
  const tokenImageBuffer = base64ImageToBuffer(tokenImage);
  const confettiImageBuffer = base64ImageToBuffer(confettiImage);
  const images: Buffer[] = [];
  if (tokenImageBuffer) {
    images.push(tokenImageBuffer);
  }
  if (messageType === "success" && confettiImageBuffer) {
    images.push(confettiImageBuffer);
  }
  const pngBuffer = await sharp(Buffer.from(svg))
    .composite(images.map((image) => ({ input: image })))
    .toFormat("png")
    .toBuffer();

  setResponseHeader(event, "Content-Type", "image/png");
  setResponseHeader(event, "Cache-Control", "max-age=10");
  return pngBuffer;
});
