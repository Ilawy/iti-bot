import { LeetCode, ProblemList } from "npm:leetcode-query";
import { Result, Ok, Err } from "npm:ts-results-es"
import pb from "./db.ts";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

async function resultify<T, E = Error>(value: Promise<T>): Promise<Result<T, E>>{
    try{
        return Ok(await value)
    }catch(e){
        return Err(e as E)
    }
}

const lc = new LeetCode();
const kv = await Deno.openKv();

const OFFSET_KEY: Deno.KvKey = ["leetcode", "offset"];
const DIFFICULTY_KEY: Deno.KvKey = ["leetcode", "difficulty"];
const PROBLEMS_KEY: Deno.KvKey = ["leetcode", "problems"];


interface FailedMessage{
    type: "leet_code_failed";
    offset: number | null;
}


export async function getDailyProblem(): Promise<Result<ProblemList, Error>> {
    //offset
    const offsetResult = await resultify<Deno.KvEntryMaybe<number>>(kv.get<number>(OFFSET_KEY));
    if(offsetResult.isErr()){
        kv.enqueue({
            type: "leet_code_failed",
            offset: null
        } satisfies FailedMessage)
        return offsetResult
    }
    const offset = offsetResult.value.value ?? 0;    
    //difficulty
    const difficultyResult = await resultify<Deno.KvEntryMaybe<Difficulty>>(kv.get<Difficulty>(DIFFICULTY_KEY));
    if(difficultyResult.isErr()){
        kv.enqueue({
            type: "leet_code_failed",
            offset: offset
        } satisfies FailedMessage)
        return difficultyResult
    }
    const difficulty = difficultyResult.value.value ?? "EASY";    
    //result
    const responseResult = await resultify<ProblemList>(lc.problems({
        filters: {
            difficulty: difficulty,
        },
        limit: 1,
        offset: offset,
    }));
    if(responseResult.isErr()){
        kv.enqueue({
            offset,
            type: "leet_code_failed"
        } satisfies FailedMessage)
        return responseResult
    }
    //store problem
    const storeResult = await resultify(pb.collection("problems").create({
        title: responseResult.value.questions[0].title,
        slug: responseResult.value.questions[0].titleSlug,
        offset,
        submitted_by: []
    }));
    if(storeResult.isErr()){
        kv.enqueue({
            offset,
            type: "leet_code_failed"
        } satisfies FailedMessage)
        return storeResult
    }

    //increase
    const increaseResult = await resultify(kv.set(OFFSET_KEY, offset+1));
    if(increaseResult.isErr()){
        kv.enqueue({
            offset,
            type: "leet_code_failed"
        } satisfies FailedMessage)
        return increaseResult;
    }

    //finally
    return responseResult
}

