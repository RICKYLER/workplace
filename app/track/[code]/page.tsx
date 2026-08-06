"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";

type ProjectTrack = {
  id: number;
  reference: string;
  client: string;
  model: string;
  quantity: number;
  agent: string;
  manager: string;
  stage: number;
  status: string;
  priority: string;
  targetDelivery: string;
  nextAction: string;
  progress: number;
  createdAt?: string;
  updatedAt?: string;
};

const STAGES = [
  { id: 1, title: "Order Registered", desc: "Client registration & initial order details confirmed", icon: "📝" },
  { id: 2, title: "Initial Inspection", desc: "Diagnostic inspection of pinblock, strings & soundboard", icon: "🔍" },
  { id: 3, title: "Restoration & Polishing", desc: "Cabinet restoration, keytop alignment & interior cleaning", icon: "✨" },
  { id: 4, title: "Tuning & Action Regulation", desc: "Precision pitch tuning, hammer voicing & regulation", icon: "🎼" },
  { id: 5, title: "Quality Control (PDI)", desc: "Master technician final acoustic and mechanical check", icon: "🏅" },
  { id: 6, title: "Scheduled for Delivery", desc: "Climate-controlled piano transport & receiving setup", icon: "🚚" },
  { id: 7, title: "Delivered & Turnkey", desc: "In-home positioning & post-delivery tuning completed", icon: "🎹" },
];

