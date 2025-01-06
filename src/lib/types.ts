import { Err, Ok, Result } from "npm:ts-results-es";
import { ProblemList } from "npm:leetcode-query";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Problem = ProblemList["questions"][number];

export interface JsonError{
    name: string;
    message: string;
    stack?: string;
    cause?: any;
}

export function toJsonError(error: Error): JsonError{
    return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
    }
}

export async function resultify<T, E = Error>(
    value: Promise<T>,
): Promise<Result<T, E>> {
    try {
        return Ok(await value);
    } catch (e) {
        return Err(e as E);
    }
}