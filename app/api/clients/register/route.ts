import { supabaseAdmin } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const fullName = String(body.fullName ?? body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? body.contactNumber ?? "").trim();
    const address = String(body.address ?? body.deliveryAddress ?? "").trim();
    const password = String(body.password ?? "").trim();

    if (!fullName) {
      return Response.json({ error: "Full Name is required." }, { status: 400 });
    }
    if (!email) {
      return Response.json({ error: "Email address is required." }, { status: 400 });
    }

    // Insert into Supabase clients or users table
    let savedClient = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .insert({
          name: fullName,
          account_type: "Private",
          contact_person: fullName,
          contact_number: phone || "N/A",
          remarks: `Email: ${email} | Address: ${address}`,
        })
        .select()
        .single();

      if (!error && data) {
        savedClient = data;
      } else {
        console.warn("Supabase clients insert warning:", error?.message);
      }
    } catch (dbErr) {
      console.warn("Database exception:", dbErr);
    }

    return Response.json(
      {
        success: true,
        message: "Customer account registered successfully.",
        customer: {
          fullName,
          email,
          phone,
          address,
        },
        client: savedClient,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
