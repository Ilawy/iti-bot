import { Ok, Result } from "ts-results-es";
import { resultify } from "~/lib/types.ts";
import pb from "~/lib/db.ts";
import { lc } from "~/lib/leet.ts";
import { z } from "zod";

//@deno-types="@types/luxon"
import { DateTime } from 'luxon'
import bot from "~/lib/tg.ts";

const AcceptedSubmission = z.object({
    id: z.string(),
    titleSlug: z.string(),
    timestamp: z.string().transform(d => DateTime.fromSeconds(Number(d)).setZone("UTC"))
})

async function getAcceptedByUsername(username: string) {
    return await lc.graphql({
        query: /* gql */`query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
            id
            titleSlug
            timestamp
        }
    }`,
        variables: {
            username,
            limit: 20
        }
    }).then(d => d.data.recentAcSubmissionList).then(subs => AcceptedSubmission.array().parse(subs))

}


export default async function daily_report(raw_day: Date): Promise<Result<any, Error>> {
    const day = DateTime.fromJSDate(raw_day).setZone("UTC");
    const usersResult = await resultify(pb.collection("students").getFullList());
    if (usersResult.isErr()) return usersResult;
    const users = usersResult.value;
    //use node cluster

    const results = Promise.allSettled(users.map(async user => {
        const acs = await resultify(getAcceptedByUsername(user.leetcode))
        if (acs.isErr()) {
            console.error(acs.error)
            throw acs.error
        }


        return {
            subs: acs.value.filter(sub => sub.timestamp.hasSame(day, 'day')).length,
            username: user.leetcode
        }
    }))
    const message = `Daily report for ${day.toFormat("yyyy\\-MM\\-dd")}:\n\n${await results.then(r => r.map(r => r.status === "fulfilled" ? `${r.value.username.replaceAll("-", "\\-").replaceAll("_", "\\_")}: ${r.value.subs}` : `${r.reason}`).join("\n\\-\\-\\-\n"))}`
    bot.api.sendMessage("7403177717", message.replaceAll("!", "\\!"), {
        parse_mode: "MarkdownV2"
    })



    return Ok({});
}




