import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const res = await fetch('https://api.printful.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: 'app-1965284',
      client_secret: 'rGhTPmLyqq4XQhYyY3xRFzVJeUXgmTTHwGSuKjD4Lxmg0GDuXTjW1U8SEo6Jmkv4',
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://www.sdotlabs.com/api/printful/callback',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Printful token exchange error:', data);
    return new Response(JSON.stringify({ error: data }), { status: res.status });
  }

  console.log('✅ Printful access token:', data.access_token);
  // You could store this in a secure DB for future use

  return new Response('Authorization complete. You can close this tab.', { status: 200 });
};
