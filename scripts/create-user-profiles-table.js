import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.udluqqebhubfswvgodvh:rickycontiga123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

const sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });

async function migrateDatabase() {
  try {
    console.log("Creating user_profiles table and updating clients table in Supabase PostgreSQL...");

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id TEXT;

      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role, postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role, postgres;
    `);

    console.log("✅ Successfully created user_profiles table and granted privileges!");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await sql.end();
  }
}

migrateDatabase();
