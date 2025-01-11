import { createBot } from "@discordeno/bot";
import { getRandomProblem, markProblemAsSent } from "~/lib/leet.ts";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { renderProblem } from "~/lib/genpic.tsx";
import { Problem } from "leetcode-query";
import { resultify, toJsonError } from "~/lib/types.ts";
import queue from "~/lib/queue.ts";
import { logger as loggerMiddleware } from "hono/logger";
import { retry } from "@std/async";

import { kv } from "~/lib/kv.ts";
import pb from "~/lib/db.ts";
import { logger } from "~/lib/logger.ts";
import { getENV } from "~/lib/env.ts";

const everyDayAt6PM = "0 16 * * *";
const everyDayAt10PM = "0 21 * * *";
// const everyHalfHour = "*/30 * * * *";

Deno.cron("Daily leetcode", everyDayAt6PM, () => {
  queue.enqueue({
    type: "daily-task",
  });
});
Deno.cron("Daily report", everyDayAt10PM, () => {
  queue.enqueue({
    type: "daily-report",
    date: new Date(),
    created_at: new Date(),
  });
});

kv.listenQueue(queue.handler.bind(queue));

const app = new Hono();

app.use(loggerMiddleware());

app.basePath("/api")
  .use(bearerAuth({
    verifyToken(token) {
      return token === getENV("API_TOKEN");
    },
  }))
  .get("/leetcode/send", async (c) => {
    queue.enqueue({
      type: "daily-task",
    });
    return c.json({});
  })
  .get("/leetcode/report", async (c) => {
    queue.enqueue({
      type: "daily-report",
      date: new Date(),
      created_at: new Date(),
    });
    return c.text("NOT BAD");
  })
  .get("/testmail", c=>{
    queue.enqueue({
      type: "unsafe-send-mail",
      to: ["next.mohammed.amr@gmail.com"],
      body: "<h1>This is an email</h1><br>This is how we can start a new era<br><i>:)</i>",
      subject: "Hello world"
    })
    return c.text("SUCCESS")
  })
  ;

Deno.serve({ port: 8000 }, app.fetch);

//TODO: add command to get the next problem manually
// // TODO: check if there's an already sent challange tody
// //      this can be overridden by and option in getDailyProblem() function to send two problems today
//TODO: add queue handler to re-send failed messages
