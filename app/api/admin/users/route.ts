import { supabaseAdmin } from "../../../../lib/supabase/server";

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch user_profiles error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const users = (profiles || []).map((p) => ({
      id: p.id,
      userId: p.user_id,
      email: p.email,
      fullName: p.full_name || p.email,
      phone: p.phone || "N/A",
      address: p.address || "N/A",
      role: p.role || "customer",
      verified: Boolean(p.verified),
      createdAt: p.created_at,
      lastLoginAt: p.last_login_at || null,
    }));

    return Response.json({ success: true, users });
  } catch (err) {
    console.error("GET admin users error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let email = searchParams.get("email")?.trim().toLowerCase() || "";
    let userId = searchParams.get("userId")?.trim() || "";

    if (!email && request.headers.get("content-type")?.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      email = String(body.email || "").trim().toLowerCase();
      userId = String(body.userId || "").trim();
    }

    if (!email && !userId) {
      return Response.json(
        { error: "User email or userId is required for deletion." },
        { status: 400 }
      );
    }

    let targetProfile = null;
    if (email) {
      const { data } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      targetProfile = data;
    } else if (userId) {
      const { data } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      targetProfile = data;
    }

    const targetEmail = targetProfile?.email || email;
    const targetUserId = targetProfile?.user_id || userId;

    // 1. Delete from user_profiles table
    if (targetEmail) {
      await supabaseAdmin.from("user_profiles").delete().eq("email", targetEmail);
    }

    // 2. Delete from clients table
    if (targetEmail) {
      await supabaseAdmin.from("clients").delete().eq("email", targetEmail);
    }

    // 3. Delete from Supabase Auth
    if (targetUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      } catch (authErr) {
        console.warn("Delete auth user warning:", authErr);
      }
    }

    return Response.json({
      success: true,
      message: `User account (${targetEmail}) deleted successfully from database and auth.`,
    });
  } catch (err) {
    console.error("DELETE admin user error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
