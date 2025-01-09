import PocketBase from "npm:pocketbase";
import { TypedPocketBase } from "~/lib/pb-types.ts";
import { getENV } from "~/lib/env.ts";

const PB_TOKEN = getENV("PB_TOKEN");
const PB_URL = getENV("PB_URL");

const token = PB_TOKEN;

const pb = new PocketBase(PB_URL) as TypedPocketBase;

pb.authStore.save(token, null);

export default pb;
