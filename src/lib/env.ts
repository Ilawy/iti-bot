export function getENV(name: string): string {
  if (Deno.env.has(name)) return Deno.env.get(name)!;
  throw new Error(`Required env (${name}) but missing`);
}

export function getEnvOptional(name: string, def: string) {
  return Deno.env.get(name) || def;
}
