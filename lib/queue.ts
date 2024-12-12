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

async function problem_handler(fail: FailedToGetProblem) {
    console.log("ERROR", fail.error.message);
 
}

async function image_handler(fail: FailedToGetImage) {
    console.log("ERROR", fail.error.message);
}

async function send_handler(fail: FailedToSendProblem) {
    console.log("ERROR", fail.error.message);
}

async function mark_handler(fail: FailedToMarkProblemAsSent) {
    console.log("ERROR", fail.error.message);
}

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
            return; //! ignore
    }
}

export async function pushQueue(message: FinalFail) {
    await kv.enqueue(message);
}
