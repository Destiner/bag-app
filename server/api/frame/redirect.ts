export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string | undefined;
  if (!url) {
    setResponseStatus(event, 400);
    return;
  }
  setResponseStatus(event, 302);
  setResponseHeader(event, "Location", url);
});
