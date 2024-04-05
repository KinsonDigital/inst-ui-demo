import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "https://deno.land/std@0.221.0/http/cookie.ts";
import { createServerClient } from "npm:@supabase/ssr";

interface State {
	data: string;
}


export async function handler(req: Request, ctx: FreshContext<State>): Promise<Response> {
	const url = new URL(req.url);

	const invalidRequest = isInvalidInternalRequest<State>(url, ctx);
	if (invalidRequest) {
		// console.log(`Request URL Ignored: ${url}`);
		return await ctx.next();
	}

	// Let the login page get through so the user can login
	if (url.pathname === "/login") {
		return await ctx.next();
	}
	
	if (url.searchParams.has("code")) {
		const code = url.searchParams.get("code");

		if (code === null || code === "") {
			return new Response("Could not login.", { status: 403, statusText: "Forbidden" });
		}

		const supaUrl = getSupaUrl(url.hostname);
		const anonKey = getAnonKey(url.hostname);

		const supabase = createServerClient(supaUrl, anonKey, {
			// auth: {
			// 	detectSessionInUrl: true,
			// 	flowType: "pkce"
			// },
			cookies: {
				get(key: string) {
					return getCookies(req.headers)[key];
				},
				set(key: string, value: string, options: unknown) {
					req.headers.set(key, value);
				},
				remove(key: string, options: unknown) {
					req.headers.delete(key);
				}
			}
		});

		const { data, error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			return new Response(error.message, { status: 400 });
		}

		// Build the cookie to add to the 'Set-Cookie' header
		// const cookie = `sb:session=${data.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`;

		const redirectUrl = extractUrlWithoutCode(url);
		req.headers.set("Location", redirectUrl);

		return new Response("Logging In . . .", {
			headers: req.headers,
		});
	} else {
		return new Response("Could not login.", { status: 403, statusText: "Forbidden" });
	}
}

function isInvalidInternalRequest<T>(url: URL, ctx: FreshContext<T>): boolean {
	const invalidRemoteAddr = ctx.remoteAddr.transport != "tcp" && ctx.remoteAddr.transport != "udp";

	const isInvalidFile = /.+\..+/.test(url.pathname);
	// const isInvalidFile = url.pathname.endsWith(".map") || url.pathname.endsWith(".js");
	const isFreshJs = url.pathname.startsWith("/_frsh/");

	return invalidRemoteAddr || isFreshJs || isInvalidFile;
}

function getSupaUrl(hostName: string): string {
	const envVarName = hostName === "localhost" ? "SUPABASE_URL_DEV" : "SUPABASE_URL";

	return Deno.env.get(envVarName) ?? "";
}

function getAnonKey(hostName: string): string {
	const envVarName = hostName === "localhost" ? "SUPABASE_ANON_KEY_DEV" : "SUPABASE_ANON_KEY";

	return Deno.env.get(envVarName) ?? "";
}

function extractUrlWithoutCode(url: URL) {
	url.searchParams.delete("code");
	const newQueryStr = url.searchParams.size <= 0
		? ""
		: `?${url.searchParams.toString()}`;

	return `${url.protocol}//${url.hostname}:${url.port}${url.pathname}${newQueryStr}`;
}
