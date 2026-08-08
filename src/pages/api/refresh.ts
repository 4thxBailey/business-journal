import type { APIRoute } from 'astro';
import { forceRefresh } from '../../lib/cache.js';

export const POST: APIRoute = async () => {
  try {
    await forceRefresh();
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
