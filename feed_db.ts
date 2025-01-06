import { kv, TOTAL_PROBLEMS_OF_KEY } from "./src/lib/kv.ts";
import { lc } from "./src/lib/leet.ts";


const total_easy = await lc.problems({
    filters: { difficulty: "EASY" },
    limit: 1,
}).then(d => d.total)

console.log(TOTAL_PROBLEMS_OF_KEY("EASY"), total_easy);


await kv.set(TOTAL_PROBLEMS_OF_KEY("EASY"), total_easy);

console.log(await kv.get(TOTAL_PROBLEMS_OF_KEY("EASY")));
