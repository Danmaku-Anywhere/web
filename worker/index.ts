interface Env {
  ASSETS: {
    fetch(input: Request | URL | string): Promise<Response>
  }
}

// Angular writes the client-rendered shell as index.csr.html because some
// routes are prerendered, while the built-in SPA fallback only knows
// index.html. The path has no .html because asset serving answers that with
// a redirect. Asset requests that miss keep their 404.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const acceptsHtml = request.headers.get('Accept')?.includes('text/html')
    if (request.method !== 'GET' || !acceptsHtml) {
      return new Response('Not found', { status: 404 })
    }
    return env.ASSETS.fetch(new URL('/index.csr', request.url))
  },
}
