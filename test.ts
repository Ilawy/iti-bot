import { logger } from "~/lib/logger.ts";
import queue from "~/lib/queue.ts";
import { kv } from "~/lib/kv.ts";
import pb from "~/lib/db.ts";


pb.send("/mailer", {
    method: "POST",
    body: {
        subject: "Hello world",
        body: "<h1>A test email</h1>",
        to: ["next.mohammed.amr@gmail.com"]
    }
})
