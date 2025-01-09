import { retry } from "@std/async";
import { getRandomProblem, markProblemAsSent } from "~/lib/leet.ts";
import { resultify } from "~/lib/types.ts";
import { renderProblem } from "~/lib/genpic.tsx";
import { Problem } from "leetcode-query";
import { discordBot } from "~/lib/discord.ts";
import { getENV } from "~/lib/env.ts";

const DISCORD_CHANNEL = getENV("DISCORD_CHANNEL");


export default async function daily_task() {
    //problem
    const problem = await retry(async () => {
      const result = await getRandomProblem();
      if (result.isErr()) {
        throw result.error;
      }
      return result.value;
    });
  
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
    });
  
    const message = await retry(async () => {
      const result = await resultify(
        discordBot.helpers.sendMessage(DISCORD_CHANNEL!, {
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
    });
  }
  