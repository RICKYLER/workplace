import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.udluqqebhubfswvgodvh:rickycontiga123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

const sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });

async function grantPermissions() {
  try {
    console.log("Granting public table permissions for Supabase anon, authenticated, and service_role...");

    await sql.unsafe(`
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role, postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role, postgres;
    `);

    console.log("✅ Successfully granted full permissions for all Supabase roles!");
  } catch (err) {
    console.error("❌ Permission grant error:", err);
  } finally {
    await sql.end();
  }
}

grantPermissions();
