import { supabaseAdmin } from "../../../../lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim() || "";
    const email = searchParams.get("email")?.trim().toLowerCase() || "";

    if (!token || !email) {
      return Response.json(
        { error: "Verification token and email are required." },
        { status: 400 }
      );
    }

    return await processVerification({ email, token });
  } catch (err) {
    console.error("Verification GET error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const token = String(body.token ?? "").trim();
    const otp = String(body.otp ?? body.code ?? "").trim();

    if (!email) {
      return Response.json({ error: "Email address is required." }, { status: 400 });
    }

    if (!token && !otp) {
      return Response.json(
        { error: "Please provide a verification token or 6-digit code." },
        { status: 400 }
      );
    }

    return await processVerification({ email, token, otp });
  } catch (err) {
    console.error("Verification POST error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

async function processVerification({
  email,
  token,
  otp,
}: {
  email: string;
  token?: string;
  otp?: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanInputToken = String(token ?? "").trim();
  const cleanInputOtp = String(otp ?? "").trim();

  // Fetch user profile from database
  const { data: profile, error } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error || !profile) {
    return Response.json(
      { error: "Account profile not found for this email address." },
      { status: 404 }
    );
  }

  if (profile.verified) {
    return Response.json({
      success: true,
      alreadyVerified: true,
      message: "Your account is already verified! You can proceed to log in.",
    });
  }

  const cleanDbToken = String(profile.verification_token ?? "").trim();
  const cleanDbOtp = String(profile.verification_otp ?? "").trim();

  let matchesToken = cleanInputToken.length > 0 && cleanDbToken.length > 0 && cleanDbToken === cleanInputToken;
  let matchesOtp = cleanInputOtp.length > 0 && cleanDbOtp.length > 0 && cleanDbOtp === cleanInputOtp;

  // Fallback: Check Supabase Auth user_metadata if profile table check didn't match
  if (!matchesToken && !matchesOtp && profile.user_id) {
    try {
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
      if (authUserData?.user?.user_metadata) {
        const meta = authUserData.user.user_metadata;
        const metaOtp = String(meta.verification_otp ?? "").trim();
        const metaToken = String(meta.verification_token ?? "").trim();
        if (cleanInputToken && metaToken === cleanInputToken) matchesToken = true;
        if (cleanInputOtp && metaOtp === cleanInputOtp) matchesOtp = true;
      }
    } catch (metaErr) {
      console.warn("User metadata check warning:", metaErr);
    }
  }

  if (!matchesToken && !matchesOtp) {
    return Response.json(
      { error: "Invalid verification link or code. Please check your latest email and try again." },
      { status: 400 }
    );
  }

  // Check expiration if set
  if (profile.verification_expires) {
    const expiresAt = new Date(profile.verification_expires).getTime();
    if (Date.now() > expiresAt) {
      return Response.json(
        { error: "Verification token has expired. Please click 'Resend Verification Email'." },
        { status: 400 }
      );
    }
  }

  // Update profile to verified
  const { error: updateErr } = await supabaseAdmin
    .from("user_profiles")
    .update({
      verified: true,
      verification_token: null,
      verification_otp: null,
      verification_expires: null,
    })
    .eq("email", normalizedEmail);

  if (updateErr) {
    console.error("Failed to update user profile verification state:", updateErr);
  }

  // Update Supabase Auth if userId exists
  if (profile.user_id) {
    try {
      await supabaseAdmin.auth.admin.updateUserById(profile.user_id, {
        email_confirm: true,
        user_metadata: { verified: true },
      });
    } catch (authErr) {
      console.warn("Supabase Auth update user status warning:", authErr);
    }
  }

  return Response.json({
    success: true,
    message: "Your account has been successfully verified! You can now log in.",
  });
}
