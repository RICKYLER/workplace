import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  try {
    const { env } = await import("cloudflare:workers" as any);
    if (env?.DB) {
      return drizzle(env.DB, { schema });
    }
  } catch {
    // cloudflare:workers unavailable in standard Next.js environment
  }
  throw new Error("Database binding unavailable in standard local dev mode.");
}
