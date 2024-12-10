import { load } from 'https://deno.land/std@0.212.0/dotenv/mod.ts'
import { createBot } from 'npm:@discordeno/bot@19.0.0'

const env = await load()

const bot = createBot({
  token: env.DISCORD_TOKEN,
  events: {
    ready: ({ shardId }) => console.log(`Shard ${shardId} ready`),
  },
})

//send message
await bot.helpers.sendMessage(env.DISCORD_CHANNEL, {
  content: "Hello world!",
});




await bot.start()