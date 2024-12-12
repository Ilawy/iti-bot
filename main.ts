import { createBot } from "npm:@discordeno/bot@19.0.0";
import { getDailyProblem, lc } from "./leet.ts";
import { Hono } from 'npm:hono';
import { renderProblem } from "./genpic.tsx";
import { Problem } from "npm:leetcode-query";

const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN")
const DISCORD_CHANNEL = Deno.env.get("DISCORD_CHANNEL")
if (!DISCORD_TOKEN || !DISCORD_CHANNEL)throw new Error("Missing env vars (DISCORD_TOKEN, DISCORD_CHANNEL)");

const bot = createBot({
  token: DISCORD_TOKEN,
  events: {
    ready: ({ shardId }) => console.log(`Shard ${shardId} ready`),
  },
});

// const threeMinuteCron = "*/3 * * * *";
const everyDayAt6PM = "0 18 * * *";

Deno.cron("Daily leetcode", everyDayAt6PM, async () => {
  const result = await getDailyProblem();
  if (result.isErr()) {
    console.log(result.error);
    return; // will be handled by the queue
  }
  await bot.helpers.sendMessage(DISCORD_CHANNEL, {
    content: `Problem time!  
[${result.value.questions[0].title}](https://leetcode.com/problems/${
      result.value.questions[0].titleSlug
    }/description/)`,
  });
});

const app = new Hono();

app.get("/gen", async (c) => {
  const problem = await lc.problem("median-of-two-sorted-arrays");
  const image = await renderProblem(problem, new Date());
  //cache image for 3 years  
  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  })
})

Deno.serve({ port: 8000 }, app.fetch);

//TODO: add command to get the next problem manually
//TODO: check if there's an already sent challange tody
//      this can be overridden by and option in getDailyProblem() function to send two problems today
//TODO: add queue handler to re-send failed messages