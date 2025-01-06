import { createBot } from "@discordeno/bot";
import { getRandomProblem, markProblemAsSent } from "~/lib/leet.ts";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { renderProblem } from "~/lib/genpic.tsx";
import { Problem } from "leetcode-query";
import { resultify, toJsonError } from "~/lib/types.ts";
import queue from "~/lib/queue.ts";
import { logger } from 'hono/logger'
import { retry } from "@std/async"

import { kv } from "~/lib/kv.ts";

const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN");
const DISCORD_CHANNEL = Deno.env.get("DISCORD_CHANNEL");
const API_TOKEN = Deno.env.get("API_TOKEN");
if (!DISCORD_TOKEN || !DISCORD_CHANNEL || !API_TOKEN) {
  throw new Error("Missing env vars (DISCORD_TOKEN, DISCORD_CHANNEL, API_TOKEN)");
}

const bot = createBot({
  token: DISCORD_TOKEN,
  events: {
    ready: ({ shardId }) => console.log(`Shard ${shardId} ready`),
  },
  desiredProperties: {
    message: {
      id: true,
    },
  },
});

const everyDayAt6PM = "0 16 * * *";
const everyDayAt10PM = "0 22 * * *";


async function task_leetcode() {
  //problem
  const problem = await retry(async () => {
    const result = await getRandomProblem();
    if (result.isErr()) {
      throw result.error;
    }
    return result.value
  })

  //problem image
  const problemImage = await retry(async () => {
    const result = await resultify(renderProblem(
      problem as unknown as Problem,
      new Date(),
    ));
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  })


  const message = await retry(async () => {
    const result = await resultify(
      bot.helpers.sendMessage(DISCORD_CHANNEL!, {
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
    if (result.isErr()) {
      throw result.error;
    }
    return result.value;
  });

  //mark problem as sent
  await retry(async () => {
    const markResult = await resultify(
      markProblemAsSent(problem, message.id.toString()),
    );
    if (markResult.isErr()) {
      throw markResult.error;
    }
  })
}

Deno.cron("Daily leetcode", everyDayAt6PM, task_leetcode);
Deno.cron("Daily report", everyDayAt10PM, () => {
  queue.enqueue({
    type: "daily-report",
    date: new Date(),
    created_at: new Date(),
  })
})

kv.listenQueue(queue.handler.bind(queue));

const app = new Hono();

app.use(logger())

app.basePath("/api")
  .use(bearerAuth({
    verifyToken(token) {
      return token === Deno.env.get("API_TOKEN");
    },
  }))
  .get("/leetcode/send", async (c) => {
    await task_leetcode();
    return c.json({});
  })
  .get("/leetcode/report", async (c) => {
    queue.enqueue({
      type: "daily-report",
      date: new Date(),
      created_at: new Date(),
    })
    return c.text("NOT BAD")
  })

app.get("/api/leetcode/send", async (c) => {
  await task_leetcode();
  return c.json({});
});

Deno.serve({ port: 8000 }, app.fetch);

//TODO: add command to get the next problem manually
// // TODO: check if there's an already sent challange tody
// //      this can be overridden by and option in getDailyProblem() function to send two problems today
//TODO: add queue handler to re-send failed messages
