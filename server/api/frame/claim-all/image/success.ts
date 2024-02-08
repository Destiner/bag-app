import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
// @ts-ignore
import Image from "@/components/frame/claim-all/Success.vue";

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
    ],
  });
  const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

  setResponseHeader(event, "Content-Type", "image/png");
  setResponseHeader(event, "Cache-Control", "max-age=10");
  return pngBuffer;
});
