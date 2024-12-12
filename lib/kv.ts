import { Difficulty } from "./types.ts";

export const kv = await Deno.openKv();

export const OFFSET_KEY: Deno.KvKey = ["leetcode", "offset"];
export const DIFFICULTY_KEY: Deno.KvKey = ["leetcode", "difficulty"];
export const TOTAL_PROBLEMS_OF_KEY = (difficulty: Difficulty): Deno.KvKey => ["leetcode", "total", difficulty];
