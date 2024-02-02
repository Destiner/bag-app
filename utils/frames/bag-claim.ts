type ImageType = "normal" | "success" | "error" | "warn";

function getImageUrl(baseUrl: string, text: string, type: ImageType): string {
  const imageParams = {
    text,
    type,
  };
  const urlParams = new URLSearchParams(imageParams);
  const imageUrl = new URL(`${baseUrl}/api/frame/bag-claim/image`);
  imageUrl.search = urlParams.toString();
  return imageUrl.toString();
}

export { getImageUrl };
export type { ImageType };
