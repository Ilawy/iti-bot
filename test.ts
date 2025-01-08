import { logger } from "~/lib/logger.ts";
import queue from "~/lib/queue.ts";
import { kv } from "~/lib/kv.ts";

kv.listenQueue(queue.handler)
logger.info("Maybe Good news")
