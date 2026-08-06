import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.udluqqebhubfswvgodvh:rickycontiga123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

// Disable prepare statements for serverless/Supabase connection pooler compatibility
const client = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });

export const db = drizzle(client, { schema });

export async function getDb() {
  return db;
}
