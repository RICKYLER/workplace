import { supabaseAdmin } from "../../../../lib/supabase/server";
import { sendVerificationEmail } from "../../../../lib/mailer";
import crypto from "crypto";

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
    if (!password || password.length < 6) {
      return Response.json(
        { error: "Password is required and must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Generate Verification Token & 6-digit OTP Code
    const verificationToken = crypto.randomUUID();
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    let authUser = null;
    let userId = null;

    // 1. Create User in Supabase Auth (unconfirmed email until verified)
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          full_name: fullName,
          phone,
          address,
          verified: false,
          verification_token: verificationToken,
          verification_otp: verificationOtp,
        },
      });

      if (authError) {
        console.warn("Supabase Auth createUser warning:", authError.message);
        if (authError.message?.toLowerCase().includes("already registered") || authError.message?.toLowerCase().includes("already exists")) {
          // Check if profile exists and is verified
          const { data: existingProfile } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (existingProfile && existingProfile.verified) {
            return Response.json(
              { error: "An account with this email address already exists and is verified. Please log in directly." },
              { status: 400 }
            );
          } else if (existingProfile) {
            userId = existingProfile.user_id;
            // Update auth metadata with new verification token and otp
            if (userId) {
              await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                  full_name: fullName,
                  phone,
                  address,
                  verified: false,
                  verification_token: verificationToken,
                  verification_otp: verificationOtp,
                },
              }).catch(() => null);
            }
          }
        }
      } else if (authData?.user) {
        authUser = authData.user;
        userId = authData.user.id;
      }
    } catch (authEx) {
      console.warn("Auth Exception:", authEx);
    }

    // 2. Insert into user_profiles table with verification info
    let savedProfile = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("user_profiles")
        .upsert(
          {
            user_id: userId,
            email,
            full_name: fullName,
            phone: phone || null,
            address: address || null,
            role: "customer",
            verified: false,
            verification_token: verificationToken,
            verification_otp: verificationOtp,
            verification_expires: verificationExpires,
          },
          { onConflict: "email" }
        )
        .select()
        .single();

      if (!error && data) {
        savedProfile = data;
      } else {
        console.warn("user_profiles insert warning:", error?.message);
      }
    } catch (profileErr) {
      console.warn("user_profiles exception:", profileErr);
    }

    // 3. Insert into clients table
    let savedClient = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .insert({
          name: fullName,
          email,
          user_id: userId,
          account_type: "Private",
          contact_person: fullName,
          contact_number: phone || "N/A",
          remarks: `Email: ${email} | Address: ${address} | Unverified Account`,
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

    // 4. Send Verification Email via Nodemailer
    let emailSent = false;
    let emailErrorMsg = "";
    try {
      const origin =
        request.headers.get("origin") ||
        request.headers.get("referer")?.replace(/\/$/, "") ||
        "http://localhost:3000";

      const verificationLink = `${origin}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      await sendVerificationEmail({
        to: email,
        fullName,
        verificationLink,
        otpCode: verificationOtp,
      });

      emailSent = true;
    } catch (mailErr: unknown) {
      console.error("Nodemailer send verification email error:", mailErr);
      emailErrorMsg = mailErr instanceof Error ? mailErr.message : "Failed to send email";
    }

    return Response.json(
      {
        success: true,
        message: emailSent
          ? "Account created! A verification email has been sent to your inbox."
          : "Account created, but verification email could not be sent immediately. You can request a resend on the verification page.",
        emailSent,
        emailErrorMsg,
        customer: {
          userId,
          fullName,
          email,
          phone,
          address,
        },
        profile: savedProfile,
        client: savedClient,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}


