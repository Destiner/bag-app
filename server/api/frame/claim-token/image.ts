import sharp from "sharp";
import { satori } from "v-satori";

import Inter from "@/assets/fonts/Inter-Regular.ttf";
import InterBold from "@/assets/fonts/Inter-Bold.ttf";
// @ts-ignore
import Image from "@/components/frame/claim-token/Image.vue";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const title = query.title;
  const subtitle = query.subtitle;
  const note = query.note;
  const svg = await satori(Image, {
    props: {
      title,
      subtitle,
      note,
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
  const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

  setResponseHeader(event, "Content-Type", "image/png");
  setResponseHeader(event, "Cache-Control", "max-age=10");
  return pngBuffer;
});
