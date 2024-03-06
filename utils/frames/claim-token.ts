function getImageUrl(
  baseUrl: string,
  title: string,
  subtitle: string,
  note?: string
): string {
  const params: Record<string, string> = {};
  if (title) {
    params.title = title;
  }
  if (subtitle) {
    params.subtitle = subtitle;
  }
  if (note) {
    params.note = note;
  }
  const urlParams = new URLSearchParams(params);
  const imageUrl = new URL(`${baseUrl}/api/frame/claim-token/image`);
  imageUrl.search = urlParams.toString();
  return imageUrl.toString();
}

export { getImageUrl };
