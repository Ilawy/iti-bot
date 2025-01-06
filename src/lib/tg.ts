import { Bot } from 'grammy'

if (!Deno.env.has("TG_TOKEN")) {
    throw new Error("Missing env var (TG_TOKEN)");
}

const bot = new Bot(Deno.env.get("TG_TOKEN")!);

export default bot