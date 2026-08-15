"use client";

import React, { useState, useEffect } from "react";
import QRCodeSVG from "./qr-code-svg";
import BarcodeSVG from "./barcode-svg";

export interface CustomerProcessData {
  id: string;
  name: string;
  contactNumber: string;
  email?: string;
  completeAddress?: string;
  cityArea?: string;
  clientStatus?: string;
  productService?: string;
  priority?: string;
  source?: string;
  customerType?: string;
  dateAdded?: string;
  notes?: string;
  pianos?: { id: string; brand: string; model: string; serialNumber?: string }[];
}

interface QRProcessModalProps {
  customer: CustomerProcessData | null;
  onClose: () => void;
  onUpdateStatus?: (customerId: string, newStatus: string) => void;
  onShowToast?: (msg: string) => void;
}

const OPERATIONAL_PROCESS_STAGES = [
  {
    id: "Sales",
    title: "1. New / Sales Inquiry & Agreement",
    icon: "🎯",
    statuses: ["Prospect Client", "Piano Buyer Prospect", "Follow-up Needed", "Unreachable", "New Client", "Quotation Sent", "Quotation Approved"],
    description: "Initial client inquiry, piano service scope evaluation, official quotation issued & work agreement confirmed.",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    id: "Assessment",
    title: "2. Technical Assessment & Inspection",
    icon: "📋",
    statuses: ["Ready for Assessment", "Waiting for Schedule", "Reschedule", "Field Visit Scheduled", "Scheduled", "Assessment Done"],
    description: "On-site master technician evaluation, soundboard acoustic audit, pinblock torque test, and mechanical inspection.",
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    id: "Service",
    title: "3. Master Service, Repair & Tuning",
    icon: "🛠️",
    statuses: ["In Restoration", "In Tuning Queue", "Warranty (Back Job)", "In Progress", "Parts Pending", "Restoration Underway"],
    description: "Precision pitch raise A440Hz, action regulation, damper felt replacement, pinblock repair & hammer voicing.",
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
  {
    id: "Pullout",
    title: "4. Piano Pullout & Workshop Testing",
    icon: "🎹",
    statuses: ["Piano Pullout", "Pending Piano String Replacement", "Quality Check", "Tone Testing", "Inspection Signed", "Service Complete"],
    description: "Workshop climate-controlled bench regulation, Mapes bass string installation, and acoustic resonance audit.",
    color: "#c2410c",
    bg: "#ffedd5",
  },
  {
    id: "Delivery",
    title: "5. Completion, Delivery & Final Tuning",
    icon: "🚚",
    statuses: ["Action Pullout", "Ready for Delivery", "Delivered", "In Transit"],
    description: "Climate-controlled piano transport, in-home positioning, bench installation & post-delivery pitch verification.",
    color: "#059669",
    bg: "#dcfce7",
  },
];

const PAYMENT_STATUS_OPTIONS = [
  { id: "Payment Pending", label: "Payment Pending", color: "#d97706", bg: "#fef3c7" },
  { id: "Partial Payment", label: "Partial Payment / Downpayment Received", color: "#2563eb", bg: "#eff6ff" },
  { id: "Paid", label: "Paid in Full", color: "#16a34a", bg: "#dcfce7" },
];

export const QRProcessModal: React.FC<QRProcessModalProps> = ({
  customer,
  onClose,
  onUpdateStatus,
  onShowToast,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const currentStatus = customer?.clientStatus || "Ready for Assessment";

  const isPaymentStatus = ["Payment Pending", "Paid", "Partial Payment"].some(
    (st) => st.toLowerCase() === currentStatus.toLowerCase()
  );

  // Calculate active operational service stage (independent of payment)
  let activeStageIndex = OPERATIONAL_PROCESS_STAGES.findIndex((stage) =>
    stage.statuses.some((st) => st.toLowerCase() === currentStatus.toLowerCase())
  );

  if (activeStageIndex === -1) {
    const s = currentStatus.toLowerCase();
    if (s.includes("prospect") || s.includes("sales") || s.includes("follow") || s.includes("unreachable")) activeStageIndex = 0;
    else if (s.includes("assessment") || s.includes("schedule") || s.includes("visit")) activeStageIndex = 1;
    else if (s.includes("restoration") || s.includes("tuning") || s.includes("repair") || s.includes("warranty")) activeStageIndex = 2;
    else if (s.includes("pullout") || s.includes("string") || s.includes("transit")) activeStageIndex = 3;
    else if (s.includes("completion") || s.includes("delivery") || s.includes("complete") || s.includes("delivered") || s.includes("quality")) activeStageIndex = 4;
    else activeStageIndex = 1; // Default
  }

  const progressPct = Math.round(((activeStageIndex + 1) / OPERATIONAL_PROCESS_STAGES.length) * 100);

  useEffect(() => {
    if (!customer) return;
    const refId = customer.id;
    const clientName = customer.name;
    const serviceName = customer.productService || "Piano Service & Restoration";
    const priorityVal = customer.priority || "Normal";

    async function syncToSupabase() {
      try {
        await fetch("/api/qr-tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: refId,
            client: clientName,
            model: serviceName,
            stage: activeStageIndex + 1,
            status: currentStatus,
            priority: priorityVal,
            progress: progressPct,
            targetDelivery: "Scheduled",
            nextAction: OPERATIONAL_PROCESS_STAGES[activeStageIndex]?.description || "Under technical evaluation",
          }),
        });
      } catch (err) {
        console.warn("Supabase QR sync error:", err);
      }
    }
    syncToSupabase();
  }, [customer, currentStatus, activeStageIndex, progressPct]);

  if (!customer) return null;

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/track/${customer.id}`
    : `https://rhps-pianos.ph/track/${customer.id}`;

  const qrPayload = trackingUrl;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      if (onShowToast) onShowToast("🔗 Direct Process Tracking Link copied to clipboard!");
    }
  };

  const handlePrintLabel = () => {
    const printWin = window.open("", "_blank", "width=650,height=750");
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RHPS Master Workshop Tag - ${customer.id}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 30px; text-align: center; color: #0f172a; background: #ffffff; }
            .card { border: 2px solid #0f172a; padding: 24px; border-radius: 16px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .brand-title { font-size: 18px; font-weight: 900; letter-spacing: 0.05em; color: #0f172a; }
            .brand-sub { font-size: 11px; color: #64748b; margin-top: 2px; text-transform: uppercase; }
            hr { border: none; border-top: 1px dashed #cbd5e1; margin: 16px 0; }
            .field { display: flex; justify-content: space-between; font-size: 12px; margin: 6px 0; text-align: left; }
            .field label { color: #64748b; font-weight: 600; }
            .field strong { color: #0f172a; font-weight: 800; }
            .badge { display: inline-block; background: #0f172a; color: #fbbf24; padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 800; margin: 12px 0; }
            .qr { margin: 16px auto; display: flex; justify-content: center; }
            .footer-note { font-size: 10.5px; color: #64748b; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand-title">🎹 R. HERRERO PIANOS</div>
            <div class="brand-sub">Master Piano Craftsmanship & Restoration Tag</div>
            <hr />
            <div class="field"><label>CLIENT ID:</label> <strong>${customer.id}</strong></div>
            <div class="field"><label>CLIENT NAME:</label> <strong>${customer.name}</strong></div>
            <div class="field"><label>SERVICE:</label> <strong>${customer.productService || "Piano Tuning & Service"}</strong></div>
            <div class="field"><label>CONTACT:</label> <strong>${customer.contactNumber}</strong></div>
            <div class="badge">CURRENT STAGE: ${currentStatus}</div>
            <div class="qr" id="qr-container"></div>
            <div class="footer-note">Scan with smartphone camera to open live workshop process status & technician report.</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleNextStage = () => {
    if (activeStageIndex < OPERATIONAL_PROCESS_STAGES.length - 1) {
      const nextStage = OPERATIONAL_PROCESS_STAGES[activeStageIndex + 1];
      const newStatus = nextStage.statuses[0];
      if (onUpdateStatus) {
        onUpdateStatus(customer.id, newStatus);
        if (onShowToast) onShowToast(`🚀 Advanced ${customer.name} to Stage ${activeStageIndex + 2}: ${nextStage.title}`);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(10px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 30px 60px -12px rgba(15, 23, 42, 0.4)",
          width: "100%",
          maxWidth: 880,
          maxHeight: "94vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #e2e8f0",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* EXECUTIVE LUXURY HEADER BAR */}
        <div
          style={{
            padding: "24px 28px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            borderRadius: "24px 24px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #f59e0b",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", color: "#ffffff", padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                👑 MASTER CRAFTSMANSHIP TRACKER
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>REF: {customer.id}</span>
            </div>
            <h3 style={{ margin: "8px 0 2px 0", fontSize: 22, fontWeight: 900, color: "#f8fafc" }}>
              {customer.name}
            </h3>
            <span style={{ fontSize: 12, color: "#cbd5e1" }}>
              📍 {customer.cityArea || "Davao City"} • {customer.completeAddress || "Davao Region"}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              width: 38,
              height: 38,
              borderRadius: "50%",
              fontSize: 18,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            ✕
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* MASTER CERTIFICATE HERO CARD & SCANNABLE QR */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "290px 1fr",
              gap: 22,
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              padding: 24,
              borderRadius: 22,
              border: "1px solid #334155",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.2)",
              color: "#ffffff",
            }}
          >
            {/* QR CODE & BARCODE DISPLAY BOX */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#ffffff",
                padding: "20px 16px",
                borderRadius: 18,
                border: "2px solid #f59e0b",
                boxShadow: "0 6px 20px rgba(245, 158, 11, 0.25)",
              }}
            >
              <QRCodeSVG value={qrPayload} size={155} centerIcon="🎹" />

              {/* 1D LINEAR BARCODE (CODE 128) */}
              <div style={{ marginTop: 14, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <BarcodeSVG value={customer.id} width={220} height={52} barColor="#0f172a" showValue={true} />
              </div>

              <span style={{ fontSize: 10.5, fontWeight: 900, color: "#334155", marginTop: 10, letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "center" }}>
                QR & LINEAR BARCODE (CODE 128)
              </span>

              <div style={{ display: "flex", gap: 10, marginTop: 14, width: "100%" }}>
                <button
                  onClick={handlePrintLabel}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "#0f172a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.2)",
                  }}
                >
                  🖨️ Tag Label
                </button>
                <button
                  onClick={handleCopyLink}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: copiedLink ? "#10b981" : "#f1f5f9",
                    color: copiedLink ? "#ffffff" : "#0f172a",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {copiedLink ? "✓ Copied!" : "🔗 Share Link"}
                </button>
              </div>
            </div>

            {/* INSTRUMENT RESTORATION CERTIFICATE & PROGRESS */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    INSTITUTIONAL SERVICE RECORD
                  </span>
                  <span style={{ background: "#10b981", color: "#ffffff", padding: "3px 12px", borderRadius: 99, fontSize: 11, fontWeight: 900 }}>
                    {progressPct}% COMPLETE
                  </span>
                </div>

                {/* PIANO INSTRUMENT DETAILS */}
                <h4 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
                  🎹 {customer.productService || "Piano Service & Restoration"}
                </h4>
                {customer.pianos && customer.pianos.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {customer.pianos.map((p) => (
                      <span key={p.id} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#f1f5f9", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                        🎹 {p.brand} {p.model} {p.serialNumber && `(S/N: ${p.serialNumber})`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 12 }}>
                    🎹 Standard Piano Instrument Entry
                  </span>
                )}

                {/* WORKSHOP OVERALL PROGRESS BAR */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>
                    <span>Active Stage: Stage {activeStageIndex + 1} of 5</span>
                    <span style={{ color: "#fbbf24" }}>{currentStatus}</span>
                  </div>
                  <div style={{ background: "rgba(255, 255, 255, 0.1)", height: 10, borderRadius: 99, padding: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${progressPct}%`,
                        background: "linear-gradient(90deg, #f59e0b 0%, #10b981 100%)",
                        height: "100%",
                        borderRadius: 99,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>📞 <strong>Contact:</strong> {customer.contactNumber}</div>
                  <div>👤 <strong>Lead Tech:</strong> Master Robespierre T. Agir</div>
                  {customer.email && <div>✉️ <strong>Email:</strong> {customer.email}</div>}
                  <div>⚡ <strong>Priority:</strong> {customer.priority || "Medium"}</div>
                </div>

                {customer.notes && (
                  <div style={{ marginTop: 10, background: "rgba(255, 255, 255, 0.06)", padding: "8px 12px", borderRadius: 8, border: "1px dashed rgba(255, 255, 255, 0.2)", fontSize: 12, color: "#e2e8f0" }}>
                    📝 <em>"{customer.notes}"</em>
                  </div>
                )}
              </div>

              {/* ADVANCE STAGE ACTION BAR */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Staff Quick Control:
                </span>
                {activeStageIndex < OPERATIONAL_PROCESS_STAGES.length - 1 && onUpdateStatus && (
                  <button
                    onClick={handleNextStage}
                    style={{
                      marginLeft: "auto",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    🚀 Advance Service Stage →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DEDICATED INDEPENDENT PAYMENT & DOWNPAYMENT TRANSPARENCY CARD */}
          <div style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: 16, padding: 18, boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>💳</span>
                <strong style={{ fontSize: 14, color: "#0f172a" }}>Independent Payment Transparency Tracker</strong>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99, background: isPaymentStatus ? "#0f172a" : "#f1f5f9", color: isPaymentStatus ? "#fbbf24" : "#475569" }}>
                {isPaymentStatus ? `Payment Status: ${currentStatus}` : "Payment Status: Pending Verification"}
              </span>
            </div>
            <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "#475569", lineHeight: 1.4 }}>
              💡 <strong>Deposit Isolation Rule:</strong> Logging partial deposits or downpayments updates payment records independently and does NOT reset or interrupt the piano's active physical restoration stages.
            </p>
            {onUpdateStatus && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PAYMENT_STATUS_OPTIONS.map((ps) => {
                  const isActive = currentStatus.toLowerCase() === ps.id.toLowerCase();
                  return (
                    <button
                      key={ps.id}
                      onClick={() => {
                        onUpdateStatus(customer.id, ps.id);
                        if (onShowToast) onShowToast(`Updated payment status: ${ps.label}`);
                      }}
                      style={{
                        background: isActive ? ps.color : "#ffffff",
                        color: isActive ? "#ffffff" : ps.color,
                        border: `1.5px solid ${ps.color}`,
                        padding: "6px 14px",
                        borderRadius: 10,
                        fontSize: 11.5,
                        fontWeight: isActive ? 800 : 700,
                        cursor: "pointer",
                        boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isActive ? "● " : "💳 "}{ps.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* VISUAL 5-STAGE OPERATIONAL CRAFTSMANSHIP STEPPER */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                <span>🛠️ Operational Piano Service & Restoration Pipeline</span>
              </h4>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "3px 10px", borderRadius: 99 }}>
                5 Craftsmanship Stages
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {OPERATIONAL_PROCESS_STAGES.map((stage, idx) => {
                const isPassed = idx < activeStageIndex;
                const isCurrent = idx === activeStageIndex;
                const isFuture = idx > activeStageIndex;

                return (
                  <div
                    key={stage.id}
                    style={{
                      display: "flex",
                      gap: 16,
                      background: isCurrent ? stage.bg : isPassed ? "#f8fafc" : "#ffffff",
                      border: `1.5px solid ${isCurrent ? stage.color : isPassed ? "#cbd5e1" : "#e2e8f0"}`,
                      borderRadius: 16,
                      padding: 18,
                      opacity: isFuture ? 0.65 : 1,
                      transition: "all 0.2s ease",
                      boxShadow: isCurrent ? `0 6px 18px ${stage.color}22` : "none",
                    }}
                  >
                    {/* STAGE ICON CIRCLE NODE */}
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background: isCurrent ? stage.color : isPassed ? "#10b981" : "#94a3b8",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        fontWeight: 900,
                        flexShrink: 0,
                        boxShadow: isCurrent ? `0 0 16px ${stage.color}77` : "none",
                      }}
                    >
                      {isPassed ? "✓" : stage.icon}
                    </div>

                    {/* STAGE DESCRIPTION & QUICK CONTROL */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: 14.5, color: isCurrent ? stage.color : "#0f172a" }}>
                          {stage.title}
                        </strong>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: isCurrent ? stage.color : isPassed ? "#dcfce7" : "#f1f5f9",
                            color: isCurrent ? "#ffffff" : isPassed ? "#15803d" : "#64748b",
                          }}
                        >
                          {isPassed ? "COMPLETED" : isCurrent ? "⚡ CURRENT ACTIVE STAGE" : "UPCOMING"}
                        </span>
                      </div>

                      <p style={{ margin: "5px 0 8px 0", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                        {stage.description}
                      </p>

                      {/* QUICK STAGE SELECTION BUTTONS */}
                      {onUpdateStatus && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                          {stage.statuses.map((st) => {
                            const isThisStatus = currentStatus === st;
                            return (
                              <button
                                key={st}
                                onClick={() => {
                                  onUpdateStatus(customer.id, st);
                                  if (onShowToast) onShowToast(`Updated status to: ${st}`);
                                }}
                                style={{
                                  background: isThisStatus ? stage.color : "#ffffff",
                                  color: isThisStatus ? "#ffffff" : "#334155",
                                  border: `1px solid ${isThisStatus ? stage.color : "#cbd5e1"}`,
                                  padding: "3px 10px",
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: isThisStatus ? 800 : 600,
                                  cursor: "pointer",
                                }}
                              >
                                {isThisStatus ? "● " : ""}{st}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MASTER WORKSHOP DIRECT CONTACT CARD */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 18,
              border: "1px solid #334155",
              padding: "18px 22px",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <strong style={{ fontSize: 14, color: "#f8fafc", display: "block" }}>
                💬 Need Service Updates or Special Requests?
              </strong>
              <span style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2, display: "block" }}>
                Assigned Master Technician: <strong>Robespierre T. Agir</strong> (Owner & Head Restorer)
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href="tel:09178429102"
                style={{
                  background: "#10b981",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 12,
                  padding: "8px 16px",
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                📞 Direct Workshop Line
              </a>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: "18px 28px",
            background: "#f8fafc",
            borderTop: "1px solid #cbd5e1",
            borderRadius: "0 0 24px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            🎹 R. Herrero Pianos & Services — Official Craftsmanship & Restoration Vault
          </span>
          <button
            onClick={onClose}
            style={{
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              padding: "9px 22px",
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRProcessModal;
