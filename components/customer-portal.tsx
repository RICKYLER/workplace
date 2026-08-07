"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface CustomerUser {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
}

interface CustomerPortalProps {
  customer: CustomerUser;
  initialTab?: string;
  onSignOut: () => void;
  onBackToStore?: () => void;
}

type TabType = "settings" | "orders" | "wishlist" | "vouchers" | "helpline";

export default function CustomerPortal({ customer, initialTab, onSignOut, onBackToStore }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<TabType>((initialTab as TabType) || "settings");

  // Editable Profile Form State
  const nameParts = (customer.fullName || "").trim().split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [email, setEmail] = useState(customer.email || "");
  const [city, setCity] = useState("Davao City");
  const [stateRegion, setStateRegion] = useState("Davao del Sur");
  const [postcode, setPostcode] = useState("8000");
  const [country, setCountry] = useState("Philippines");

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("🎉 Profile Information Updated Successfully!");
  };

  const userInitial = (firstName || "R").charAt(0).toUpperCase();

  return (
    <div style={styles.dashboardContainer}>
      {/* Toast Notice */}
      {toastMsg && <div style={styles.toastNotice}>{toastMsg}</div>}

      {/* ── 1. TOP DEDICATED HEADER BAR ────────────────────────────────────── */}
      <header style={styles.topHeaderBar}>
        <div style={styles.brandGroup}>
          <span style={{ fontSize: "1.4rem" }}>🎹</span>
          <span style={styles.brandTitle}>RHPS PIANO MASTERS</span>
        </div>

        <div style={styles.pageTitleHeader}>
          <span style={styles.headerBreadcrumb}>Customer Dashboard /</span>
          <h1 style={styles.headerTitleText}>Profile</h1>
        </div>

        <div style={styles.headerRightGroup}>
          {onBackToStore && (
            <button onClick={onBackToStore} style={styles.backStoreBtn}>
              🏬 Back to Public Store
            </button>
          )}

          <div style={styles.notifBellBox} onClick={() => showToast("🔔 1 New Notification: Order #RHPS-89124 is in climate transport!")}>
            <span style={{ fontSize: "1.1rem" }}>🔔</span>
            <span style={styles.notifBadge}>1</span>
          </div>

          <div style={styles.userHeaderPill}>
            <div style={styles.headerAvatarCircle}>{userInitial}</div>
            <span style={styles.headerUserName}>{firstName} {lastName}</span>
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>▼</span>
          </div>
        </div>
      </header>

      {/* ── 2. MAIN DASHBOARD BODY (SIDEBAR + WORKSPACE) ───────────────────── */}
      <div style={styles.mainLayoutBody}>
        {/* LEFT NAVIGATION SIDEBAR MENU */}
        <aside style={styles.sidebarMenu}>
          <div style={styles.sidebarSectionTitle}>MENU</div>
          <nav style={styles.sidebarNav}>
            {[
              { id: "settings", label: "Dashboard & Settings", icon: "📊" },
              { id: "orders", label: "My Orders & Tracking", icon: "📦", badge: "1 Active" },
              { id: "wishlist", label: "Saved Wishlist", icon: "❤️" },
              { id: "vouchers", label: "Claimed Vouchers", icon: "🏷️" },
              { id: "helpline", label: "Helpline Messages", icon: "💬", badge: "❶" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                style={
                  activeTab === item.id
                    ? { ...styles.sidebarBtn, ...styles.sidebarBtnActive }
                    : styles.sidebarBtn
                }
              >
                <span style={{ fontSize: "1.05rem" }}>{item.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                {item.badge && (
                  <span style={styles.sidebarBadgeTag}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={styles.sidebarDivider}></div>

          <div style={styles.sidebarSectionTitle}>ACCOUNT</div>
          <button onClick={onSignOut} style={styles.signOutSidebarBtn}>
            <span>🚪 Sign Out</span>
          </button>
        </aside>

        {/* RIGHT MAIN WORKSPACE CANVAS */}
        <main style={styles.workspaceCanvas}>
          {/* TOP VIBRANT BLUE GEOMETRIC COVER BANNER */}
          <div style={styles.blueCoverBanner}>
            <button
              onClick={() => showToast("📷 Cover photo camera action triggered!")}
              style={styles.changeCoverBtn}
            >
              📷 Change Cover
            </button>
          </div>

          {/* TWO COLUMN CONTENT AREA (USER CARD + TAB WORKSPACE) */}
          <div style={styles.contentGrid}>
            {/* LEFT USER PROFILE IDENTITY CARD (OVERLAPPING BANNER) */}
            <div style={styles.userProfileCard}>
              <div style={styles.userPhotoWrap}>
                <div style={styles.userAvatarBigCircle}>{userInitial}</div>
                <div style={styles.cameraIconCircle}>📷</div>
              </div>

              <h2 style={styles.userCardName}>{firstName} {lastName}</h2>
              <span style={styles.userCardSub}>⭐ VIP Piano Customer · Davao City</span>

              <div style={styles.statsListGroup}>
                <div style={styles.statRowItem}>
                  <span style={styles.statLabel}>Orders Placed</span>
                  <span style={{ ...styles.statValBadge, backgroundColor: "#fef3c7", color: "#b45309" }}>
                    1 Active
                  </span>
                </div>
                <div style={styles.statRowItem}>
                  <span style={styles.statLabel}>Completed Services</span>
                  <span style={{ ...styles.statValBadge, backgroundColor: "#dcfce7", color: "#15803d" }}>
                    3 Visits
                  </span>
                </div>
                <div style={styles.statRowItem}>
                  <span style={styles.statLabel}>Active Discounts</span>
                  <span style={{ ...styles.statValBadge, backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                    ₱5,000 Off
                  </span>
                </div>
              </div>

              <button
                onClick={() => showToast("✨ VIP Member Badge verified")}
                style={styles.viewPublicProfileBtn}
              >
                View Public Member Badge
              </button>

              <div style={styles.referralLinkBox}>
                <span style={styles.referralUrlText}>https://rhps.piano/user/{firstName.toLowerCase()}</span>
                <button
                  onClick={() => showToast("📋 Customer referral link copied to clipboard!")}
                  style={styles.copyLinkBtn}
                >
                  📋
                </button>
              </div>
            </div>

            {/* RIGHT WORKSPACE CARD PANEL */}
            <div style={styles.workspaceCardPanel}>
              {/* TOP WORKSPACE TAB BAR */}
              <div style={styles.workspaceTabBar}>
                {[
                  { id: "settings", label: "Account Settings" },
                  { id: "orders", label: "My Orders & Tracking" },
                  { id: "wishlist", label: "Saved Wishlist" },
                  { id: "vouchers", label: "Vouchers & Discounts" },
                  { id: "helpline", label: "Technician Support" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as TabType)}
                    style={
                      activeTab === t.id
                        ? { ...styles.workspaceTabBtn, ...styles.workspaceTabBtnActive }
                        : styles.workspaceTabBtn
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── TAB 1: ACCOUNT SETTINGS FORM ────────────────────────────── */}
              {activeTab === "settings" && (
                <form onSubmit={handleSaveProfile} style={styles.formContainer}>
                  <div style={styles.formTwoColGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>City / Province</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>State / Region</label>
                      <input
                        type="text"
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Postcode / ZIP</label>
                      <input
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={styles.formSelect}
                      >
                        <option value="Philippines">Philippines</option>
                        <option value="Japan">Japan</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" style={styles.blueSubmitBtn}>
                    Update Profile Information
                  </button>
                </form>
              )}

              {/* ── TAB 2: MY ORDERS & TRACKING ─────────────────────────────── */}
              {activeTab === "orders" && (
                <div style={styles.ordersTabContainer}>
                  <h3 style={styles.sectionHeaderTitle}>Active Orders & Package Tracking</h3>

                  <div style={styles.orderCardItem}>
                    <div style={styles.orderCardHeader}>
                      <div>
                        <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>Order #RHPS-89124</strong>
                        <span style={styles.orderDateSub}>Placed on Aug 05, 2026 · Total: ₱185,000</span>
                      </div>
                      <span style={styles.statusBadgeActive}>🚚 In Climate Transport</span>
                    </div>

                    <div style={styles.orderProductRow}>
                      <Image
                        src="/upright-piano.png"
                        alt="Yamaha U1"
                        width={90}
                        height={90}
                        style={{ objectFit: "contain", backgroundColor: "#f8fafc", borderRadius: "12px", padding: "6px" }}
                      />
                      <div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 0.3rem 0" }}>Yamaha U1 Upright Piano</h4>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Polished Ebony Finish · 121 cm Model · Serialized Japan Import</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#0f172a", marginTop: "0.4rem" }}>₱185,000</div>
                      </div>
                    </div>

                    {/* 4-STEP VISUAL TRACKING TIMELINE */}
                    <div style={styles.timelineBox}>
                      <h4 style={{ fontSize: "0.88rem", fontWeight: 800, color: "#475569", marginBottom: "1rem" }}>LIVE DELIVERY TIMELINE</h4>
                      <div style={styles.stepProgressRow}>
                        <div style={styles.stepCol}>
                          <div style={{ ...styles.stepDot, backgroundColor: "#16a34a", color: "#ffffff" }}>✓</div>
                          <span style={styles.stepLabelActive}>Order Confirmed</span>
                        </div>
                        <div style={{ ...styles.stepLine, backgroundColor: "#16a34a" }}></div>

                        <div style={styles.stepCol}>
                          <div style={{ ...styles.stepDot, backgroundColor: "#16a34a", color: "#ffffff" }}>✓</div>
                          <span style={styles.stepLabelActive}>Workshop Tuning</span>
                        </div>
                        <div style={{ ...styles.stepLine, backgroundColor: "#2563eb" }}></div>

                        <div style={styles.stepCol}>
                          <div style={{ ...styles.stepDot, backgroundColor: "#2563eb", color: "#ffffff", boxShadow: "0 0 0 4px #dbeafe" }}>🚚</div>
                          <span style={styles.stepLabelHighlight}>Climate Transport</span>
                        </div>
                        <div style={styles.stepLine}></div>

                        <div style={styles.stepCol}>
                          <div style={styles.stepDot}>🏠</div>
                          <span style={styles.stepLabelMuted}>In-Home Setup</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: SAVED WISHLIST ────────────────────────────────────── */}
              {activeTab === "wishlist" && (
                <div style={styles.wishlistTabContainer}>
                  <h3 style={styles.sectionHeaderTitle}>My Saved Acoustic Pianos</h3>
                  <div style={styles.wishlistGrid}>
                    <div style={styles.wishlistCardTile}>
                      <Image src="/luxury-grand-piano.png" alt="Yamaha C3" width={160} height={120} style={{ objectFit: "contain" }} />
                      <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: "0.6rem 0 0.2rem 0" }}>Yamaha C3 Concert Grand</h4>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>186cm Conservatory Grand</div>
                      <strong style={{ fontSize: "1.1rem", color: "#0f172a", display: "block", margin: "0.5rem 0" }}>₱480,000</strong>
                      <button onClick={() => showToast("🛒 Added Yamaha C3 to Cart!")} style={styles.blueSubmitBtn}>
                        🛒 Add to Cart
                      </button>
                    </div>

                    <div style={styles.wishlistCardTile}>
                      <Image src="/upright-piano.png" alt="Kawai K-300" width={160} height={120} style={{ objectFit: "contain" }} />
                      <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: "0.6rem 0 0.2rem 0" }}>Kawai K-300 Upright</h4>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Carbon Composite Action</div>
                      <strong style={{ fontSize: "1.1rem", color: "#0f172a", display: "block", margin: "0.5rem 0" }}>₱210,000</strong>
                      <button onClick={() => showToast("🛒 Added Kawai K-300 to Cart!")} style={styles.blueSubmitBtn}>
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: VOUCHERS & DISCOUNTS ──────────────────────────────── */}
              {activeTab === "vouchers" && (
                <div style={styles.vouchersTabContainer}>
                  <h3 style={styles.sectionHeaderTitle}>Active Promo Coupons</h3>
                  <div style={styles.voucherGrid}>
                    <div style={styles.voucherCouponBox}>
                      <div style={styles.voucherLeftTag}>₱5,000 OFF</div>
                      <div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>Yamaha Acoustic Purchase</h4>
                        <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0.2rem 0 0.5rem 0" }}>Code: YAMAHA5K · Valid until Dec 2026</p>
                        <button onClick={() => showToast("🏷️ Code YAMAHA5K copied!")} style={styles.copyVoucherBtn}>Copy Code</button>
                      </div>
                    </div>

                    <div style={styles.voucherCouponBox}>
                      <div style={{ ...styles.voucherLeftTag, backgroundColor: "#16a34a" }}>FREE TUNING</div>
                      <div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>In-Home A440 Concert Tuning</h4>
                        <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0.2rem 0 0.5rem 0" }}>Code: FREETUNE2026 · Valid 1 Year</p>
                        <button onClick={() => showToast("🏷️ Code FREETUNE2026 copied!")} style={styles.copyVoucherBtn}>Copy Code</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: TECHNICIAN SUPPORT ───────────────────────────────── */}
              {activeTab === "helpline" && (
                <div style={styles.helplineTabContainer}>
                  <h3 style={styles.sectionHeaderTitle}>Direct Master Technician Helpline</h3>
                  <div style={styles.helplineBox}>
                    <p style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.6 }}>
                      Need help with tuning schedule, humidity heater rod installation, or delivery updates? Speak directly with Master Technician Robert or Ara.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                      <button onClick={() => showToast("📞 Calling Technician Helpline: 0917-123-4567")} style={styles.blueSubmitBtn}>
                        📞 Call 0917-123-4567
                      </button>
                      <button onClick={() => showToast("💬 Opening Live Chat...")} style={styles.backStoreBtn}>
                        💬 Start Live Chat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── FULL-SCREEN DASHBOARD STYLES (MATCHING REFERENCE SCREENSHOT) ───────────
const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  toastNotice: {
    position: "fixed",
    top: "1.5rem",
    right: "1.5rem",
    backgroundColor: "#09090b",
    color: "#ffffff",
    padding: "0.85rem 1.25rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    zIndex: 999999,
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  topHeaderBar: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "0.8rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minWidth: "220px",
  },
  brandTitle: {
    fontSize: "1.1rem",
    fontWeight: 900,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  pageTitleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  headerBreadcrumb: {
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  headerTitleText: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  headerRightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "1.2rem",
  },
  backStoreBtn: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    padding: "0.45rem 0.95rem",
    borderRadius: "10px",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  notifBellBox: {
    position: "relative",
    cursor: "pointer",
  },
  notifBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: "0.65rem",
    fontWeight: 900,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userHeaderPill: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#f1f5f9",
    padding: "0.25rem 0.65rem 0.25rem 0.35rem",
    borderRadius: "20px",
    cursor: "pointer",
  },
  headerAvatarCircle: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: "0.8rem",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerUserName: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  mainLayoutBody: {
    display: "flex",
    minHeight: "calc(100vh - 60px)",
  },
  sidebarMenu: {
    width: "240px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    padding: "1.8rem 1rem",
    display: "flex",
    flexDirection: "column",
  },
  sidebarSectionTitle: {
    fontSize: "0.7rem",
    fontWeight: 800,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    marginBottom: "0.8rem",
    paddingLeft: "0.5rem",
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  sidebarBtn: {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "10px",
    padding: "0.65rem 0.8rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#475569",
    cursor: "pointer",
  },
  sidebarBtnActive: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 800,
  },
  sidebarBadgeTag: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.68rem",
    fontWeight: 800,
    padding: "0.15rem 0.5rem",
    borderRadius: "8px",
  },
  sidebarDivider: {
    height: "1px",
    backgroundColor: "#f1f5f9",
    margin: "1.5rem 0",
  },
  signOutSidebarBtn: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecdd3",
    borderRadius: "10px",
    padding: "0.65rem 0.8rem",
    color: "#dc2626",
    fontSize: "0.85rem",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
  },
  workspaceCanvas: {
    flex: 1,
    padding: "1.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  blueCoverBanner: {
    height: "150px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%)",
    position: "relative",
    padding: "1.2rem",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  changeCoverBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    color: "#ffffff",
    padding: "0.45rem 0.95rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "1.8rem",
    marginTop: "0px",
  },
  userProfileCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "1.8rem 1.5rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    height: "fit-content",
    marginTop: "-70px",
    position: "relative",
    zIndex: 10,
  },
  userPhotoWrap: {
    position: "relative",
    marginBottom: "1rem",
  },
  userAvatarBigCircle: {
    width: "84px",
    height: "84px",
    borderRadius: "50%",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: "2.5rem",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    border: "4px solid #ffffff",
  },
  cameraIconCircle: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #ffffff",
  },
  userCardName: {
    fontSize: "1.25rem",
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 0.2rem 0",
  },
  userCardSub: {
    fontSize: "0.8rem",
    color: "#64748b",
    marginBottom: "1.5rem",
  },
  statsListGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
    padding: "1.2rem 0",
  },
  statRowItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.85rem",
  },
  statLabel: {
    color: "#64748b",
    fontWeight: 500,
  },
  statValBadge: {
    fontSize: "0.75rem",
    fontWeight: 800,
    padding: "0.15rem 0.55rem",
    borderRadius: "6px",
  },
  viewPublicProfileBtn: {
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#334155",
    padding: "0.6rem",
    borderRadius: "10px",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "1rem",
  },
  referralLinkBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.4rem 0.6rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  referralUrlText: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  copyLinkBtn: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  workspaceCardPanel: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "1.8rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  workspaceTabBar: {
    display: "flex",
    gap: "1.5rem",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: "1.8rem",
  },
  workspaceTabBtn: {
    backgroundColor: "transparent",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid transparent",
    paddingBottom: "0.8rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#64748b",
    cursor: "pointer",
  },
  workspaceTabBtnActive: {
    color: "#2563eb",
    fontWeight: 800,
    borderBottomColor: "#2563eb",
  },
  formContainer: {},
  formTwoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  formLabel: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#475569",
  },
  formInput: {
    height: "42px",
    padding: "0 0.9rem",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
  },
  formSelect: {
    height: "42px",
    padding: "0 0.9rem",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
  },
  blueSubmitBtn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.8rem",
    fontSize: "0.9rem",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
  },
  ordersTabContainer: {},
  sectionHeaderTitle: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 1.2rem 0",
  },
  orderCardItem: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  orderCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.2rem",
  },
  orderDateSub: {
    fontSize: "0.8rem",
    color: "#64748b",
    display: "block",
  },
  statusBadgeActive: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: "0.75rem",
    fontWeight: 800,
    padding: "0.25rem 0.65rem",
    borderRadius: "8px",
  },
  orderProductRow: {
    display: "flex",
    alignItems: "center",
    gap: "1.2rem",
    marginBottom: "1.8rem",
  },
  timelineBox: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "1.2rem",
  },
  stepProgressRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
  },
  stepDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#e2e8f0",
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    flex: 1,
    height: "3px",
    backgroundColor: "#e2e8f0",
    margin: "0 0.5rem",
    marginTop: "-18px",
  },
  stepLabelActive: {
    fontSize: "0.78rem",
    fontWeight: 800,
    color: "#16a34a",
  },
  stepLabelHighlight: {
    fontSize: "0.78rem",
    fontWeight: 900,
    color: "#2563eb",
  },
  stepLabelMuted: {
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
  wishlistTabContainer: {},
  wishlistGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.2rem",
  },
  wishlistCardTile: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.2rem",
    textAlign: "center",
  },
  vouchersTabContainer: {},
  voucherGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.2rem",
  },
  voucherCouponBox: {
    backgroundColor: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "1.2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  voucherLeftTag: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "0.78rem",
    fontWeight: 900,
    padding: "0.4rem 0.7rem",
    borderRadius: "8px",
    whiteSpace: "nowrap",
  },
  copyVoucherBtn: {
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "0.35rem 0.65rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  helplineTabContainer: {},
  helplineBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.5rem",
  },
};
