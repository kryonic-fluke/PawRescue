import { auth } from "../lib/auth";

// Vite-compatible auth handler
export async function handleAuthRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/auth/', '');
    
    // Create a proper request object for better-auth
    const authRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    // Call better-auth handler
    const response = await auth.handler(authRequest);
    
    return response;
  } catch (error) {
    console.error('Auth handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
