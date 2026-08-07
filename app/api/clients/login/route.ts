import { supabaseAdmin } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();

    if (!email || !password) {
      return Response.json(
        { error: "Email address and password are required." },
        { status: 400 }
      );
    }

    // 1. Check Hardcoded Admin Accounts
    const isRobert =
      (email === "robert" || email === "roberth" || email === "robert@rhps-piano.com") &&
      (password === "password123" || password === "robert2026" || password === "123456");

    const isAra =
      (email === "ara" || email === "ara@rhps-piano.com") &&
      (password === "password123" || password === "ara2026" || password === "123456");

    if (isRobert) {
      return Response.json({
        success: true,
        user: {
          id: "admin-robert",
          email: "robert@rhps-piano.com",
          fullName: "Robert Herrero",
          role: "admin",
          workspace: "RHPS",
        },
      });
    }

    if (isAra) {
      return Response.json({
        success: true,
        user: {
          id: "admin-ara",
          email: "ara@rhps-piano.com",
          fullName: "Ara Mae Marcillo",
          role: "admin",
          workspace: "CV_SALES",
        },
      });
    }

    // 2. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      console.warn("Supabase auth login failed:", authError?.message);

      // Check user_profiles table as fallback check
      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!profile) {
        return Response.json(
          { error: "Invalid email or password. Please check your credentials." },
          { status: 401 }
        );
      }

      return Response.json(
        { error: "Invalid password for this registered account." },
        { status: 401 }
      );
    }

    // 3. Fetch user profile from database
    const authUser = authData.user;
    let userProfile = null;

    try {
      const { data } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      userProfile = data;
    } catch (dbErr) {
      console.warn("Fetch profile warning:", dbErr);
    }

    const isVerifiedInProfile = userProfile ? userProfile.verified === true : false;
    const isVerifiedInMetadata = authUser?.user_metadata?.verified === true;
    const isEmailConfirmedInAuth = !!authUser?.email_confirmed_at;

    const isVerified = isVerifiedInProfile || (isVerifiedInMetadata && isEmailConfirmedInAuth);

    if (!isVerified) {
      return Response.json(
        {
          error: "Dili pa pwede mag log in. Kinahanglan nimo i-verify ang imong account pinaagi sa pag-click sa verification button/link nga gi-send sa imong Gmail inbox.",
          unverified: true,
          email,
        },
        { status: 403 }
      );
    }

    // Update last_login_at timestamp in database
    try {
      await supabaseAdmin
        .from("user_profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("email", email);
    } catch (updateErr) {
      console.warn("Failed to update last_login_at:", updateErr);
    }

    const fullName =
      userProfile?.full_name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      email.split("@")[0];

    return Response.json({
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        fullName,
        phone: userProfile?.phone || authUser.user_metadata?.phone || "",
        address: userProfile?.address || authUser.user_metadata?.address || "",
        role: userProfile?.role || "customer",
      },
      session: authData.session,
    });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
