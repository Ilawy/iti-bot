import { LeetCode, ProblemList } from "leetcode-query";
import { Err, Ok, Result } from "ts-results-es";
import pb from "~/lib/db.ts";
import { DIFFICULTY_KEY, kv, TOTAL_PROBLEMS_OF_KEY } from "~/lib/kv.ts";
import { Difficulty, Problem, resultify } from "~/lib/types.ts";
import { ClientResponseError, RecordModel } from "npm:pocketbase";




export const lc = new LeetCode();

const MAX_TRIES = 2;

export async function markProblemAsSent(problem: Problem, message_id: string) {
    const result = await resultify(
        pb.collection("problems").create({
            title: problem.title,
            slug: problem.titleSlug,
            submitted_by: [],
            message_id,
        }),
    );
    return result;
}

export async function getRandomProblem(
    difficulty?: Difficulty,
    total?: number,
    triedIndexes: number[] = [],
    tries = 0,
): Promise<Result<ProblemList["questions"][number], Error>> {
    //difficulty
    let DIFFICULTY: Difficulty;
    if (difficulty) {
        DIFFICULTY = difficulty;
    } else {
        const difficultyResult = await resultify(
            kv.get<Difficulty>(DIFFICULTY_KEY),
        );
        if (difficultyResult.isErr()) {
            console.log(difficultyResult.error);
            return difficultyResult;
        }
        DIFFICULTY = difficultyResult.value.value ?? "EASY";
    }

    //total
    let TOTAL: number;
    if (total) {
        TOTAL = total;
    } else {
        const totalResult = await resultify(
            kv.get<number>(TOTAL_PROBLEMS_OF_KEY(DIFFICULTY)),
        );
        if (totalResult.isErr()) {
            console.log(totalResult.error);
            return totalResult;
        }
        if (!totalResult.value.value) {
            const totalResult2 = await resultify(lc.problems({
                filters: { difficulty: DIFFICULTY },
                limit: 1,
            }).then(d => d.total))
            if (totalResult2.isErr()) {
                console.log(totalResult2.error);
                return totalResult2;
            }
            const totalResult3 = await resultify(
                kv.set(TOTAL_PROBLEMS_OF_KEY(DIFFICULTY), totalResult2.value),
            )
            if (totalResult3.isErr()) {
                console.log(totalResult3.error);
                return totalResult3;
            }
            TOTAL = totalResult2.value;
        } else {
            TOTAL = totalResult.value.value;
        }
    }

    //index
    let INDEX: number;
    do {
        INDEX = Math.floor(Math.random() * TOTAL);
    } while (triedIndexes.includes(INDEX));

    //problem
    const problemResult = await resultify(lc.problems({
        filters: { difficulty: DIFFICULTY },
        offset: INDEX,
        limit: 1,
    }));
    if (problemResult.isErr()) {
        console.log(problemResult.error);
        return problemResult;
    }
    const problem = problemResult.value.questions[0];
    //isSent
    const isSentResult = await resultify<RecordModel, ClientResponseError>(
        pb.collection("problems").getFirstListItem(
            `slug="${problem.titleSlug}"`,
        ),
    );
    if (isSentResult.isErr() && isSentResult.error.status !== 404) {
        return isSentResult;
    }
    const isSent = (isSentResult.isErr() && isSentResult.error.status === 404)
        ? false
        : true;
    if (isSent || problem.isPaidOnly) {
        if (tries >= MAX_TRIES) return Err(new Error("Too many tries"));
        return getRandomProblem(
            difficulty,
            total,
            [...triedIndexes, INDEX],
            tries + 1,
        );
    }

    return Ok(problem);
}



