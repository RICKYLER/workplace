import postgres from "postgres";

const projectRef = "udluqqebhubfswvgodvh";
const regions = [
  "ap-southeast-1",
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "eu-central-1",
  "eu-west-1",
  "ap-northeast-1",
  "ap-southeast-2",
  "ap-south-1"
];

async function findPooler() {
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    const connStr = `postgresql://postgres.${projectRef}:rickycontiga123@${host}:5432/postgres?sslmode=require`;
    console.log(`Testing ${reg} (port 5432)...`);
    const sql = postgres(connStr, { connect_timeout: 4, ssl: { rejectUnauthorized: false, servername: `db.${projectRef}.supabase.co` } });
    try {
      const res = await sql`SELECT NOW();`;
      console.log(`🎯 SUCCESS FOUND! Host: ${host}`);
      console.log(`DATABASE_URL=${connStr}`);
      await sql.end();
      return connStr;
    } catch (err) {
      if (!err.message.includes("tenant/user")) {
        console.log(`Response from ${reg}:`, err.message);
      }
      await sql.end();
    }
  }
}

findPooler();
