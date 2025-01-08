import { kv } from "~/lib/kv.ts";
import { z } from "zod";
import daily_report from "~/actions/daily_report.ts";
import { logger } from "~/lib/logger.ts";
import { LogLevel } from "~/lib/types.ts";

export const DailyReportMessage = z.object({
    type: z.literal("daily-report"),
    date: z.date(),
    created_at: z.date(),
})

export const LoggerMessage = z.object({
    type: z.literal("logger-message"),
    message: z.string(),
    level: LogLevel,
})
export type LoggerMessage = z.infer<typeof LoggerMessage>



export const QueueMessage = z.discriminatedUnion("type", [
    DailyReportMessage,
    LoggerMessage
])
export type QueueMessage = z.infer<typeof QueueMessage>

class Queue {


    async handler(unsafe_message: unknown) {
        const messageResult = QueueMessage.safeParse(unsafe_message);
        if (!messageResult.success) {
            logger.error(`Invalid message: ${unsafe_message}`);
            return;
        }
        const message = messageResult.data;

        switch (message.type) {
            case "daily-report":
                logger.log(`Daily report for ${message.date}`);
                await daily_report(message.date);
                logger.log("Daily report sent");
                break;
            case "logger-message":
                await logger.$queue_action(message);
                break;
            default:
                logger.error(`Unknown message type: ${JSON.stringify(message)}`);
                break;
        }

    }



    enqueue(message: QueueMessage) {
        kv.enqueue(message);
    }
}


const queue = new Queue();

export default queue