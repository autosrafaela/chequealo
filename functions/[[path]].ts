// Custom redirects configuration
const REDIRECTS = {
  // Add your custom redirects here
  // '/old-path': '/new-path',
  // '/blog': '/search?category=blog',
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Handle custom redirects
  if (REDIRECTS[pathname]) {
    return Response.redirect(new URL(REDIRECTS[pathname], url.origin).toString(), 301);
  }

  // Remove trailing slash (except for root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const newUrl = new URL(url);
    newUrl.pathname = pathname.slice(0, -1);
    return Response.redirect(newUrl.toString(), 301);
  }

  // Try to fetch the requested asset
  try {
    return await context.env.ASSETS.fetch(context.request);
  } catch {
    // Fallback to index.html for SPA routing
    const indexUrl = new URL('/', url.origin);
    const indexRequest = new Request(indexUrl, context.request);
    return await context.env.ASSETS.fetch(indexRequest);
  }
}
