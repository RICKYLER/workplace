import { supabaseAdmin } from "../../../lib/supabase/server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase projects GET error:", error);
      return Response.json({ projects: [], databaseReady: false, error: error.message });
    }

    const projects = (data || []).map((row) => ({
      id: row.id,
      reference: row.reference,
      client: row.client,
      model: row.model,
      quantity: row.quantity,
      agent: row.agent,
      manager: row.manager,
      stage: row.stage,
      status: row.status,
      priority: row.priority,
      targetDelivery: row.target_delivery || "",
      nextAction: row.next_action || "",
      progress: row.progress || 10,
    }));

    return Response.json({ projects, databaseReady: true });
  } catch (err) {
    return Response.json({ projects: [], databaseReady: false, error: String(err) });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const clientName = String(body.client ?? "").trim();
    const modelName = String(body.model ?? "").trim();
    const agentName = String(body.agent ?? "").trim();

    if (!clientName || !modelName || !agentName) {
      return Response.json({ error: "Client, model, and agent are required." }, { status: 400 });
    }

    const reference = `CV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        reference,
        client: clientName,
        model: modelName,
        agent: agentName,
        manager: String(body.manager ?? "Robespierre T. Agir"),
        quantity: Math.max(1, Number(body.quantity) || 1),
        target_delivery: String(body.targetDelivery ?? ""),
        next_action: String(body.nextAction ?? ""),
        stage: Number(body.stage) || 1,
        priority: String(body.priority ?? "Normal"),
        progress: 12,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const project = {
      id: data.id,
      reference: data.reference,
      client: data.client,
      model: data.model,
      quantity: data.quantity,
      agent: data.agent,
      manager: data.manager,
      stage: data.stage,
      status: data.status,
      priority: data.priority,
      targetDelivery: data.target_delivery || "",
      nextAction: data.next_action || "",
      progress: data.progress || 12,
    };

    return Response.json({ project }, { status: 201 });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
