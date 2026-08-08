import type { FeedConfig } from '../config/feeds.config.js';
import { CACHE_TTL_MS, PINNED_FEED, DEFAULT_FEEDS } from '../config/feeds.config.js';
import { parseFeed, type ParsedFeed } from './parser.js';

export interface CachedFeed {
  config: FeedConfig;
  data: ParsedFeed;
  cachedAt: number;
}

// In-memory cache — persists for the lifetime of the Railway Node process
const cache = new Map<string, CachedFeed>();
let refreshInterval: ReturnType<typeof setInterval> | null = null;
let initialised = false;

async function fetchFeed(config: FeedConfig): Promise<void> {
  const data = await parseFeed(config.url);
  cache.set(config.id, {
    config,
    data,
    cachedAt: Date.now(),
  });
}

async function refreshAll(): Promise<void> {
  const allFeeds = [PINNED_FEED, ...DEFAULT_FEEDS];
  // Fetch all feeds concurrently — one slow/failing feed never blocks others
  await Promise.allSettled(allFeeds.map(fetchFeed));
}

/**
 * Initialise the cache on first request.
 * Starts the 5-minute background refresh interval.
 * Safe to call multiple times — only runs once.
 */
export async function initCache(): Promise<void> {
  if (initialised) return;
  initialised = true;

  // Cold start: fetch all feeds in parallel before serving first request
  await refreshAll();

  // Background refresh every 5 minutes
  refreshInterval = setInterval(() => {
    refreshAll().catch(console.error);
  }, CACHE_TTL_MS);

  // Prevent the interval from blocking Node process shutdown
  if (refreshInterval.unref) refreshInterval.unref();
}

/**
 * Return all cached feeds in their current order.
 * Pinned feed is always first.
 */
export function getAllFeeds(): CachedFeed[] {
  const results: CachedFeed[] = [];

  // Pinned feed first
  const pinned = cache.get(PINNED_FEED.id);
  if (pinned) results.push(pinned);

  // Then default feeds in alphabetical config order
  for (const config of DEFAULT_FEEDS) {
    const cached = cache.get(config.id);
    if (cached) results.push(cached);
  }

  return results;
}

/**
 * Fetch and cache a single user-added custom feed on demand.
 * Returns the result immediately — no background refresh for custom feeds
 * since they are user-managed and may change.
 */
export async function fetchCustomFeed(config: FeedConfig): Promise<CachedFeed> {
  const existing = cache.get(config.id);
  if (existing && Date.now() - existing.cachedAt < CACHE_TTL_MS) {
    return existing;
  }
  await fetchFeed(config);
  return cache.get(config.id)!;
}

/**
 * Manually trigger a full cache refresh.
 * Called when the user clicks the refresh button in the UI.
 */
export async function forceRefresh(): Promise<void> {
  await refreshAll();
}
