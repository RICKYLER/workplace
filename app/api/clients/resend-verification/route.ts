import { supabaseAdmin } from "../../../../lib/supabase/server";
import { sendVerificationEmail } from "../../../../lib/mailer";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return Response.json({ error: "Email address is required." }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      return Response.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (profile.verified) {
      return Response.json({
        success: true,
        alreadyVerified: true,
        message: "Your account is already verified. You can log in directly.",
      });
    }

    const verificationToken = crypto.randomUUID();
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from("user_profiles")
      .update({
        verification_token: verificationToken,
        verification_otp: verificationOtp,
        verification_expires: verificationExpires,
      })
      .eq("email", email);

    if (profile.user_id) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(profile.user_id, {
          user_metadata: {
            ...profile.user_metadata,
            verification_token: verificationToken,
            verification_otp: verificationOtp,
          },
        });
      } catch (metaErr) {
        console.warn("Resend update metadata warning:", metaErr);
      }
    }

    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const verificationLink = `${origin}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await sendVerificationEmail({
      to: email,
      fullName: profile.full_name || email,
      verificationLink,
      otpCode: verificationOtp,
    });

    return Response.json({
      success: true,
      message: "Verification email sent successfully! Please check your email inbox.",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return Response.json(
      { error: "Failed to send verification email. " + String(err) },
      { status: 500 }
    );
  }
}
