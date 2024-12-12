import { JsonError, Problem } from "./types.ts";
import { kv } from "./kv.ts";

interface BaseFail {
    error: JsonError;
}

export interface FailedToGetProblem extends BaseFail {
    type: "failed-to-get-problem";
}

export interface FailedToGetImage extends BaseFail {
    type: "failed-to-get-image";
    problem: Problem;
}

export interface FailedToSendProblem extends BaseFail {
    type: "failed-to-send-problem";
    problem: Problem;
}

export interface FailedToMarkProblemAsSent extends BaseFail {
    type: "failed-to-mark-problem-as-sent";
    problem: Problem;
    message_id: string;
}

export type FinalFail =
    | FailedToGetProblem
    | FailedToGetImage
    | FailedToSendProblem
    | FailedToMarkProblemAsSent;

function problem_handler(fail: FailedToGetProblem) {
}

function image_handler(fail: FailedToGetImage) {
}

function send_handler(fail: FailedToSendProblem) {}

function mark_handler(fail: FailedToMarkProblemAsSent) {}

export async function handleQueue(message: FinalFail) {
    switch (message.type) {
        case "failed-to-get-problem":
            return await problem_handler(message);
        case "failed-to-get-image":
            return await image_handler(message);
        case "failed-to-send-problem":
            return await send_handler(message);
        case "failed-to-mark-problem-as-sent":
            return await mark_handler(message);
        default:
            throw new Error("Unknown message type");
    }
}

export async function pushQueue(message: FinalFail) {
    await kv.enqueue(message);
}
