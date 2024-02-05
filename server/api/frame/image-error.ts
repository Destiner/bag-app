import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterBold from "@/assets/fonts/Inter-Bold.ttf";
import cuteBagImage from "@/assets/images/cute-bag.png";
// @ts-ignore
import Image from "@/components/frame/Error.vue";

function base64ImageToBuffer(base64Image: string): Buffer | null {
  const base64ImageWithoutPrefix = base64Image.split(";base64,").pop();
  if (!base64ImageWithoutPrefix) {
    return null;
  }
  return Buffer.from(base64ImageWithoutPrefix, "base64");
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const reason = query.reason as string | undefined;
  const svg = await satori(Image, {
    props: {
      reason,
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
  const cuteBagImageBuffer = base64ImageToBuffer(cuteBagImage);
  const images: Buffer[] = [];
  if (cuteBagImageBuffer) {
    images.push(cuteBagImageBuffer);
  }
  const pngBuffer = await sharp(Buffer.from(svg))
    .composite(images.map((image) => ({ input: image })))
    .toFormat("png")
    .toBuffer();

  setResponseHeader(event, "Content-Type", "image/png");
  setResponseHeader(event, "Cache-Control", "max-age=10");
  return pngBuffer;
});
