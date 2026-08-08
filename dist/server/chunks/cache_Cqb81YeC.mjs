import { i as PINNED_FEED, n as CACHE_TTL_MS, r as DEFAULT_FEEDS, t as parseFeed } from "./parser_n04kYfbv.mjs";
//#region src/lib/cache.ts
var cache = /* @__PURE__ */ new Map();
var refreshInterval = null;
var initialised = false;
async function fetchFeed(config) {
	const data = await parseFeed(config.url);
	cache.set(config.id, {
		config,
		data,
		cachedAt: Date.now()
	});
}
async function refreshAll() {
	const allFeeds = [PINNED_FEED, ...DEFAULT_FEEDS];
	await Promise.allSettled(allFeeds.map(fetchFeed));
}
/**
* Initialise the cache on first request.
* Starts the 5-minute background refresh interval.
* Safe to call multiple times — only runs once.
*/
async function initCache() {
	if (initialised) return;
	initialised = true;
	await refreshAll();
	refreshInterval = setInterval(() => {
		refreshAll().catch(console.error);
	}, CACHE_TTL_MS);
	if (refreshInterval.unref) refreshInterval.unref();
}
/**
* Return all cached feeds in their current order.
* Pinned feed is always first.
*/
function getAllFeeds() {
	const results = [];
	const pinned = cache.get(PINNED_FEED.id);
	if (pinned) results.push(pinned);
	for (const config of DEFAULT_FEEDS) {
		const cached = cache.get(config.id);
		if (cached) results.push(cached);
	}
	return results;
}
/**
* Manually trigger a full cache refresh.
* Called when the user clicks the refresh button in the UI.
*/
async function forceRefresh() {
	await refreshAll();
}
//#endregion
export { getAllFeeds as n, initCache as r, forceRefresh as t };
