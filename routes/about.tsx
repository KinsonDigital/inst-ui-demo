import { Handlers } from "$fresh/server.ts";

type Person = {
    firstName: string,
    lastName: string,
};

type RenderData<T> = {
    data: T
};

export const handler: Handlers = {
    async GET(_req, ctx): Promise<Response> {
		console.log("HELLO FROM THE ABOUT PAGE");

        const person:Person = {
            firstName: "Kinson",
            lastName: "Digital",
        };

        const resp = await ctx.render(person);

        resp.headers.set("X-Custom-Header", "Hello");

        return resp;
    }
};


export default function AboutPage({ data }: RenderData<Person>) {
    return (
        <main>
            <h1>About</h1>
            <p>This is the about page.</p>

            <div>First Name: {data.firstName}</div>
            <div>Last Name: {data.lastName}</div>
        </main>
    );
}
