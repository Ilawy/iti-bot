import { FTPClient } from "https://deno.land/x/ftpc/mod.ts";
import { parseArgs } from "@std/cli/parse-args";
import { getENV } from "~/lib/env.ts";
import path from "node:path";



// Connect as anonymous user
using client = new FTPClient(getENV("FTP_HOST"), {
  user: getENV("FTP_USER"),
  pass: getENV("FTP_PASS"),
});

await client.connect();
await client.chdir(getENV("FTP_DIR"))
console.log("Connected!");


for await( const file of await Deno.readDir("pb_hooks")){
  
  if(file.isFile)client.upload(file.name, await Deno.readFile(path.join("pb_hooks", file.name)))
  
}