export default function TrackPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectTrack | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchTracking() {
      try {
        setLoading(true);
        const res = await fetch(`/api/track/${encodeURIComponent(code)}`);
        const data = await res.json();

        if (!res.ok || !data.project) {
          throw new Error(data.error || "Tracking reference not found.");
        }

        setProject(data.project);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load tracking data.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      fetchTracking();
    }
  }, [code]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ color: "#fbbf24", fontWeight: 600, fontSize: "1.1rem" }}>
          Loading VIP Piano Tracking Status...
        </p>
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={styles.card}>
            <h2 style={{ color: "#fca5a5", margin: 0 }}>⚠️ Tracking Link Error</h2>
            <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
              {errorMsg || "Unable to locate details for tracking code: " + code}
            </p>
            <Link href="/register" style={styles.primaryLink}>
              ← Register Customer or Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStage = Math.max(1, Math.min(STAGES.length, project.stage || 3));
  const progressPercent = Math.max(15, Math.min(100, project.progress || Math.round((currentStage / STAGES.length) * 100)));

  return (
    <div style={styles.container}>
      {/* Glow effects */}
      <div style={styles.glowTopLeft} />
      <div style={styles.glowBottomRight} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brandBadge}>
          <span style={{ fontSize: "1.3rem" }}>🎹</span>
          <span style={styles.brandTitle}>Rhps Piano Masters</span>
        </div>
        <div style={styles.vipTag}>
          <span>👑 VIP Direct Tracker</span>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* Main Status Hero Card */}
        <div style={styles.heroCard}>
          <div style={styles.heroHeader}>
            <div>
              <span style={styles.refCodeBadge}>REF: {project.reference}</span>
              <h1 style={styles.clientName}>{project.client}</h1>
              <p style={styles.pianoModel}>🎹 {project.model}</p>
            </div>
            <div style={styles.statusBadgeBox}>
              <span style={styles.statusLabel}>CURRENT STATUS</span>
              <span style={styles.statusBadge}>{project.status}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span style={styles.progressTitle}>Restoration & Service Progress</span>
              <span style={styles.progressVal}>{progressPercent}% Complete</span>
            </div>
            <div style={styles.progressBarTrack}>
              <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Key Details Grid */}
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>TARGET DELIVERY</span>
              <span style={styles.infoValue}>📅 {project.targetDelivery || "Aug 20, 2026"}</span>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>ASSIGNED MANAGER</span>
              <span style={styles.infoValue}>👤 {project.manager || "Robespierre T. Agir"}</span>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>NEXT ACTION</span>
              <span style={styles.infoValue}>⚙️ {project.nextAction || "Action tuning & mechanical check"}</span>
            </div>
          </div>
        </div>

        {/* Timeline Stepper */}
        <div style={styles.stepperCard}>
          <h2 style={styles.sectionTitle}>📍 Real-Time Service Stepper</h2>
          <p style={styles.sectionSubtitle}>
            Live updates directly from our workshop. No password needed for your VIP status updates.
          </p>

          <div style={styles.timelineList}>
            {STAGES.map((stg) => {
              const isCompleted = stg.id < currentStage;
              const isCurrent = stg.id === currentStage;

              return (
                <div key={stg.id} style={styles.timelineItem}>
                  {/* Circle indicator */}
                  <div
                    style={{
                      ...styles.circleNode,
                      ...(isCompleted ? styles.nodeCompleted : {}),
                      ...(isCurrent ? styles.nodeCurrent : {}),
                    }}
                  >
                    {isCompleted ? "✓" : stg.icon}
                  </div>

                  {/* Connecting Line */}
                  {stg.id < STAGES.length && (
                    <div
                      style={{
                        ...styles.connectingLine,
                        ...(stg.id < currentStage ? styles.lineCompleted : {}),
                      }}
                    />
                  )}

                  {/* Content */}
                  <div style={styles.nodeContent}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          color: isCurrent ? "#fbbf24" : isCompleted ? "#34d399" : "#64748b",
                        }}
                      >
                        {stg.title}
                      </span>
                      {isCurrent && <span style={styles.liveTag}>LIVE STAGE</span>}
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0.25rem 0 0 0" }}>
                      {stg.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support & Direct Manager Contact */}
        <div style={styles.contactCard}>
          <div>
            <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.2rem", fontWeight: 700 }}>
              💬 Need Assistance or Have Special Requests?
            </h3>
            <p style={{ margin: "0.3rem 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
              Your assigned VIP manager <strong>Robespierre T. Agir</strong> is available directly to assist you.
            </p>
          </div>

          <div style={styles.contactBtnGroup}>
            <a href="tel:09171234567" style={styles.callBtn}>
              📞 Direct Call
            </a>
            <a
              href="https://viber.com"
              target="_blank"
              rel="noreferrer"
              style={styles.viberBtn}
            >
              💬 Viber / WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "1.5rem",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(251, 191, 36, 0.2)",
    borderTop: "4px solid #fbbf24",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  container: {
    minHeight: "100vh",
    backgroundColor: "#0b0f19",
    color: "#f8fafc",
    fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
    paddingBottom: "4rem",
  },
  glowTopLeft: {
    position: "absolute",
    top: "-150px",
    left: "-150px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: "-150px",
    right: "-150px",
    width: "550px",
    height: "550px",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "950px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  brandBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "0.6rem 1.2rem",
    borderRadius: "999px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  brandTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  vipTag: {
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)",
    border: "1px solid #f59e0b",
    color: "#fbbf24",
    padding: "0.4rem 1rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  mainContent: {
    maxWidth: "950px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  heroCard: {
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "2.5rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
  },
  heroHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  refCodeBadge: {
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "#f59e0b",
    background: "rgba(245, 158, 11, 0.15)",
    padding: "0.3rem 0.8rem",
    borderRadius: "6px",
    display: "inline-block",
    marginBottom: "0.6rem",
  },
  clientName: {
    fontSize: "2.2rem",
    fontWeight: 800,
    margin: "0 0 0.3rem 0",
    color: "#f8fafc",
  },
  pianoModel: {
    color: "#cbd5e1",
    fontSize: "1.05rem",
    margin: 0,
    fontWeight: 500,
  },
  statusBadgeBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.3rem",
  },
  statusLabel: {
    fontSize: "0.7rem",
    fontWeight: 800,
    color: "#64748b",
    letterSpacing: "0.08em",
  },
  statusBadge: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.95rem",
    padding: "0.5rem 1.2rem",
    borderRadius: "999px",
    boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)",
  },
  progressSection: {
    marginBottom: "2rem",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: "0.6rem",
  },
  progressTitle: {
    color: "#94a3b8",
  },
  progressVal: {
    color: "#fbbf24",
    fontWeight: 700,
  },
  progressBarTrack: {
    height: "12px",
    background: "rgba(30, 41, 59, 0.8)",
    borderRadius: "999px",
    overflow: "hidden",
    padding: "2px",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #f59e0b 0%, #10b981 100%)",
    borderRadius: "999px",
    transition: "width 0.6s ease-in-out",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  infoCard: {
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: "16px",
    padding: "1.2rem",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  infoLabel: {
    fontSize: "0.7rem",
    fontWeight: 800,
    color: "#64748b",
    letterSpacing: "0.08em",
  },
  infoValue: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#f8fafc",
  },
  stepperCard: {
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "2.5rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    margin: "0 0 0.4rem 0",
    color: "#f8fafc",
  },
  sectionSubtitle: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: "0 0 2rem 0",
  },
  timelineList: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    position: "relative",
  },
  timelineItem: {
    display: "flex",
    gap: "1.5rem",
    position: "relative",
    paddingBottom: "2rem",
  },
  circleNode: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "rgba(30, 41, 59, 0.9)",
    border: "2px solid rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    zIndex: 2,
    flexShrink: 0,
  },
  nodeCompleted: {
    background: "#10b981",
    borderColor: "#10b981",
    color: "#ffffff",
    fontSize: "1.1rem",
    fontWeight: 800,
  },
  nodeCurrent: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    borderColor: "#fbbf24",
    boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
  },
  connectingLine: {
    position: "absolute",
    top: "44px",
    left: "21px",
    width: "2px",
    height: "calc(100% - 44px)",
    background: "rgba(255, 255, 255, 0.1)",
    zIndex: 1,
  },
  lineCompleted: {
    background: "#10b981",
  },
  nodeContent: {
    paddingTop: "0.4rem",
  },
  liveTag: {
    background: "rgba(245, 158, 11, 0.2)",
    color: "#fbbf24",
    border: "1px solid #f59e0b",
    fontSize: "0.65rem",
    fontWeight: 800,
    padding: "0.15rem 0.5rem",
    borderRadius: "4px",
    letterSpacing: "0.05em",
  },
  contactCard: {
    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
    borderRadius: "20px",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    padding: "1.8rem 2.2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  contactBtnGroup: {
    display: "flex",
    gap: "0.8rem",
  },
  callBtn: {
    background: "#10b981",
    color: "#ffffff",
    fontWeight: 700,
    padding: "0.75rem 1.2rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  viberBtn: {
    background: "#7360f2",
    color: "#ffffff",
    fontWeight: 700,
    padding: "0.75rem 1.2rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  card: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "24px",
    padding: "2.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  primaryLink: {
    display: "inline-block",
    marginTop: "1.5rem",
    color: "#fbbf24",
    fontWeight: 700,
    textDecoration: "none",
  },
};
