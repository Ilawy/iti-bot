import { Bot } from 'grammy'
import { getENV } from "~/lib/env.ts";


const bot = new Bot(getENV("TG_TOKEN"));

export default bot