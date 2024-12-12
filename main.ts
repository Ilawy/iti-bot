import { createBot } from "npm:@discordeno/bot@19.0.0";
import { getRandomProblem, lc, markProblemAsSent } from "./lib/leet.ts";
import { Hono } from "npm:hono";
import { renderProblem } from "./lib/genpic.tsx";
import { Problem } from "npm:leetcode-query";
import { resultify, toJsonError } from "./lib/types.ts";
import { FailedToGetProblem, pushQueue } from "./lib/queue.ts";

const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN");
const DISCORD_CHANNEL = Deno.env.get("DISCORD_CHANNEL");
if (!DISCORD_TOKEN || !DISCORD_CHANNEL) {
  throw new Error("Missing env vars (DISCORD_TOKEN, DISCORD_CHANNEL)");
}

const bot = createBot({
  token: DISCORD_TOKEN,
  events: {
    ready: ({ shardId }) => console.log(`Shard ${shardId} ready`),
  },
  desiredProperties: {
    message: {
      id: true
    }
  }
});


const threeMinuteCron = "*/3 * * * *";
const everyDayAt6PM = "0 16 * * *";

Deno.cron("Daily leetcode", everyDayAt6PM, async () => {
  //problem
  const problemResult = await getRandomProblem();
  if (problemResult.isErr()) {
    await pushQueue({
      type: "failed-to-get-problem",
      error: toJsonError(problemResult.error),
    } satisfies FailedToGetProblem)
    return; // will be handled by the queue
  }
  const problem = problemResult.value;

  //problem image
  const problemImageResult = await resultify(renderProblem(
    problem as unknown as Problem,
    new Date(),
  ));
  if (problemImageResult.isErr()) {
    await pushQueue({
      type: "failed-to-get-image",
      error: toJsonError(problemImageResult.error),
      problem
    })
    console.log(problemImageResult.error);
    return; // will be handled by the queue
  }
  const problemImage = problemImageResult.value;

  const messageResult = await resultify(
    bot.helpers.sendMessage(DISCORD_CHANNEL, {
      content: `Problem time!  
[${problem.title}](https://leetcode.com/problems/${problem.titleSlug}/description/)`,
      files: [{
        name: `${problem.titleSlug}.png`,
        blob: new Blob([problemImage], {
          type: "image/png",
        }),
      }],
    }),
  );
  if (messageResult.isErr()) {
    pushQueue({
      type: "failed-to-send-problem",
      error: toJsonError(messageResult.error),
      problem
    })
    return; // will be handled by the queue
  }
  const message = messageResult.value;

  //mark problem as sent
  const markResult = await resultify(markProblemAsSent(problem, message.id.toString()));
  if (markResult.isErr()) {
    await pushQueue({
      type: "failed-to-mark-problem-as-sent",
      error: toJsonError(markResult.error),
      problem,
      message_id: message.id.toString()
    })
    return; // will be handled by the queue
  }
});

const app = new Hono();


Deno.serve({ port: 8000 }, app.fetch);

//TODO: add command to get the next problem manually
// // TODO: check if there's an already sent challange tody
// //      this can be overridden by and option in getDailyProblem() function to send two problems today
//TODO: add queue handler to re-send failed messages
