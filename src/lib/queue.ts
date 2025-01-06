import { JsonError, Problem } from "~/lib/types.ts";
import { kv } from "~/lib/kv.ts";
import { z } from "zod";
import daily_report from "~/actions/daily_report.ts";

const DailyReportMessage = z.object({
    type: z.literal("daily-report"),
    date: z.date(),
    created_at: z.date(),
})



export const QueueMessage = z.discriminatedUnion("type", [
    DailyReportMessage,
])
export type QueueMessage = z.infer<typeof QueueMessage>

class Queue {


    async handler(unsafe_message: any) {
        const messageResult = QueueMessage.safeParse(unsafe_message);
        if (!messageResult.success) {
            console.error(`Invalid message: ${unsafe_message}`);
            return;
        }
        const message = messageResult.data;

        switch (message.type) {
            case "daily-report":
                await daily_report(message.date);
                break;
            default:
                console.error(`Unknown message type: ${message.type}`);
                break;
        }

    }



    enqueue(message: QueueMessage) {
        kv.enqueue(message);
    }
}


const queue = new Queue();

export default queue