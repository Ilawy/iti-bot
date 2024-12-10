import { load } from 'https://deno.land/std@0.212.0/dotenv/mod.ts'
import PocketBase from 'npm:pocketbase';

const env = await load()

const token = env.PB_TOKEN;

const pb = new PocketBase(env.PB_URL);

pb.authStore.save(token, null);

export default pb