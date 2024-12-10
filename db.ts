import { load } from 'https://deno.land/std@0.212.0/dotenv/mod.ts'
import PocketBase from 'npm:pocketbase';

const env = await load()

const token = env.PB_TOKEN;

const pb = new PocketBase('https://iti-45.pockethost.io');

pb.authStore.save(token, null);

export default pb