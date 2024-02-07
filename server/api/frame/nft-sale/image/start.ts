import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterBold from "@/assets/fonts/Inter-Bold.ttf";
import bgImage from "@/assets/images/nft-sale-bg.png";
import bagImage from "@/assets/images/purple-bag.png";
// @ts-ignore
import Image from "@/components/frame/nft-sale/Start.vue";

function base64ImageToBuffer(base64Image: string): Buffer | null {
  const base64ImageWithoutPrefix = base64Image.split(";base64,").pop();
  if (!base64ImageWithoutPrefix) {
    return null;
  }
  return Buffer.from(base64ImageWithoutPrefix, "base64");
}

export default defineEventHandler(async (event) => {
  const svg = await satori(Image, {
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
  const bgImageBuffer = base64ImageToBuffer(bgImage);
  const bagImageBuffer = base64ImageToBuffer(bagImage);
  const images: Buffer[] = [];
  if (bgImageBuffer) {
    images.push(bgImageBuffer);
  }
  if (bagImageBuffer) {
    images.push(bagImageBuffer);
  }
  const pngBuffer = await sharp(Buffer.from(svg))
    .composite(images.map((image) => ({ input: image })))
    .toFormat("png")
    .toBuffer();

  setResponseHeader(event, "Content-Type", "image/png");
  setResponseHeader(event, "Cache-Control", "max-age=10");
  return pngBuffer;
});
