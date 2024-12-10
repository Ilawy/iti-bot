import { createBot } from "npm:@discordeno/bot@19.0.0";
import { getDailyProblem } from "./leet.ts";

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

Deno.serve({ port: 8000 }, ()=>{
  return new Response("NOT YET USABLE, I GUESS...");
});

//TODO: add command to get the next problem manually
//TODO: add queue handler to re-send failed messages