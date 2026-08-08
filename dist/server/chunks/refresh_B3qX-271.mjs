import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { t as forceRefresh } from "./cache_Cqb81YeC.mjs";
//#region src/pages/api/refresh.ts
var refresh_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async () => {
	try {
		await forceRefresh();
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			ok: false,
			error: String(err)
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/refresh@_@ts
var page = () => refresh_exports;
//#endregion
export { page };
