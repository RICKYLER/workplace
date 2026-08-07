"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (tokenParam && emailParam && status === "idle") {
      autoVerify(tokenParam, emailParam);
    }
  }, [tokenParam, emailParam, status]);

  const autoVerify = async (token: string, mail: string) => {
    setStatus("verifying");
    setMessage("Verifying your account...");

    try {
      const res = await fetch(
        `/api/clients/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(mail)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification failed.");
      }

      setStatus("success");
      setMessage(data.message || "Account successfully verified!");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Verification failed.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      setMessage("Please enter both your email address and 6-digit code.");
      setStatus("error");
      return;
    }

    setStatus("verifying");
    setMessage("Verifying code...");

    try {
      const res = await fetch("/api/clients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification code is invalid or expired.");
      }

      setStatus("success");
      setMessage(data.message || "Account successfully verified!");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Verification code is invalid or expired.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      setResendStatus("Please enter your email address above to resend verification.");
      return;
    }

    setResending(true);
    setResendStatus("");

    try {
      const res = await fetch("/api/clients/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend email.");
      }

      setResendStatus("✅ Verification email sent! Please check your inbox.");
    } catch (err: unknown) {
      setResendStatus(
        "❌ " + (err instanceof Error ? err.message : "Failed to resend email.")
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
          {status === "success" ? "🎉" : status === "verifying" ? "⏳" : "🔐"}
        </div>
        <h1 style={styles.title}>Account Verification</h1>
        <p style={styles.subtitle}>
          Verify your email address using the link sent to your inbox or enter your 6-digit code below.
        </p>
      </div>

      {status === "verifying" && (
        <div style={styles.infoBox}>
          <span>⏳</span> {message}
        </div>
      )}

      {status === "error" && message && (
        <div style={styles.errorBox}>
          <span>⚠️</span> {message}
        </div>
      )}

      {status === "success" ? (
        <div style={styles.successBox}>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#4ade80", fontSize: "1.3rem" }}>🎉 Official Registration Complete!</h3>
          <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.92rem", color: "#cbd5e1" }}>
            {message || "Na-confirm ug official na ang imong account sa Piano Services."}
          </p>
          <Link href="/" style={styles.submitBtn}>
            Proceed to Sign In <span>→</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleOtpSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>6-Digit Verification Code *</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              style={{ ...styles.input, textAlign: "center", fontSize: "1.3rem", letterSpacing: "4px", fontWeight: 700 }}
            />
          </div>

          <button type="submit" disabled={status === "verifying"} style={styles.submitBtn}>
            {status === "verifying" ? "Verifying..." : "Verify Account"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.2rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
              Wala pa nimo na-receive ang email o na-expired ang code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #3b82f6",
                color: "#60a5fa",
                padding: "0.75rem",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {resending ? "🔄 Sending verification email..." : "🔄 Resend Verification Email"}
            </button>
            {resendStatus && (
              <p style={{ fontSize: "0.85rem", marginTop: "0.6rem", color: resendStatus.includes("✅") ? "#4ade80" : "#fca5a5" }}>
                {resendStatus}
              </p>
            )}
          </div>
        </form>
      )}

      <div style={styles.footerNote}>
        <Link href="/" style={styles.footerLink}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={styles.brandBadge}>
          <span style={{ fontSize: "1.2rem" }}>🎹</span>
          <span style={styles.brandTitle}>Piano Services</span>
        </Link>
      </header>

      <main style={styles.mainContent}>
        <Suspense fallback={<div style={{ color: "#fff", textAlign: "center" }}>Loading verification...</div>}>
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    paddingBottom: "3rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  brandBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    textDecoration: "none",
  },
  brandTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#ffffff",
  },
  mainContent: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  card: {
    background: "#1e293b",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2.5rem 2rem",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
  },
  cardHeader: {
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 700,
    margin: "0 0 0.5rem 0",
    color: "#ffffff",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.88rem",
    margin: 0,
    lineHeight: "1.4",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.88rem",
    marginBottom: "1.25rem",
  },
  infoBox: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    color: "#38bdf8",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.88rem",
    marginBottom: "1.25rem",
  },
  successBox: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    padding: "1.5rem",
    borderRadius: "12px",
    margin: "1.5rem 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
    textAlign: "left",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  input: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "0.75rem 0.9rem",
    color: "#f8fafc",
    fontSize: "0.9rem",
    outline: "none",
  },
  submitBtn: {
    display: "block",
    width: "100%",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    padding: "0.85rem",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    marginTop: "0.5rem",
    textDecoration: "none",
    textAlign: "center",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#60a5fa",
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  footerNote: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.88rem",
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontWeight: 600,
  },
};
