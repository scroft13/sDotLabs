import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const apiKey = process.env.PRINTFUL_API_KEY;
  const body = await request.json();

  const response = await fetch('https://api.printful.com/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Printful Error:', result);
    return new Response(JSON.stringify({ error: result }), { status: response.status });
  }

  return new Response(JSON.stringify({ success: true, result }), { status: 200 });
};
