import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres.udluqqebhubfswvgodvh:rickycontiga123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require",
  },
});
