/**
 * Service Worker — 4TH AND BAILEY Business Journal
 * Strategy: Cache-first for static assets, network-first for pages/API.
 * Provides offline shell so the app loads on your iPad Mini even without connectivity.
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE  = `4bj-static-${CACHE_VERSION}`;
const OFFLINE_URL   = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/styles/global.css',
  '/scripts/preferences.js',
  '/scripts/settings.js',
  '/scripts/show-more.js',
  '/scripts/refresh.js',
  '/offline.html',
  '/manifest.json',
];

// ── Install: pre-cache static assets ─────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {
        // Non-fatal: some assets may not exist at install time
      })
    )
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ─────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for navigation, cache-first for assets ───────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin (favicons from Google), and API requests
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Navigation requests: network-first, fall back to offline shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          (r) => r ?? new Response('Offline', { status: 503 })
        )
      )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
