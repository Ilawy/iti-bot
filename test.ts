import { logger } from "~/lib/logger.ts";
import queue from "~/lib/queue.ts";
import { kv } from "~/lib/kv.ts";

kv.listenQueue(queue.handler);
logger.error(new Error("LoL is not defined"));
