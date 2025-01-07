import { Ok, Result } from "ts-results-es";
import { resultify } from "~/lib/types.ts";
import pb from "~/lib/db.ts";
import { lc } from "~/lib/leet.ts";
import { z } from "zod";

//@deno-types="@types/luxon"
import { DateTime } from 'luxon'
import bot from "~/lib/tg.ts";
import { logger } from "~/lib/logger.ts";

const AcceptedSubmission = z.object({
    id: z.string(),
    titleSlug: z.string(),
    timestamp: z.string().transform(d => DateTime.fromSeconds(Number(d)).setZone("UTC"))
})

const SubmissionsCalendar = z.record(z.string(), z.number().positive())

async function getAcceptedByUsername(username: string) {
    return await lc.graphql({
        query: /* gql */
            `query recentAcSubmissions($username: String!, $limit: Int!) {
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

async function getUserSubmissionsForDate(username: string, unsafe_date: Date) {
    const date = DateTime.fromJSDate(unsafe_date).setZone("UTC")
    if (!date.isValid) throw new Error("Invalid date")
    const result = await lc.graphql({
        query:
            `query userProfileCalendar($username: String!, $year: Int) {
                    matchedUser(username: $username) {
                        userCalendar(year: $year) {
                            submissionCalendar
                        }
                    }
                }`,
        variables: {
            username,
            year: date.year
        }
    }).then(d => SubmissionsCalendar.parse(JSON.parse(d.data.matchedUser.userCalendar.submissionCalendar)))

    const countOfDay = Object.entries(result).find(([k, _v]) => {
        const day = DateTime.fromSeconds(Number(k), { zone: "UTC" })
        return day.hasSame(date, "day")
    })
    if (!countOfDay) return 0;
    return countOfDay[1];
}


export default async function daily_report(raw_day: Date): Promise<Result<any, Error>> {
    const day = DateTime.fromJSDate(raw_day).setZone("UTC");
    const usersResult = await resultify(pb.collection("students").getFullList());
    if (usersResult.isErr()) return usersResult;
    const users = usersResult.value;
    //use node cluster

    const results = await Promise.allSettled(users.map(async user => {
        const acs = await resultify(getAcceptedByUsername(user.leetcode))
        if (acs.isErr()) {
            logger.error(acs.error.message)
            throw acs.error
        }


        return {
            subs: acs.value.filter(sub => sub.timestamp.hasSame(day, 'day')).length,
            username: user.leetcode
        }
    }))

   
    const formattedDate = day.toFormat("yyyy-MM-dd");
    const results_file = new File([JSON.stringify(results.filter(r=>r.status === "fulfilled").map(r=>r.value))], `${formattedDate}.json`, {
        type: "application/json"
    })

    const data = new FormData();
    data.set("date", formattedDate)
    data.set("file", results_file)

    const put_result = await resultify(pb.collection("daily_reports").create(data))
    if(put_result.isErr()){
        logger.error(`unable to upload daily report ${formattedDate}`);
    }

    const message = `Daily report for ${day.toFormat("yyyy\\-MM\\-dd")}:\n\n${results.map(r => r.status === "fulfilled" ? `${r.value.username.replaceAll("-", "\\-").replaceAll("_", "\\_")}: ${r.value.subs}` : `${r.reason}`).join("\n\\-\\-\\-\n")}`
    bot.api.sendMessage("7403177717", message.replaceAll("!", "\\!"), {
        parse_mode: "MarkdownV2"
    })



    return Ok({});
}



