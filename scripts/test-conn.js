import postgres from "postgres";

const poolerHosts = [
  "aws-0-ap-southeast-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-us-west-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
];

async function testConnections() {
  for (const host of poolerHosts) {
    const connStr = `postgresql://postgres.udluqqebhubfswvgodvh:rickycontiga123@${host}:6543/postgres?sslmode=require`;
    console.log(`Testing host: ${host}...`);
    const sql = postgres(connStr, { connect_timeout: 5 });
    try {
      const res = await sql`SELECT NOW();`;
      console.log(`🎉 SUCCESS! Connected to Supabase via ${host}:`, res);
      await sql.end();
      return connStr;
    } catch (err) {
      console.log(`Failed on ${host}:`, err.message);
      await sql.end();
    }
  }

  // Also test direct port 5432 with host udluqqebhubfswvgodvh.supabase.co
  try {
    const directStr = `postgresql://postgres:rickycontiga123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`;
    console.log(`Testing direct port 5432...`);
    const sql = postgres(directStr, { connect_timeout: 5 });
    const res = await sql`SELECT NOW();`;
    console.log(`🎉 SUCCESS! Connected via direct port 5432:`, res);
    await sql.end();
    return directStr;
  } catch (err) {
    console.log(`Direct port failed:`, err.message);
  }
}

testConnections();
