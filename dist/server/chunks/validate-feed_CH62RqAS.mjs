import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { t as parseFeed } from "./parser_n04kYfbv.mjs";
//#region src/pages/api/validate-feed.ts
var validate_feed_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ url }) => {
	const feedUrl = url.searchParams.get("url");
	if (!feedUrl) return new Response(JSON.stringify({ error: "URL parameter is required." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	try {
		new URL(feedUrl);
	} catch {
		return new Response(JSON.stringify({ error: "Invalid URL format." }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
	const result = await parseFeed(feedUrl);
	if (result.status === "error") return new Response(JSON.stringify({ error: result.error ?? "Could not parse feed." }), {
		status: 422,
		headers: { "Content-Type": "application/json" }
	});
	return new Response(JSON.stringify({
		ok: true,
		title: result.title,
		itemCount: result.items.length
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/validate-feed@_@ts
var page = () => validate_feed_exports;
//#endregion
export { page };
