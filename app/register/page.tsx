"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleResendEmail = async () => {
    if (!formData.email) return;
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/clients/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend verification email.");
      setResendMsg("✅ Verification email re-sent! Please check your Gmail inbox.");
    } catch (err: unknown) {
      setResendMsg("❌ " + (err instanceof Error ? err.message : "Failed to resend email."));
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/clients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register account.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={styles.brandBadge}>
          <span style={{ fontSize: "1.2rem" }}>🎹</span>
          <span style={styles.brandTitle}>Piano Services</span>
        </Link>
        <Link href="/" style={styles.navLink}>
          Back to Login
        </Link>
      </header>

      <main style={styles.mainContent}>
        {!success ? (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h1 style={styles.title}>Customer Registration</h1>
              <p style={styles.subtitle}>
                Create your customer account to manage your piano orders and service requests.
              </p>
            </div>

            {errorMsg && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Mobile / Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0917 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Address / Location</label>
                <input
                  type="text"
                  placeholder="Street, Barangay, City, Province"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>

            <div style={styles.footerNote}>
              Already have an account?{" "}
              <Link href="/" style={styles.footerLink}>
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>📧</div>
            <h2 style={styles.successTitle}>Check Your Gmail Inbox!</h2>
            <p style={styles.successSubtitle}>
              Na-send na ang confirmation email sa imong Gmail: <strong>{formData.email}</strong>.
            </p>
            <div style={{ backgroundColor: "#0f172a", border: "1px dashed #38bdf8", padding: "1.2rem", borderRadius: "12px", margin: "1.2rem 0", textAlign: "left" }}>
              <p style={{ color: "#38bdf8", fontWeight: 700, margin: "0 0 0.4rem 0", fontSize: "0.95rem" }}>
                📩 Step 1: Open your Gmail Inbox
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                Palihug i-open ang imong Gmail ug i-click ang <strong>&quot;👉 CLICK HERE TO CONFIRM &amp; REGISTER OFFICIAL 👈&quot;</strong> button para ma-official na ang imong account.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem" }}>
              <Link href={`/verify?email=${encodeURIComponent(formData.email)}`} style={styles.loginBtn}>
                Enter Verification Code Manually <span>→</span>
              </Link>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending}
                style={{
                  background: "transparent",
                  border: "1px solid #334155",
                  color: "#60a5fa",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {resending ? "🔄 Sending email..." : "🔄 Resend Verification Email"}
              </button>

              {resendMsg && (
                <p style={{ fontSize: "0.85rem", margin: 0, color: resendMsg.includes("✅") ? "#4ade80" : "#fca5a5" }}>
                  {resendMsg}
                </p>
              )}
            </div>
          </div>
        )}
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
  navLink: {
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  mainContent: {
    maxWidth: "540px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  card: {
    background: "#1e293b",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2rem",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
  },
  cardHeader: {
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    margin: "0 0 0.5rem 0",
    color: "#ffffff",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.9rem",
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
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
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    padding: "0.85rem",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  footerNote: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.88rem",
    color: "#94a3b8",
  },
  footerLink: {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: 600,
  },
  successCard: {
    background: "#1e293b",
    borderRadius: "16px",
    border: "1px solid #334155",
    padding: "2.5rem",
    textAlign: "center",
  },
  successIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  successTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
  },
  successSubtitle: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    marginBottom: "2rem",
  },
  loginBtn: {
    display: "inline-block",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    padding: "0.85rem 1.5rem",
    borderRadius: "10px",
    textDecoration: "none",
  },
};
