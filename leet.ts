import { LeetCode } from "npm:leetcode-query";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

const lc = new LeetCode();
const kv = await Deno.openKv();

const OFFSET_KEY: Deno.KvKey = ["leetcode", "offset"];
const DIFFICULTY_KEY: Deno.KvKey = ["leetcode", "difficulty"];


async function updateDailyProblem(oldOffset: number | null = null) {
    let offset: number;
    if (oldOffset) {
        offset = oldOffset;
    } else {
        offset = await kv.get<number>(OFFSET_KEY).then((d) => d.value ??= 0);
    }
    await kv.set(OFFSET_KEY, { value: offset + 1 });
}

async function getDailyProblem() {
    const offset = await kv.get<number>(OFFSET_KEY).then((d) => d.value ??= 0);
    const difficulty = await kv.get<Difficulty>(DIFFICULTY_KEY).then((d) =>
        d.value ??= "EASY"
    );
    const result = await lc.problems({
        filters: {
            difficulty: difficulty,
        },
        limit: 1,
        offset: offset,
    });
    return {
        problem: result.questions[0],
        offset: offset,
    }
}

const result = await getDailyProblem();


// const response = await fetch("https://leetcode.com/api/problems/all/").then(
//     (d) => d.json()
// );
// const problems = response.stat_status_pairs;
// console.log(problems);

// // const randomProblem = problems[Math.floor(Math.random() * problems.length)];
// // const problemTitle = randomProblem.stat.question__title;
// // const problemUrl =
// //     `https://leetcode.com/problems/${randomProblem.stat.question__title_slug}/`;
// // console.log(problemTitle, problemUrl);

// // //   const channel = await client.channels.fetch(channelId);
// // //   channel.send(`Today's LeetCode problem: [${problemTitle}](${problemUrl})`);
