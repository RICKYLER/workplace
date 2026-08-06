"use client";

import React, { useState } from "react";

interface WebsiteEditorProps {
  onViewWebsite: () => void;
}

export default function WebsiteEditor({ onViewWebsite }: WebsiteEditorProps) {
  const [activeTab, setActiveTab] = useState<"website" | "editor" | "inquiries">("website");

  // State for Website Editor fields
  const [heroTitle, setHeroTitle] = useState("Master Piano Restoration, Tuning & Premium Sales");
  const [heroTagline, setHeroTagline] = useState("PHILIPPINES PREMIER PIANO SPECIALISTS");
  const [heroDesc, setHeroDesc] = useState("Preserving acoustic excellence. Crafted with passion by Robert Pogs Herrero & the master team.");
  
  const [savedNotice, setSavedNotice] = useState("");

  // Demo inquiries
  const [inquiries] = useState([
    {
      id: 1,
      name: "Davao Philharmonic Society",
      email: "philharmonic@davao.org",
      phone: "0917 888 1234",
      model: "Steinway Model D Concert Grand",
      service: "Concert Pitch Tuning A440",
      date: "Aug 06, 2026",
      status: "New",
      message: "Requesting urgent tuning for upcoming weekend concert.",
    },
    {
      id: 2,
      name: "Dr. Cecilia Tan",
      email: "tan.music@gmail.com",
      phone: "0920 555 9012",
      model: "Yamaha U3 Upright",
      service: "Full Restoration & Polishing",
      date: "Aug 05, 2026",
      status: "In Progress",
      message: "Needs soundboard re-voicing and hammer felt replacement.",
    },
  ]);

  const handleSaveChanges = () => {
    setSavedNotice("✅ Changes saved to draft!");
    setTimeout(() => setSavedNotice(""), 3000);
  };

  const handlePublish = () => {
    setSavedNotice("🎉 Website published live successfully!");
    setTimeout(() => setSavedNotice(""), 3000);
  };

  return (
    <div style={styles.container}>
      {/* Top Header Controls */}
      <div style={styles.topBar}>
        <div style={styles.titleGroup}>
          <span style={{ fontSize: "1.5rem" }}>🌐</span>
          <div>
            <h2 style={styles.title}>Public Website & Content Manager</h2>
            <p style={styles.subtitle}>Control your public website homepage, live inquiries, and landing banners.</p>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={onViewWebsite} style={styles.viewWebsiteBtn}>
            👁️ View Live Website ↗
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabList}>
        <button
          onClick={() => setActiveTab("website")}
          style={{ ...styles.tabBtn, ...(activeTab === "website" ? styles.activeTabBtn : {}) }}
        >
          🖥️ Public Website Overview
        </button>
        <button
          onClick={() => setActiveTab("editor")}
          style={{ ...styles.tabBtn, ...(activeTab === "editor" ? styles.activeTabBtn : {}) }}
        >
          ✏️ Website Editor
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          style={{ ...styles.tabBtn, ...(activeTab === "inquiries" ? styles.activeTabBtn : {}) }}
        >
          📬 View Inquiries ({inquiries.length})
        </button>
      </div>

      {savedNotice && <div style={styles.toastNotice}>{savedNotice}</div>}

      {/* TAB 1: Public Website Overview */}
      {activeTab === "website" && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Public Website Controls</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Manage public website visibility and website editor actions.
          </p>

          <div style={styles.controlGrid}>
            <div style={styles.actionCard} onClick={onViewWebsite}>
              <span style={{ fontSize: "2rem" }}>🌐</span>
              <h4 style={styles.actionTitle}>View Website</h4>
              <p style={styles.actionDesc}>Open and inspect the live public website in new view.</p>
              <span style={styles.actionLink}>Open Page ➔</span>
            </div>

            <div style={styles.actionCard} onClick={() => setActiveTab("editor")}>
              <span style={{ fontSize: "2rem" }}>🎨</span>
              <h4 style={styles.actionTitle}>Edit Website</h4>
              <p style={styles.actionDesc}>Modify headline text, banner photos, and service cards.</p>
              <span style={styles.actionLink}>Launch Editor ➔</span>
            </div>

            <div style={styles.actionCard} onClick={() => setActiveTab("inquiries")}>
              <span style={{ fontSize: "2rem" }}>📩</span>
              <h4 style={styles.actionTitle}>View Inquiries</h4>
              <p style={styles.actionDesc}>Review incoming service requests from website visitors.</p>
              <span style={styles.actionLink}>View Messages ➔</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Website Editor */}
      {activeTab === "editor" && (
        <div style={styles.card}>
          <div style={styles.editorToolbar}>
            <h3 style={styles.cardTitle}>Website Editor Tools</h3>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button onClick={handleSaveChanges} style={styles.saveBtn}>
                💾 Save Changes
              </button>
              <button onClick={handlePublish} style={styles.publishBtn}>
                🚀 Publish Live
              </button>
            </div>
          </div>

          <div style={styles.editorBody}>
            <div style={styles.field}>
              <label style={styles.label}>Banner Tagline (Eyebrow)</label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Hero Headline Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Hero Subtitle / Description</label>
              <textarea
                rows={3}
                value={heroDesc}
                onChange={(e) => setHeroDesc(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.editorActionRow}>
              <button style={styles.uploadBtn}>📷 Upload Hero Photo</button>
              <button style={styles.secondaryBtn} onClick={onViewWebsite}>
                👁️ Preview
              </button>
              <button
                style={styles.resetBtn}
                onClick={() => {
                  setHeroTitle("Master Piano Restoration, Tuning & Premium Sales");
                  setHeroTagline("PHILIPPINES PREMIER PIANO SPECIALISTS");
                  setHeroDesc("Preserving acoustic excellence. Crafted with passion by Robert Pogs Herrero & the master team.");
                }}
              >
                🔄 Reset Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: View Inquiries */}
      {activeTab === "inquiries" && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Live Public Inquiries</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Inquiries received directly from the public website inquiry form.
          </p>

          <div style={styles.inquiryTable}>
            {inquiries.map((inq) => (
              <div key={inq.id} style={styles.inquiryRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <strong style={{ fontSize: "1.05rem", color: "#f8fafc" }}>{inq.name}</strong>
                    <span style={styles.statusBadge}>{inq.status}</span>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                    📧 {inq.email} | 📞 {inq.phone}
                  </div>
                  <div style={{ color: "#fbbf24", fontSize: "0.88rem", marginTop: "0.4rem" }}>
                    🎹 Model: {inq.model} ({inq.service})
                  </div>
                  <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>
                    "{inq.message}"
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Received: {inq.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "2rem",
    color: "#f8fafc",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 800,
    margin: 0,
    color: "#f8fafc",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: 0,
  },
  buttonGroup: {
    display: "flex",
    gap: "0.8rem",
  },
  viewWebsiteBtn: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    fontWeight: 700,
    padding: "0.65rem 1.2rem",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  tabList: {
    display: "flex",
    gap: "0.6rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    paddingBottom: "0.8rem",
    marginBottom: "2rem",
  },
  tabBtn: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#94a3b8",
    padding: "0.65rem 1.2rem",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  activeTabBtn: {
    background: "#f59e0b",
    color: "#000000",
    borderColor: "#f59e0b",
    fontWeight: 800,
  },
  toastNotice: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#34d399",
    padding: "0.75rem 1.2rem",
    borderRadius: "10px",
    marginBottom: "1.5rem",
    fontWeight: 600,
  },
  card: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "2rem",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    margin: "0 0 0.5rem 0",
  },
  controlGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginTop: "1.5rem",
  },
  actionCard: {
    background: "rgba(30, 41, 59, 0.6)",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "1.5rem",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  actionTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: "0.5rem 0 0.3rem 0",
  },
  actionDesc: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: "0 0 1rem 0",
  },
  actionLink: {
    color: "#fbbf24",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  editorToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  saveBtn: {
    background: "#3b82f6",
    color: "#ffffff",
    fontWeight: 700,
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  publishBtn: {
    background: "#10b981",
    color: "#ffffff",
    fontWeight: 700,
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  editorBody: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  input: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.75rem",
    color: "#f8fafc",
    fontSize: "0.9rem",
    outline: "none",
  },
  textarea: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.75rem",
    color: "#f8fafc",
    fontSize: "0.9rem",
    outline: "none",
  },
  editorActionRow: {
    display: "flex",
    gap: "0.8rem",
    marginTop: "1rem",
  },
  uploadBtn: {
    background: "rgba(245, 158, 11, 0.2)",
    border: "1px solid #f59e0b",
    color: "#fbbf24",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
  resetBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    padding: "0.6rem 1rem",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  inquiryTable: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  inquiryRow: {
    background: "rgba(30, 41, 59, 0.6)",
    borderRadius: "12px",
    padding: "1.2rem",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusBadge: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#60a5fa",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
  },
};
