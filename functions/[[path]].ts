export async function onRequest(context) {
  try {
    return await context.env.ASSETS.fetch(context.request);
  } catch {
    const url = new URL(context.request.url);
    const indexUrl = new URL('/', url.origin);
    const indexRequest = new Request(indexUrl, context.request);
    return await context.env.ASSETS.fetch(indexRequest);
  }
}
