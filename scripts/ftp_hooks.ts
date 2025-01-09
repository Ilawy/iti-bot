import { FTPClient } from "https://deno.land/x/ftpc/mod.ts";
import { parseArgs } from "@std/cli/parse-args";

const args = parseArgs(Deno.args, {
  string: ["server", "user", "pass"],
});

if (!args.server) throw new Error("--server is required");

// Connect as anonymous user
using client = new FTPClient(args.server, {
  user: args.user,
  pass: args.pass,
});

await client.connect();
console.log("Connected!");

// Download test file
console.log("Downloading...");

{
  using file = await Deno.open("./5MB.zip", {
    create: true,
    write: true,
  });

  // Use Readable and Writable interface for fast and easy tranfers.
  await using stream = await client.downloadReadable("5MB.zip");
  await stream.pipeTo(file.writable);
} // Because of `await using`, finalizeStream is called and server is notified.

// Since we did `using`, connection is automatically closed.
console.log("Finished!");
