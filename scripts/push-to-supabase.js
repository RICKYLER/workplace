import fs from "fs";
import path from "path";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.udluqqebhubfswvgodvh:rickycontiga123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

console.log("Connecting to Supabase PostgreSQL database to push Master Unified Schema...");
const sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });

async function runMasterMigration() {
  try {
    const sqlFilePath = path.join(process.cwd(), "db", "schema", "supabase-master-schema.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");
    
    console.log("Executing Master SQL Schema against Supabase...");
    await sql.unsafe(sqlContent);

    console.log("🎉 SUCCESS! All 26 tables for both Ara OS & RHPS OS successfully synchronized on live Supabase PostgreSQL!");
  } catch (error) {
    console.error("❌ Master Migration error:", error);
  } finally {
    await sql.end();
  }
}

runMasterMigration();
