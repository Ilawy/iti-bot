import { DIFFICULTY_KEY, kv, TOTAL_PROBLEMS_OF_KEY } from "./lib/kv.ts";
import { lc } from "./lib/leet.ts";
import { Difficulty, Problem, resultify } from "./lib/types.ts";
import { Err, Ok, Result } from "npm:ts-results-es";
import { ProblemList } from "npm:leetcode-query";
import pb from "./lib/db.ts";
import { ClientResponseError, RecordModel } from "npm:pocketbase";


const total_easy = await lc.problems({
    filters: {difficulty: "EASY"},
    limit: 1,
}).then(d=>d.total)

console.log(TOTAL_PROBLEMS_OF_KEY("EASY"), total_easy);


await kv.set(TOTAL_PROBLEMS_OF_KEY("EASY"), total_easy);

console.log(await kv.get(TOTAL_PROBLEMS_OF_KEY("EASY")));
