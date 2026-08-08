import type { APIRoute } from 'astro';
import { parseFeed } from '../../lib/parser.js';

export const GET: APIRoute = async ({ url }) => {
  const feedUrl = url.searchParams.get('url');

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    new URL(feedUrl); // Validate URL format
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL format.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await parseFeed(feedUrl);

  if (result.status === 'error') {
    return new Response(
      JSON.stringify({ error: result.error ?? 'Could not parse feed.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, title: result.title, itemCount: result.items.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
