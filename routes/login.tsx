import { Handlers, PageProps } from "$fresh/server.ts";
import { createClient } from "@supabase";
import { createServerClient } from "npm:@supabase/ssr";
import { setCookie, getCookies, deleteCookie } from "https://deno.land/std@0.221.0/http/mod.ts";

type AuthResult = {
	isAuthenticated: boolean;
};

export const handler: Handlers = {
	async GET(req, ctx): Promise<Response> {
		const url = new URL(req.url);

		const supabaseUrlEnvVarName = url.hostname === "localhost" ? "SUPABASE_URL_DEV" : "SUPABASE_URL";
		const anonKeyEnvVarName = url.hostname === "localhost" ? "SUPABASE_ANON_KEY_DEV" : "SUPABASE_ANON_KEY";

		const supaUrl = Deno.env.get(supabaseUrlEnvVarName) ?? "";
		const anonKey = Deno.env.get(anonKeyEnvVarName) ?? "";

		if (supaUrl === "" || anonKey === "") {
			const errorMsg = `Server config error: The ${supabaseUrlEnvVarName} and/or ${anonKeyEnvVarName} environment variables are not set.`;

			return new Response(errorMsg, { status: 500 });
		}

		return ctx.render();
	},
	async POST(req, ctx): Promise<Response> {
		const url = new URL(req.url);

		const supabaseUrlEnvVarName = url.hostname === "localhost" ? "SUPABASE_URL_DEV" : "SUPABASE_URL";
		const anonKeyEnvVarName = url.hostname === "localhost" ? "SUPABASE_ANON_KEY_DEV" : "SUPABASE_ANON_KEY";

		const supaUrl = Deno.env.get(supabaseUrlEnvVarName) ?? "";
		const anonKey = Deno.env.get(anonKeyEnvVarName) ?? "";

		const redirectHeaders = new Headers();

		const supabase = createServerClient(supaUrl, anonKey, {
			auth: {
				detectSessionInUrl: true,
				flowType: "pkce",
			},
			cookies: {
				get(key: string) {
					return redirectHeaders.get(key);
				},
				set(key: string, value: string, options: unknown) {
					redirectHeaders.set(key, value);
				},
				remove(key: string, options: unknown) {
					redirectHeaders.delete(key);
				}
			}
		});

		// Google provides the login page when using this
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google"
		});

		if (error) {
			const errorMsg = `"There was an issue with the authentication process."\n${error.message}`;

			return new Response(errorMsg, { status: 500 });
		}

		const googleAuthPageUrl = data.url ?? "";

		redirectHeaders.append("Location", googleAuthPageUrl);

		const authResult: AuthResult = {
			isAuthenticated: false
		};

		// Redirect to the google auth consent page
		return new Response("Redirecting...", {
			status: 302,
			headers: redirectHeaders,
		});
	}
};

/**
 * Returns a localStorage-like object that stores the key-value pairs in
 * memory.
 */
export function memoryLocalStorageAdapter(store: { [key: string]: string } = {}) {
	return {
		getItem: (key: string) => {
			console.log("getting item", key, "from store", store);
			return store[key] || null;
		},

		setItem: (key: string, data: string) => {
			console.log("setting item", key, "from store", store);
			store[key] = data;
			console.log("store is now", store);
		},

		removeItem: (key: string) => {
			console.log("deletting item", key, "from store", store);
			delete store[key];
		},
	};
}

export default function LoginForm({ data }: PageProps<AuthResult | undefined>) {
	const isAuthenticated = data?.isAuthenticated ?? true;

	return (
		<div class="flex justify-center items-center h-screen">
			<form method="post">
				<div class="flex flex-col">
					<div class="flex flex-row">
						<label class="mr-4">User Name: </label>

						<input class="border-2 border-gray-400 basis-1/4"
							type="text"
							placeholder="Username" />
					</div>

					<div class="flex flex-row mt-4">
						<label class="mr-4">Password: </label>

						<input class="border-2 border-gray-400 basis-1/4"
							type="password"
							placeholder="Password" />
					</div>

					<button class="border-2 border-slate-800 mt-4"
						type="submit">Login</button>

					<label hidden={isAuthenticated} class="text-red-500 font-bold">Incorrect login or password.</label>
				</div>
			</form>
		</div>
	);
}
