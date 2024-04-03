import { Handlers, PageProps } from "$fresh/server.ts";
import { createClient } from "@supabase";
import { createServerClient } from "npm:@supabase/ssr";

type AuthResult = {
	isAuthenticated: boolean;
};

export const handler: Handlers = {
	async GET(req, ctx): Promise<Response> {
		const url = Deno.env.get("SUPABASE_URL") ?? "";
		const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

		if (url === "" || anonKey === "") {
			const errorMsg = `Server config error: The SUPABASE_URL and/or SUPABASE_ANON_KEY environment variables are not set.`;

			return new Response(errorMsg, { status: 500 });
		}

		console.log("GET INVOKED WHEN SHOWING LOGIN PAGE");

		return ctx.render();
	},
    async POST(req, ctx): Promise<Response> {
		const url = Deno.env.get("SUPABASE_URL") ?? "";
		const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
		
		const supabase = createServerClient(url, anonKey, {
			auth: {
				detectSessionInUrl: true,
				flowType: "pkce"
			},
			cookies: {}
		});

		// Google provides the login page when using this
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
		});

		const googleAuthPageUrl = data.url ?? "";

		// console.log(`GAuth: ${googleAuthPageUrl}`);
		
		const authResult: AuthResult = {
			isAuthenticated: false
		};

		if (error) {
			const errorMsg = `"There was an issue with the authentication process."\n${error.message}`;

			return new Response(errorMsg, { status: 500 });
		} else {
			// Redirect to the google auth consent page
			return new Response("Redirecting...", {
				status: 302,
				headers: {
					"Location": googleAuthPageUrl
				}
			});
		}
    }
};

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
