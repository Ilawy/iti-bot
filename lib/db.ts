import PocketBase from "npm:pocketbase";

const PB_TOKEN = Deno.env.get("PB_TOKEN");
const PB_URL = Deno.env.get("PB_URL");

if (!PB_TOKEN || !PB_URL) {
    throw new Error("Missing env vars (PB_TOKEN, PB_URL)");
}

const token = PB_TOKEN;

const pb = new PocketBase(PB_URL);

pb.authStore.save(token, null);

export default pb;
