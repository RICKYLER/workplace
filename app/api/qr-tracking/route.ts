import { supabaseAdmin } from "../../../lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reference,
      client,
      model,
      stage,
      status,
      priority,
      progress,
      targetDelivery,
      nextAction,
      agent,
      manager,
    } = body;

    const trackingRef = String(reference || "").trim();
    if (!trackingRef) {
      return Response.json({ error: "Reference code is required." }, { status: 400 });
    }

    // Check if record exists in Supabase
    const { data: existing } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("reference", trackingRef)
      .maybeSingle();

    const payload = {
      reference: trackingRef,
      client: String(client || "Valued Customer").trim(),
      model: String(model || "Piano Tuning & Restoration Service").trim(),
      stage: Number(stage) || 1,
      status: String(status || "Ready for Assessment").trim(),
      priority: String(priority || "Normal").trim(),
      progress: Math.min(100, Math.max(10, Number(progress) || 20)),
      target_delivery: String(targetDelivery || "Scheduled").trim(),
      next_action: String(nextAction || "Under technical evaluation").trim(),
      agent: String(agent || "Robespierre T. Agir").trim(),
      manager: String(manager || "Master Technician").trim(),
      updated_at: new Date().toISOString(),
    };

    let resultData;
    let resultError;

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      resultData = data;
      resultError = error;
    } else {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .insert({
          ...payload,
          quantity: 1,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      resultData = data;
      resultError = error;
    }

    if (resultError) {
      console.error("Supabase QR sync error:", resultError);
      return Response.json({ error: resultError.message }, { status: 500 });
    }

    return Response.json({ success: true, project: resultData });
  } catch (err) {
    console.error("QR tracking API error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
