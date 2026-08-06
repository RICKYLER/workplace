import { supabaseAdmin } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const customerName = String(body.customerName ?? body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const itemTitle = String(body.itemTitle ?? "").trim();
    const itemPrice = String(body.itemPrice ?? "").trim();
    const address = String(body.address ?? "").trim();
    const addons = Array.isArray(body.addons) ? body.addons.join(", ") : String(body.addons ?? "");

    if (!customerName || !phone) {
      return Response.json({ error: "Customer name and phone/viber number are required." }, { status: 400 });
    }

    const orderRef = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let savedProject = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .insert({
          reference: orderRef,
          client: customerName,
          model: `${itemTitle} [${itemPrice}]`,
          agent: customerName,
          manager: "Robespierre T. Agir",
          quantity: 1,
          target_delivery: String(body.targetDate ?? "To be scheduled"),
          next_action: `Confirm order & delivery details for ${itemTitle}. Add-ons: ${addons || "None"}`,
          stage: 1,
          priority: "High",
          progress: 10,
          status: "Order Inquired",
        })
        .select()
        .single();

      if (!error && data) {
        savedProject = data;
      }
    } catch (dbErr) {
      console.warn("Orders API DB warning:", dbErr);
    }

    return Response.json(
      {
        success: true,
        orderRef,
        message: "Order inquiry submitted successfully.",
        savedProject,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order submit error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
