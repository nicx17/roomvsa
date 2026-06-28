interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env) {
    // Add security headers (Content Security Policy, etc.) to the response
    const response = await env.ASSETS.fetch(request);
    
    // Create a new response to modify headers (since the original response is immutable)
    const newResponse = new Response(response.body, response);
    
    // Basic Security Headers
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return newResponse;
  },
} satisfies ExportedHandler<Env>;
