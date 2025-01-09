import { z } from "zod";
import pb from "~/lib/db.ts";
import { LogLevel } from "~/lib/types.ts";
import queue, { LoggerMessage } from "./queue.ts";
import { getENV } from "~/lib/env.ts";

class Logger {
  constructor(private topic: string) {
  }

  async $queue_action(event: LoggerMessage) {
    const localFn = event.level === "INFO"
      ? console.log.bind(console)
      : event.level === "WARN"
      ? console.warn.bind(console)
      : console.error.bind(console);
    localFn(event.message);
    await this.sendPBLog(event.level, event.message);
    await this.ntfyLog(event.level, event.message);
  }

  async sendPBLog(level: LogLevel, message: string) {
    const url = new URL("/logger", pb.baseURL);
    url.searchParams.set("message", message);
    url.searchParams.set("type", level);
    await pb.send("/logger", {
      method: "POST",
      query: {
        message,
        level,
      },
    });
  }

  async ntfyLog(level: LogLevel, message: string) {
    await fetch(`https://ntfy.sh/${this.topic}`, {
      method: "POST",
      body: message.toString(),
      headers: {
        "Title": `${level}`,
        "Priority": level === "ERROR"
          ? "urgent"
          : level === "WARN"
          ? "high"
          : "default",
      },
    });
  }

  info(message: string) {
    queue.enqueue({
      type: "logger-message",
      level: "INFO",
      message,
    });
  }

  get log() {
    return this.info.bind(this);
  }

  warning(message: string | Error) {
    queue.enqueue({
      type: "logger-message",
      level: "WARN",
      message: message.toString(),
    });
  }

  error(message: string | Error) {
    queue.enqueue({
      type: "logger-message",
      level: "ERROR",
      message: message.toString(),
    });
  }
}

const NTFY_TOPIC = getENV("NTFY_TOPIC");

export const logger = new Logger(NTFY_TOPIC);
