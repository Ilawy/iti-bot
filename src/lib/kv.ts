import { Difficulty } from "~/lib/types.ts";
const KV_PATH = Deno.env.has("DEV") ? "/tmp/dkv" : undefined;
export const kv = await Deno.openKv(KV_PATH);

export const OFFSET_KEY: Deno.KvKey = ["leetcode", "offset"];
export const DIFFICULTY_KEY: Deno.KvKey = ["leetcode", "difficulty"];
export const TOTAL_PROBLEMS_OF_KEY = (
  difficulty: Difficulty,
): Deno.KvKey => ["leetcode", "total", difficulty];
