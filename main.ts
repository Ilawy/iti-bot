import { load } from "https://deno.land/std@0.212.0/dotenv/mod.ts";
import { createBot } from "npm:@discordeno/bot@19.0.0";
import { getDailyProblem } from "./leet.ts";

const env = await load();

const bot = createBot({
  token: env.DISCORD_TOKEN,
  events: {
    ready: ({ shardId }) => console.log(`Shard ${shardId} ready`),
  },
});

Deno.cron("Daily leetcode", "0 8 * * *", async () => {
  const result = await getDailyProblem();
  if (result.isErr()) {
    console.log(result.error);
    return; // will be handled by the queue
  }
  await bot.helpers.sendMessage(env.DISCORD_CHANNEL, {
    content: `Problem time!  
[${result.value.questions[0].title}](https://leetcode.com/problems/${
      result.value.questions[0].titleSlug
    }/description/)`,
  });
});

//TODO: add command to get the next problem manually
//TODO: add queue handler to re-send failed messages