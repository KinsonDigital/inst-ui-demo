import { FreshContext, Handlers } from "$fresh/server.ts";

export const callback: Handlers = {
	async GET(req, ctx): Promise<Response> {
		console.log("AUTH CALLBACK INVOKED");
		const url = new URL(req.url);

		const code = url.searchParams.get("code");

		if (code == undefined) {
			return new Response("User not authenticated", { status: 403 });
		}

		return new Response("User authenticated", {
			status: 302,
			headers: {
				"Location": "/"
			}
		});
	}
};
