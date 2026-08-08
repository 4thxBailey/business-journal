import { XMLParser } from "fast-xml-parser";
//#region src/config/feeds.config.ts
/**
* Pinned feed — Lionel Mosley | ahr-ki-tekt
* Non-removable. Always rendered first regardless of user sort order.
*/
var PINNED_FEED = {
	id: "trust-lionel",
	name: "Lionel Mosley | ahr-ki-tekt",
	url: "https://trust-lionel.com/atom.xml",
	homeUrl: "https://trust-lionel.com",
	pinned: true
};
/**
* Default ad hoc feeds — alphabetical order.
* All user-editable: reorderable, hideable, and removable.
* Users may also add their own RSS/Atom feeds via the settings panel.
*/
var DEFAULT_FEEDS = [
	{
		id: "aljazeera",
		name: "Al Jazeera",
		url: "https://www.aljazeera.com/xml/rss/all.xml",
		homeUrl: "https://www.aljazeera.com"
	},
	{
		id: "arstechnica",
		name: "Ars Technica",
		url: "https://feeds.arstechnica.com/arstechnica/index",
		homeUrl: "https://arstechnica.com"
	},
	{
		id: "bbc",
		name: "BBC News",
		url: "https://feeds.bbci.co.uk/news/rss.xml",
		homeUrl: "https://www.bbc.co.uk/news"
	},
	{
		id: "cio",
		name: "CIO",
		url: "https://www.cio.com/feed/",
		homeUrl: "https://www.cio.com"
	},
	{
		id: "darkreading",
		name: "Dark Reading",
		url: "https://www.darkreading.com/rss.xml",
		homeUrl: "https://www.darkreading.com"
	},
	{
		id: "engadget",
		name: "Engadget",
		url: "https://www.engadget.com/rss.xml",
		homeUrl: "https://www.engadget.com"
	},
	{
		id: "hackernews",
		name: "Hacker News",
		url: "https://news.ycombinator.com/rss",
		homeUrl: "https://news.ycombinator.com"
	},
	{
		id: "houstonbj",
		name: "Houston Business Journal",
		url: "https://www.bizjournals.com/houston/feed/latest/rss.xml",
		homeUrl: "https://www.bizjournals.com/houston"
	},
	{
		id: "houstonchronicle",
		name: "Houston Chronicle",
		url: "https://www.chron.com/rss/feed/Top-News-11213332.php",
		homeUrl: "https://www.chron.com"
	},
	{
		id: "krebs",
		name: "Krebs on Security",
		url: "https://krebsonsecurity.com/feed/",
		homeUrl: "https://krebsonsecurity.com"
	},
	{
		id: "lobsters",
		name: "Lobsters",
		url: "https://lobste.rs/rss",
		homeUrl: "https://lobste.rs"
	},
	{
		id: "macrumors",
		name: "MacRumors",
		url: "https://feeds.macrumors.com/MacRumors-All",
		homeUrl: "https://www.macrumors.com"
	},
	{
		id: "nyt",
		name: "NYT World News",
		url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
		homeUrl: "https://www.nytimes.com/section/world"
	},
	{
		id: "slashdot",
		name: "Slashdot",
		url: "http://rss.slashdot.org/Slashdot/slashdotMain",
		homeUrl: "https://slashdot.org"
	},
	{
		id: "techcrunch",
		name: "TechCrunch",
		url: "https://techcrunch.com/feed/",
		homeUrl: "https://techcrunch.com"
	},
	{
		id: "guardian",
		name: "The Guardian",
		url: "https://www.theguardian.com/uk/rss",
		homeUrl: "https://www.theguardian.com"
	},
	{
		id: "nextweb",
		name: "The Next Web",
		url: "https://thenextweb.com/feed",
		homeUrl: "https://thenextweb.com"
	},
	{
		id: "register",
		name: "The Register",
		url: "https://www.theregister.com/headlines.atom",
		homeUrl: "https://www.theregister.com"
	},
	{
		id: "verge",
		name: "The Verge",
		url: "https://www.theverge.com/rss/index.xml",
		homeUrl: "https://www.theverge.com"
	},
	{
		id: "wired",
		name: "Wired",
		url: "https://www.wired.com/feed/rss",
		homeUrl: "https://www.wired.com"
	}
];
var CACHE_TTL_MS = 3e5;
//#endregion
//#region src/lib/parser.ts
var parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	isArray: (name) => [
		"item",
		"entry",
		"link"
	].includes(name),
	allowBooleanAttributes: true
});
function extractAtomLink(links) {
	if (!Array.isArray(links)) return "";
	return links.find((l) => l["@_rel"] === "alternate" || !l["@_rel"])?.["@_href"] ?? links[0]?.["@_href"] ?? "";
}
function parseRss(data) {
	const channel = (data?.rss)?.channel;
	if (!channel) return [];
	return (channel.item ?? []).slice(0, 20).map((item) => ({
		title: String(item.title ?? "").trim(),
		link: String(item.link ?? item.guid ?? "").trim(),
		commentsLink: item.comments ? String(item.comments).trim() : void 0,
		pubDate: item.pubDate ? String(item.pubDate).trim() : void 0
	}));
}
function parseAtom(data) {
	const feed = data?.feed;
	if (!feed) return [];
	return (feed.entry ?? []).slice(0, 20).map((entry) => {
		const link = Array.isArray(entry.link) ? extractAtomLink(entry.link) : String(entry.link?.["@_href"] ?? entry.link ?? "");
		return {
			title: String(entry.title?.["#text"] ?? entry.title ?? "").trim(),
			link: link.trim(),
			pubDate: entry.updated ? String(entry.updated).trim() : entry.published ? String(entry.published).trim() : void 0
		};
	});
}
async function parseFeed(url) {
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": "4TH AND BAILEY Business Journal/1.0 (+https://news.4thandbailey.com)",
				Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (!response.ok) return {
			title: "",
			items: [],
			status: "error",
			error: `HTTP ${response.status}`
		};
		const xml = await response.text();
		const data = parser.parse(xml);
		let items = [];
		let feedTitle = "";
		if (data.rss) {
			const channel = data.rss?.channel;
			feedTitle = String(channel?.title ?? "").trim();
			items = parseRss(data);
		} else if (data.feed) {
			const feed = data.feed;
			feedTitle = String(feed.title?.["#text"] ?? feed.title ?? "").trim();
			items = parseAtom(data);
		} else return {
			title: "",
			items: [],
			status: "error",
			error: "Unrecognized feed format"
		};
		items = items.filter((item) => item.title && item.link);
		if (items.length === 0) return {
			title: feedTitle,
			items: [],
			status: "error",
			error: "No items found"
		};
		return {
			title: feedTitle,
			items,
			status: items.length >= 5 ? "ok" : "limited"
		};
	} catch (err) {
		return {
			title: "",
			items: [],
			status: "error",
			error: err instanceof Error ? err.message : "Unknown error"
		};
	}
}
//#endregion
export { PINNED_FEED as i, CACHE_TTL_MS as n, DEFAULT_FEEDS as r, parseFeed as t };
