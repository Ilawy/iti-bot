import { getENV } from "~/lib/env.ts";
import { createBot } from "@discordeno/bot";

const DISCORD_TOKEN = getENV("DISCORD_TOKEN");

export const discordBot = createBot({
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
