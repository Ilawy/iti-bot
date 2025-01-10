import { kv } from "~/lib/kv.ts";
import { z } from "zod";
import daily_report from "~/actions/daily_report.ts";
import daily_task from "~/actions/daily_task.ts";
import { logger } from "~/lib/logger.ts";
import { LogLevel } from "~/lib/types.ts";
import { retry, RetryError } from "@std/async";
//@deno-types="@types/luxon"
import { DateTime } from "luxon";

export const DailyReportMessage = z.object({
  type: z.literal("daily-report"),
  date: z.date(),
  created_at: z.date(),
});

export const LoggerMessage = z.object({
  type: z.literal("logger-message"),
  message: z.string(),
  level: LogLevel,
  meta: z.record(z.string(), z.any()).optional(),
});
export type LoggerMessage = z.infer<typeof LoggerMessage>;

export const DailyTaskMessage = z.object({
  type: z.literal("daily-task"),
});
export type DailyTaskMessage = z.infer<typeof DailyTaskMessage>;

export const QueueMessage = z.discriminatedUnion("type", [
  DailyReportMessage,
  LoggerMessage,
  DailyTaskMessage,
]);
export type QueueMessage = z.infer<typeof QueueMessage>;

class Queue {
  async handler(unsafe_message: unknown) {
    const messageResult = QueueMessage.safeParse(unsafe_message);
    if (!messageResult.success) {
      logger.error(new Error(`Invalid message: ${unsafe_message}`));
      return;
    }
    const message = messageResult.data;

    switch (message.type) {
      case "daily-report":
        logger.log(
          `Daily report for ${
            DateTime.fromJSDate(message.date).toFormat("yyyy-mm-dd")
          }`,
        );
        try {
          await retry(() => daily_report(message.date));
        } catch (error) {
          logger.error(error as Error);
        }
        logger.log("Daily report sent");
        break;
      case "logger-message":
        await logger.$queue_action(message);
        break;
      case "daily-task":
        logger.info("Started daily task");
        try {
          await retry(daily_task);
        } catch (error) {
          logger.error(error as Error);
        }
        break;
      default:
        logger.error(
          new Error(`Unknown message type: ${JSON.stringify(message)}`),
        );
        break;
    }
  }

  enqueue(message: QueueMessage) {
    kv.enqueue(message);
  }
}

const queue = new Queue();

export default queue;
