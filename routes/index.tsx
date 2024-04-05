import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
    async GET(req, ctx): Promise<Response> {
        const resp = await ctx.render();

        return resp;
    }
}

export default function Home() {
  const count = useSignal(3);
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />

        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>

        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>

        <Counter count={count} />
      </div>

      <div>
        <table class="border-collapse border-2 border-gray-400">
            <thead>
                <tr>
                    <th class="border-separate border-2 border-gray-400">Song</th>
                    <th class="border-separate border-2 border-gray-400">Artist</th>
                    <th class="border-separate border-2 border-gray-400">Year</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td class="border-separate border-2 border-gray-400">The Sliding Mr. Bones (Next Stop, Pottersville)</td>
                    <td class="border-separate border-2 border-gray-400">Malcolm Lockyer</td>
                    <td class="border-separate border-2 border-gray-400">
                        <select>
                            <option value="">Choose a class</option>
                            <option value="class-a">Class A</option>
                            <option value="class-b">Class B</option>
                            <option value="class-c">Class C</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td class="border-separate border-2 border-gray-400">Witchy Woman</td>
                    <td class="border-separate border-2 border-gray-400">The Eagles</td>
                    <td class="border-separate border-2 border-gray-400">
                        <select>
                            <option value="">Choose a class</option>
                            <option value="class-a">Class A</option>
                            <option value="class-b">Class B</option>
                            <option value="class-c">Class C</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td class="border-separate border-2 border-gray-400">Shining Star</td>
                    <td class="border-separate border-2 border-gray-400">Earth, Wind, and Fire</td>
                    <td class="border-separate border-2 border-gray-400">
                        <select>
                            <option value="">Choose a class</option>
                            <option value="class-a">Class A</option>
                            <option value="class-b">Class B</option>
                            <option value="class-c">Class C</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
}
