"use client";

import React, { useState, useEffect, useCallback } from "react";

export type ManagedUser = {
  id: number;
  userId: string | null;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  role: string;
  verified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export interface AdminUserManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminUserManagementModal({ isOpen, onClose }: AdminUserManagementProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");

  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load user accounts.");
      }
      setUsers(data.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(deletingUser.email)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user account.");
      }

      setUsers((prev) => prev.filter((u) => u.email !== deletingUser.email));
      showToast(`🗑️ User account ${deletingUser.email} deleted successfully.`);
      setDeletingUser(null);
    } catch (err: unknown) {
      alert("⚠️ " + (err instanceof Error ? err.message : "Failed to delete account."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "VERIFIED") return u.verified;
    if (filterStatus === "UNVERIFIED") return !u.verified;
    return true;
  });

  const verifiedCount = users.filter((u) => u.verified).length;
  const unverifiedCount = users.filter((u) => !u.verified).length;

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.6rem" }}>👥</span>
              <h2 style={styles.title}>Website User Management</h2>
            </div>
            <p style={styles.subtitle}>
              Monitor registered website customer accounts, verification status, and manage access.
            </p>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {toastMsg && <div style={styles.toastBox}>{toastMsg}</div>}

        {/* Stats Row */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{users.length}</span>
            <span style={styles.statLabel}>Total Registered Accounts</span>
          </div>
          <div style={{ ...styles.statCard, borderColor: "rgba(34, 197, 94, 0.3)", background: "rgba(34, 197, 94, 0.08)" }}>
            <span style={{ ...styles.statNum, color: "#4ade80" }}>{verifiedCount}</span>
            <span style={styles.statLabel}>✅ Email Verified Accounts</span>
          </div>
          <div style={{ ...styles.statCard, borderColor: "rgba(234, 179, 8, 0.3)", background: "rgba(234, 179, 8, 0.08)" }}>
            <span style={{ ...styles.statNum, color: "#facc15" }}>{unverifiedCount}</span>
            <span style={styles.statLabel}>⏳ Pending Verification</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={styles.controlsBar}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              style={{
                ...styles.filterBtn,
                background: filterStatus === "ALL" ? "#2563eb" : "#1e293b",
                color: filterStatus === "ALL" ? "#fff" : "#94a3b8",
              }}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("VERIFIED")}
              style={{
                ...styles.filterBtn,
                background: filterStatus === "VERIFIED" ? "#16a34a" : "#1e293b",
                color: filterStatus === "VERIFIED" ? "#fff" : "#94a3b8",
              }}
            >
              Verified ({verifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("UNVERIFIED")}
              style={{
                ...styles.filterBtn,
                background: filterStatus === "UNVERIFIED" ? "#ca8a04" : "#1e293b",
                color: filterStatus === "UNVERIFIED" ? "#fff" : "#94a3b8",
              }}
            >
              Unverified ({unverifiedCount})
            </button>
          </div>

          <button type="button" onClick={fetchUsers} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>

        {/* User Table Content */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.emptyState}>⏳ Loading registered users...</div>
          ) : error ? (
            <div style={styles.errorState}>⚠️ {error}</div>
          ) : filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>No registered accounts match your query.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer Name / Email</th>
                  <th style={styles.th}>Contact / Address</th>
                  <th style={styles.th}>Verification Status</th>
                  <th style={styles.th}>Registered Date</th>
                  <th style={styles.th}>Last Login</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, color: "#f8fafc" }}>{user.fullName}</div>
                      <div style={{ fontSize: "0.82rem", color: "#38bdf8" }}>{user.email}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: "0.88rem", color: "#cbd5e1" }}>{user.phone}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{user.address}</div>
                    </td>
                    <td style={styles.td}>
                      {user.verified ? (
                        <span style={styles.verifiedBadge}>
                          ✅ Verified
                        </span>
                      ) : (
                        <span style={styles.unverifiedBadge}>
                          ⏳ Pending Email Link
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "0.85rem", color: user.lastLoginAt ? "#4ade80" : "#64748b" }}>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never Logged In"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(user)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Delete Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmCard}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚠️</div>
            <h3 style={styles.confirmTitle}>Delete Customer Account?</h3>
            <p style={styles.confirmText}>
              Are you sure you want to permanently delete the account for{" "}
              <strong>{deletingUser.fullName}</strong> (<code>{deletingUser.email}</code>)?
            </p>
            <p style={{ fontSize: "0.82rem", color: "#ef4444", marginBottom: "1.5rem" }}>
              This will remove their profile from the database, client records, and Supabase Auth.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={deleteLoading}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                style={styles.confirmDeleteBtn}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(8px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "1100px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    padding: "2rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    color: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "1rem",
    marginBottom: "1.2rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: 0,
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "0.88rem",
    color: "#94a3b8",
    margin: "0.3rem 0 0 0",
  },
  closeBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#cbd5e1",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: 700,
  },
  toastBox: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "1rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.2rem",
  },
  statCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  statNum: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#38bdf8",
  },
  statLabel: {
    fontSize: "0.82rem",
    color: "#cbd5e1",
    fontWeight: 600,
  },
  controlsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.2rem",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "260px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "0.65rem 1rem",
    color: "#f8fafc",
    fontSize: "0.88rem",
    outline: "none",
  },
  filterBtn: {
    border: "none",
    padding: "0.55rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  refreshBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#38bdf8",
    padding: "0.55rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  tableContainer: {
    flex: 1,
    overflowY: "auto",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    background: "#1e293b",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "0.85rem 1rem",
    backgroundColor: "#0f172a",
    color: "#94a3b8",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #334155",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  td: {
    padding: "0.9rem 1rem",
    verticalAlign: "middle",
  },
  verifiedBadge: {
    display: "inline-block",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    padding: "0.3rem 0.65rem",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  unverifiedBadge: {
    display: "inline-block",
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    border: "1px solid rgba(234, 179, 8, 0.3)",
    color: "#facc15",
    padding: "0.3rem 0.65rem",
    borderRadius: "20px",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  deleteBtn: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "0.45rem 0.8rem",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  emptyState: {
    padding: "3rem",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.92rem",
  },
  errorState: {
    padding: "3rem",
    textAlign: "center",
    color: "#fca5a5",
    fontSize: "0.92rem",
  },
  confirmOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  confirmCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "2rem",
    maxWidth: "440px",
    width: "100%",
    textAlign: "center",
  },
  confirmTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
  },
  confirmText: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
    marginBottom: "0.5rem",
  },
  cancelBtn: {
    background: "#334155",
    color: "#ffffff",
    border: "none",
    padding: "0.65rem 1.25rem",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmDeleteBtn: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    padding: "0.65rem 1.25rem",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
