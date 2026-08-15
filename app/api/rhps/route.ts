import { supabaseAdmin } from "../../../lib/supabase/server";
import { NextRequest } from "next/server";

const ALLOWED_RHPS_TABLES = new Set([
  "rhps_customers",
  "rhps_customer_pianos",
  "rhps_leads",
  "rhps_estimates",
  "rhps_quotations",
  "rhps_customer_cases",
  "rhps_job_cards",
  "rhps_billing_records",
  "rhps_master_lists",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") || "rhps_customers";
    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 100));

    if (!ALLOWED_RHPS_TABLES.has(table)) {
      return Response.json({ error: `Invalid table name: ${table}` }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Supabase GET error on ${table}:`, error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, table, count: data?.length || 0, data });
  } catch (err) {
    console.error("RHPS API GET error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, record } = body;

    if (!table || !ALLOWED_RHPS_TABLES.has(table)) {
      return Response.json({ error: `Invalid table specified: ${table}` }, { status: 400 });
    }

    if (!record || typeof record !== "object") {
      return Response.json({ error: "Record payload object is required." }, { status: 400 });
    }

    const payload = {
      ...record,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from(table)
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      console.error(`Supabase POST error on ${table}:`, error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, table, data });
  } catch (err) {
    console.error("RHPS API POST error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const id = searchParams.get("id");

    if (!table || !ALLOWED_RHPS_TABLES.has(table)) {
      return Response.json({ error: `Invalid table specified: ${table}` }, { status: 400 });
    }

    if (!id) {
      return Response.json({ error: "Record ID parameter is required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from(table).delete().eq("id", id);

    if (error) {
      console.error(`Supabase DELETE error on ${table}:`, error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, table, deletedId: id });
  } catch (err) {
    console.error("RHPS API DELETE error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
