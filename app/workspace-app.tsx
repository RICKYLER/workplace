"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import RhpsWorkspace from "./rhps-workspace";
import "./workspace.css";
import { supabase } from "../lib/supabase/client";
import PublicWebsite from "../components/public-website";
import WebsiteEditor from "../components/website-editor";
import CustomerPortal, { CustomerUser } from "../components/customer-portal";
import AdminUserManagementModal from "../components/admin-user-management";

type Project = {
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
};


type NavItem = { id: string; label: string; icon: string; count?: number; disabled?: boolean };

const demoProjects: Project[] = [
  {
    id: 1,
    reference: "CV-2026-001",
    client: "City Emergency Response Fleet",
    model: "H-100 Ambulance",
    quantity: 3,
    agent: "Kath",
    manager: "Robespierre T. Agir",
    stage: 9,
    status: "In Fabrication",
    priority: "Urgent",
    targetDelivery: "Aug 12, 2026",
    nextAction: "Confirm body fabrication progress",
    progress: 64,
  },
  {
    id: 2,
    reference: "CV-2026-002",
    client: "Provincial Mobile Services",
    model: "HD65 Wing Van",
    quantity: 2,
    agent: "RAM",
    manager: "Robespierre T. Agir",
    stage: 11,
    status: "For PDI",
    priority: "High",
    targetDelivery: "Aug 08, 2026",
    nextAction: "Complete mechanical inspection",
    progress: 78,
  },
  {
    id: 3,
    reference: "CV-2026-003",
    client: "Municipal Rescue Upgrade",
    model: "Porter II Rescue Vehicle",
    quantity: 1,
    agent: "Ergem",
    manager: "Robespierre T. Agir",
    stage: 7,
    status: "Pending Documents",
    priority: "Normal",
    targetDelivery: "Aug 17, 2026",
    nextAction: "Follow up acceptance requirements",
    progress: 42,
  },
  {
    id: 4,
    reference: "CV-2026-004",
    client: "Regional Logistics Support",
    model: "HD78 Dropside",
    quantity: 4,
    agent: "Darnet",
    manager: "Robespierre T. Agir",
    stage: 13,
    status: "Delivery Scheduling",
    priority: "High",
    targetDelivery: "Aug 06, 2026",
    nextAction: "Confirm trucking and receiving team",
    progress: 88,
  },
];

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "FOCUS",
    items: [
      { id: "dashboard", label: "Dashboard (3.1)", icon: "⌂" },
      { id: "website_editor", label: "Public Website & Inquiries", icon: "🌐" },
      { id: "urgent", label: "Urgent", icon: "!", count: 5 },
      { id: "today", label: "Today", icon: "◷", count: 8 },
      { id: "upcoming", label: "Upcoming 15 Days", icon: "◫", count: 14 },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { id: "leads", label: "Lead / Client Intake", icon: "♙" },
      { id: "inventory", label: "Inventory (Units)", icon: "◇" },
      { id: "allocations", label: "Allocation & Unit Assignment", icon: "⎍" },
      { id: "documents", label: "Documents & Legal", icon: "▤" },
      { id: "followups", label: "Follow-Ups", icon: "↗" },
      { id: "pdi", label: "Fabrication & PDI", icon: "⚙" },
      { id: "releases", label: "Releases & Gate Pass", icon: "⌁" },
      { id: "expenses", label: "Expenses & Budget", icon: "₱" },
      { id: "collections", label: "Collection & Bank PO", icon: "🏦" },
      { id: "insurance", label: "Insurance", icon: "🛡" },
      { id: "incentives", label: "Incentives (PIN Locked)", icon: "☆" },
      { id: "caltex", label: "Caltex Cards", icon: "回" },
    ],
  },
  {
    title: "PEOPLE & INSIGHTS",
    items: [
      { id: "clients", label: "Clients", icon: "♟" },
      { id: "agents", label: "Agents / Persons", icon: "♢" },
      { id: "reports", label: "Reports & Analytics", icon: "◒" },
      { id: "workflow", label: "17-Stage Workflow", icon: "⇢" },
      { id: "files", label: "File Library", icon: "▱" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { id: "ai", label: "Haven AI Assistant", icon: "✦", disabled: false },
      { id: "settings", label: "Master Lists & Settings", icon: "⚙" },
    ],
  },
];

const trackerContent: Record<string, { title: string; subtitle: string; metrics: [string, string][]; columns: string[]; rows: string[][] }> = {
  urgent: { title: "Urgent Work", subtitle: "Critical items that need action now.", metrics: [["5", "Urgent items"], ["2", "Overdue"], ["1", "Blocked"]], columns: ["Priority", "PROJECT", "Issue", "Owner", "Due"], rows: [["Urgent", "City Emergency Response Fleet", "Fabrication update overdue", "Kath", "Today"], ["Urgent", "Regional Logistics Support", "Trucking not confirmed", "Ara", "Today"], ["High", "Municipal Rescue Upgrade", "2 documents missing", "Ergem", "Tomorrow"]] },
  today: { title: "Today's Work", subtitle: "Everything lined up for today.", metrics: [["8", "Due today"], ["3", "Completed"], ["5", "Remaining"]], columns: ["Time", "Task", "Project", "Owner", "Status"], rows: [["9:00 AM", "Supplier coordination", "City Emergency Response Fleet", "Ara", "Ongoing"], ["11:00 AM", "PDI checklist", "Provincial Mobile Services", "Ara", "Pending"], ["2:00 PM", "Delivery confirmation", "Regional Logistics Support", "Darnet", "Pending"]] },
  upcoming: { title: "Upcoming 15 Days", subtitle: "A clear view of the next two weeks.", metrics: [["14", "Upcoming"], ["4", "Deliveries"], ["6", "Follow-ups"]], columns: ["Date", "Activity", "Project", "Category", "Days"], rows: [["Aug 06", "Confirm delivery team", "Regional Logistics Support", "Delivery", "3"], ["Aug 08", "Complete PDI", "Provincial Mobile Services", "Inspection", "5"], ["Aug 12", "Fabrication target", "City Emergency Response Fleet", "Fabrication", "9"]] },
  leads: { title: "Lead / Client Intake (3.2)", subtitle: "Intake details, Account Type, PHILGEPS ITB, and legal check.", metrics: [["26", "Total clients"], ["4", "New leads"], ["11", "Active projects"]], columns: ["Client Name", "Account Type", "Contact Person", "PHILGEPS ITB", "Legal Status"], rows: [["City Emergency Response Fleet", "Government", "Juan Dela Cruz", "ITB-2026-901", "Complete"], ["Provincial Mobile Services", "Government", "Maria Santos", "ITB-2026-442", "Complete"], ["Coop Transport Federation", "Cooperative", "Pedro Reyes", "N/A", "Missing Docs"]] },
  inventory: { title: "Inventory Tracker (3.3 - Source of Truth)", subtitle: "Availability, CS #, VIN #, Engine #, Model, Color, and Location.", metrics: [["38", "Total units"], ["12", "Available"], ["9", "Assigned"]], columns: ["CS #", "Model Description", "Color", "Location", "Dealers Price", "Status"], rows: [["CS-98124", "HD65 Cab & Chassis", "White", "Davao Yard", "₱1,850,000", "Available"], ["CS-87421", "H-100 Shuttle", "Silver", "Fabricator", "₱1,220,000", "Assigned"], ["CS-65239", "HD78 Dropside", "White", "Davao Yard", "₱2,100,000", "For Review"]] },
  allocations: { title: "Allocation / Unit Assignment (3.4)", subtitle: "Unit selection from inventory assigned to agent & GSM.", metrics: [["9", "Active allocations"], ["2", "Docs missing"], ["7", "Ready"]], columns: ["CS #", "Client Name", "Assigned Agent", "GSM", "Legal Warning"], rows: [["CS-87421", "City Emergency Response Fleet", "Kath", "Robespierre T. Agir", "Clear"], ["CS-65239", "Coop Transport Federation", "RAM", "Robespierre T. Agir", "Warning: Missing PO"]] },
  documents: { title: "Documents & Legal Compliance (3.5)", subtitle: "NOA, NTP, PO, Contract Agreement, Notarial, and Transmittal.", metrics: [["84%", "Overall complete"], ["7", "Missing"], ["18", "Received"]], columns: ["CS # / Client", "Document Type", "Requirement Status", "Notarial", "Transmittal"], rows: [["City Emergency Fleet", "NOA (Notice of Award)", "Submitted", "Not Required", "Complete"], ["City Emergency Fleet", "NTP (Notice to Proceed)", "Submitted", "Not Required", "Complete"], ["Coop Transport Federation", "Contract Agreement", "Missing", "For Notarial", "Pending"]] },
  followups: { title: "Follow-Up Tracker (3.6)", subtitle: "18 spec categories: Missing PO, NOA, NTP, Contract, Bank PO, Insurance, Releases.", metrics: [["11", "Open follow-ups"], ["3", "Due today"], ["2", "Overdue"]], columns: ["CS #", "Client", "Lacking Requirement", "Action Needed", "Due Date", "Status"], rows: [["CS-98124", "Provincial Mobile Services", "Missing PO", "Call Procurement Officer", "Today", "Due"], ["CS-65239", "Coop Transport Federation", "Contract Agreement", "Submit for notarization", "Tomorrow", "Scheduled"]] },
  pdi: { title: "PDI & Inspection (3.7)", subtitle: "Checklist before release: Findings, corrections, schedule, and waivers.", metrics: [["7", "In fabrication"], ["3", "For PDI"], ["1", "Needs recheck"]], columns: ["CS #", "Model", "PDI Status", "Findings / Remarks", "Scheduled Date"], rows: [["CS-87421", "H-100 Shuttle", "Completed", "All clear - ready for release", "Aug 04"], ["CS-65239", "HD78 Dropside", "Ongoing", "Checking mechanical & paint", "Aug 06"]] },
  releases: { title: "Releases & Gate Pass (3.8)", subtitle: "13-item pre-release checklist, Gate Pass clearance, and actual release.", metrics: [["9", "Ready for release"], ["6", "Released"], ["1", "Gate pass pending"]], columns: ["CS #", "Client", "Gate Pass", "Checklist (13 Items)", "Release Status"], rows: [["CS-87421", "City Emergency Response Fleet", "Complete", "13/13 Complete", "Ready"], ["CS-65239", "Regional Logistics Support", "Missing", "10/13 - Gate Pass missing", "Blocked"]] },
  expenses: { title: "Accounting & Expenses (3.9)", subtitle: "Budget requested, approved, released, liquidated, and unliquidated balance.", metrics: [["₱450,000", "Total requested"], ["₱380,000", "Released"], ["₱70,000", "Unliquidated"]], columns: ["Project / Client", "Requested", "Released", "Liquidated", "Unliquidated Balance", "Status"], rows: [["City Emergency Response Fleet", "₱150,000", "₱150,000", "₱110,000", "₱40,000", "Released"], ["Provincial Mobile Services", "₱200,000", "₱200,000", "₱170,000", "₱30,000", "Released"]] },
  collections: { title: "Collection & Bank PO (3.10)", subtitle: "3+ month Bank PO tracking & collection statuses.", metrics: [["₱12.4M", "Pending collection"], ["5", "In submission"], ["3", "Approved"]], columns: ["Project / Client", "Bank PO Status", "Expected Amount", "Collected Amount", "Due Date"], rows: [["City Emergency Response Fleet", "Waiting Approval", "₱4,500,000", "₱0", "Sep 15, 2026"], ["Provincial Mobile Services", "Approved", "₱3,800,000", "₱1,000,000", "Aug 20, 2026"]] },
  agents: { title: "Agents / Persons", subtitle: "Reference data directory for Sales Agents, GSM, and Accounting (no login auth).", metrics: [["6", "Active persons"], ["4", "Sales agents"], ["1", "Manager"]], columns: ["Full Name", "Role", "Department", "Contact Number", "Active Status"], rows: [["Ara Mae Marcillo", "CV Sales Admin", "Sales Admin", "0917-000-0000", "Active"], ["Robespierre T. Agir", "General Sales Manager", "Sales Management", "0918-111-2222", "Active"], ["RAM", "Sales Consultant", "Sales", "0919-222-3333", "Active"], ["Kath", "Sales Consultant", "Sales", "0920-333-4444", "Active"], ["Darnet", "Sales Consultant", "Sales", "0921-444-5555", "Active"], ["Ergem", "Sales Consultant", "Sales", "0922-555-6666", "Active"]] },
  insurance: { title: "Insurance Management (3.12)", subtitle: "Policy records, custom company entries, active status, and expiry alerts.", metrics: [["18", "Active policies"], ["3", "Expiring soon"], ["5", "Companies"]], columns: ["CS #", "Insurance Company", "Policy #", "Expiry Date", "Status"], rows: [["CS-87421", "Standard Insurance", "POL-99214", "Dec 31, 2026", "Active"], ["CS-65239", "FPG Insurance", "POL-88123", "Aug 28, 2026", "Expiring Soon"]] },
  incentives: { title: "Incentive Tracker (3.13 - PIN Protected)", subtitle: "Restricted monitoring requiring Invoice, DR, and HTB Sales Leads.", metrics: [["6", "This month"], ["4", "Submitted"], ["2", "Pending"]], columns: ["CS #", "Sales Consultant", "Req Docs (Invoice / DR / HTB)", "Incentive Amount", "Status"], rows: [["CS-87421", "Kath", "Attached (3/3)", "₱25,000", "Submitted"], ["CS-65239", "RAM", "Missing HTB Leads (2/3)", "₱30,000", "Pending Docs"]] },
  reports: { title: "Reports & Analytics (3.14)", subtitle: "Clickable operational reports, printable views, Excel/PDF export.", metrics: [["12", "Saved reports"], ["6", "Operational"], ["4", "Monthly"]], columns: ["Report Title", "Period", "Format", "Last Generated", "Action"], rows: [["Inventory Status Report", "Current", "Excel / PDF", "Today", "Export"], ["Sales & Releases Summary", "August 2026", "PDF", "Yesterday", "Export"], ["Pending Expenses & Liquidation", "Current", "Excel", "Today", "Export"]] },
  tasks: { title: "Daily Task Tracker", subtitle: "Prioritized work with clear owners and deadlines.", metrics: [["23", "Open"], ["8", "Due today"], ["5", "Completed"]], columns: ["Task", "Project", "Owner", "Priority", "Due"], rows: [["Request missing documents", "Municipal Rescue Upgrade", "Ara", "High", "Today"], ["Confirm accessory list", "City Emergency Response Fleet", "Kath", "Normal", "Aug 05"], ["Prepare delivery packet", "Regional Logistics Support", "Ara", "High", "Aug 06"]] },
  caltex: { title: "Caltex Card Monitoring", subtitle: "Card distribution with masked numbers and proof.", metrics: [["13", "Total cards"], ["9", "Received"], ["4", "Pending"]], columns: ["Card", "Recipient", "Unit", "Status", "Date"], rows: [["•••• 4821", "Demo Recipient A", "H-100", "Received", "Aug 01"], ["•••• 1176", "Demo Recipient B", "HD65", "Pending", "—"], ["•••• 9034", "Demo Recipient C", "HD78", "Received", "Jul 29"]] },
  clients: { title: "Client Directory", subtitle: "Reusable client records with connected projects and history.", metrics: [["26", "Active clients"], ["4", "New this month"], ["11", "With active projects"]], columns: ["Client", "Type", "Contact", "Active Projects", "Last Update"], rows: [["City Emergency Response Fleet", "Government", "Primary Contact", "1", "Today"], ["Provincial Mobile Services", "Government", "Primary Contact", "1", "Today"], ["Municipal Rescue Upgrade", "Government", "Primary Contact", "1", "Yesterday"]] },
  files: { title: "File Library", subtitle: "Production-ready storage linked to projects, units, and stages.", metrics: [["34", "Files"], ["12", "Documents"], ["16", "Photos"]], columns: ["File", "Category", "Linked Record", "Uploaded", "Status"], rows: [["quotation-sample.pdf", "Quotation", "City Emergency Response Fleet", "Aug 03", "Available"], ["pdi-photo-01.jpg", "PDI Photo", "Provincial Mobile Services", "Aug 03", "Available"], ["delivery-draft.pdf", "Delivery", "Regional Logistics Support", "Aug 02", "Draft"]] },
};

const themes = [
  { name: "Ara Signature", key: "rose", collection: "Signature", swatches: ["#7d4f67", "#e8c8d4", "#fbf6f3"] },
  { name: "Corporate Navy", key: "corporate", collection: "Office", swatches: ["#173f73", "#3d6fa8", "#eef3f8"] },
  { name: "Black & White", key: "mono", collection: "Office", swatches: ["#050505", "#ffffff", "#8f8f8f"] },
];

const stages = ["Inquiry", "Sales Consultant", "Quotation", "Decision", "PO / NOA", "Project Encoding", "Documents", "Availability", "Fabrication", "Monitoring", "PDI", "Delivery Docs", "Scheduling", "Delivery", "Acceptance", "Billing", "After-Sales"];

function statusBadge(value: string) {
  const v = value.toLowerCase();
  if (v.includes("urgent") || v.includes("overdue") || v.includes("missing") || v.includes("blocked") || v.includes("awol") || v.includes("resigned")) return { icon: "🔴", tone: "red" };
  if (v.includes("pending") || v.includes("waiting") || v.includes("draft") || v.includes("requested")) return { icon: "🟡", tone: "amber" };
  if (v.includes("complete") || v.includes("received") || v.includes("released") || v.includes("available") || v.includes("clear") || v.includes("active")) return { icon: "🟢", tone: "green" };
  if (v.includes("review") || v.includes("pdi") || v.includes("correction")) return { icon: "🟣", tone: "purple" };
  return { icon: "🔵", tone: "blue" };
}

function placeholderAction(label: string) {
  window.alert(`${label} is ready for Phase 1 execution.`);
}

function Status({ children }: { children: string }) {
  const badge = statusBadge(children);
  return <span className={`status ${badge.tone}`}><span style={{ marginRight: 5 }}>{badge.icon}</span>{children}</span>;
}

export default function WorkspaceApp({ authenticatedName }: { authenticatedName: string | null }) {
  const [activeUser, setActiveUser] = useState<string>("Ara Mae Marcillo");
  const [activeWorkspace, setActiveWorkspace] = useState<"CV_SALES" | "RHPS" | "CUSTOMER">("CV_SALES");
  const [customerData, setCustomerData] = useState<CustomerUser | null>(null);
  const [entered, setEntered] = useState(true);
  const [showPortalLogin, setShowPortalLogin] = useState(false);
  const [showAdminUserManagement, setShowAdminUserManagement] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [portalMode, setPortalMode] = useState<"signin" | "register">("signin");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSuccessMsg, setRegSuccessMsg] = useState("");


  const [sessionMinutes, setSessionMinutes] = useState(15);
  const [active, setActive] = useState("dashboard");
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [personsList, setPersonsList] = useState<string[][]>([
    ["Ara Mae Marcillo", "CV Sales Admin", "Sales Admin", "ara@cars.com", "Active"],
    ["Robespierre T. Agir", "General Sales Manager", "Sales Management", "0918-111-2222", "Active"],
    ["RAM", "Sales Consultant", "Sales", "0919-222-3333", "Active"],
    ["Kath", "Sales Consultant", "Sales", "0920-333-4444", "Active"],
    ["Darnet", "Sales Consultant", "Sales", "0921-444-5555", "Active"],
    ["Ergem", "Sales Consultant", "Sales", "0922-555-6666", "Active"],
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [agentPinUnlocked, setAgentPinUnlocked] = useState(false);
  const [showAgentPinModal, setShowAgentPinModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState("rose");
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState("large");
  const [fontColor, setFontColor] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");

  const [toast, setToast] = useState("");
  const [openAiTrigger, setOpenAiTrigger] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastActivityRef = useRef(0);
  const warningShownRef = useRef(false);

  const handleAddPerson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const position = formData.get("position") as string;
    const email = (formData.get("email") as string) || "N/A";
    const status = (formData.get("status") as string) || "Active";

    if (fullName && position) {
      setPersonsList((prev) => [
        [fullName, position, "Sales / Admin", email, status],
        ...prev,
      ]);
      setShowAddPersonModal(false);
      setToast(`Person "${fullName}" added successfully!`);
      setTimeout(() => setToast(""), 4000);
    }
  };

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.projects) && data.projects.length) setProjects(data.projects);
      })
      .catch(() => undefined);

    const channel = supabase
      .channel("realtime:projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new;
            const item: Project = {
              id: newRow.id,
              reference: newRow.reference,
              client: newRow.client,
              model: newRow.model,
              quantity: newRow.quantity,
              agent: newRow.agent,
              manager: newRow.manager,
              stage: newRow.stage,
              status: newRow.status,
              priority: newRow.priority,
              targetDelivery: newRow.target_delivery || "",
              nextAction: newRow.next_action || "",
              progress: newRow.progress || 12,
            };
            setProjects((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
            setToast(`⚡ Supabase Realtime: Project ${item.reference} added live!`);
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new;
            setProjects((prev) =>
              prev.map((p) =>
                p.id === row.id
                  ? {
                      ...p,
                      client: row.client,
                      model: row.model,
                      quantity: row.quantity,
                      agent: row.agent,
                      stage: row.stage,
                      status: row.status,
                      priority: row.priority,
                      targetDelivery: row.target_delivery || p.targetDelivery,
                      nextAction: row.next_action || p.nextAction,
                      progress: row.progress || p.progress,
                    }
                  : p
              )
            );
            setToast(`⚡ Supabase Realtime: ${row.reference} updated live!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  useEffect(() => {
    const savedTheme = window.localStorage.getItem("cv-sales-admin-theme");
    if (savedTheme && themes.some((item) => item.key === savedTheme)) {
      const frame = window.requestAnimationFrame(() => setTheme(savedTheme));
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    const savedFontSize = window.localStorage.getItem("cv-sales-admin-font-size");
    if (savedFontSize && ["medium", "large", "xlarge"].includes(savedFontSize)) {
      setFontSize(savedFontSize);
    } else if (savedFontSize === "normal") {
      setFontSize("medium");
    }
  }, []);

  useEffect(() => {
    setFontColor(window.localStorage.getItem("cv-sales-admin-font-color") ?? "");
    setBackgroundColor(window.localStorage.getItem("cv-sales-admin-background-color") ?? "");
  }, []);

  useEffect(() => {
    try {
      const noirUserRaw = window.localStorage.getItem("atelier-noir-user");
      if (noirUserRaw) {
        const u = JSON.parse(noirUserRaw);
        if (u && (u.email || u.name)) {
          const identifier = String(u.email || u.name).toLowerCase();
          if (identifier.includes("robert") || identifier.includes("roberth")) {
            setActiveWorkspace("RHPS");
            setActiveUser(u.name || "Robert Herrero");
            return;
          } else if (identifier.includes("ara")) {
            setActiveWorkspace("CV_SALES");
            setActiveUser(u.name || "Ara Mae Marcillo");
            return;
          }
        }
      }

      const savedUser = window.localStorage.getItem("rhps_customer_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.email || parsed.fullName)) {
          const identifier = String(parsed.email || parsed.fullName).toLowerCase();
          if (identifier.includes("robert") || identifier.includes("roberth")) {
            setActiveWorkspace("RHPS");
            setActiveUser(parsed.fullName || "Robert Herrero");
          } else if (identifier.includes("ara")) {
            setActiveWorkspace("CV_SALES");
            setActiveUser(parsed.fullName || "Ara Mae Marcillo");
          } else {
            setCustomerData(parsed);
            setActiveUser(parsed.fullName);
          }
        }
      }
    } catch { /* fallback */ }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cv-sales-admin-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("cv-sales-admin-font-size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (fontColor) window.localStorage.setItem("cv-sales-admin-font-color", fontColor);
    else window.localStorage.removeItem("cv-sales-admin-font-color");
  }, [fontColor]);

  useEffect(() => {
    if (backgroundColor) window.localStorage.setItem("cv-sales-admin-background-color", backgroundColor);
    else window.localStorage.removeItem("cv-sales-admin-background-color");
  }, [backgroundColor]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!entered) return;
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    const markActive = () => {
      lastActivityRef.current = Date.now();
      warningShownRef.current = false;
    };
    const checkSession = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= sessionMinutes * 60_000) {
        setEntered(false);
      } else if (idleFor >= (sessionMinutes - 1) * 60_000 && !warningShownRef.current) {
        warningShownRef.current = true;
        setToast("Your workspace will lock in one minute.");
      }
    }, 30_000);
    window.addEventListener("pointerdown", markActive);
    window.addEventListener("keydown", markActive);
    return () => {
      window.clearInterval(checkSession);
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("keydown", markActive);
    };
  }, [entered, sessionMinutes]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => [p.reference, p.client, p.model, p.agent, p.status].some((v) => String(v).toLowerCase().includes(q)));
  }, [projects, query]);

  async function enterWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    const email = loginUsername.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      setLoginError("❌ Email and password are required.");
      return;
    }

    try {
      const res = await fetch("/api/clients/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || "❌ Invalid credentials. Please try again.");
        return;
      }

      const u = data.user;
      const userObj: CustomerUser = {
        id: u.id,
        fullName: u.fullName || u.email,
        email: u.email,
        phone: u.phone,
        address: u.address,
        role: u.role,
      };
      setActiveUser(userObj.fullName);
      setCustomerData(userObj);
      try {
        localStorage.setItem("rhps_customer_user", JSON.stringify(userObj));
      } catch {}

      if (u.role === "admin" && u.workspace === "RHPS") {
        setActiveWorkspace("RHPS");
        setEntered(true);
      } else if (u.role === "admin" && u.workspace === "CV_SALES") {
        setActiveWorkspace("CV_SALES");
        setEntered(true);
      } else {
        setActiveWorkspace("CUSTOMER");
        setShowPortalLogin(false);
      }
    } catch (err) {
      console.error("Login request error:", err);
      setLoginError("❌ Connection error. Please check your network and try again.");
    }
  }

  async function handleCustomerRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegSuccessMsg("");

    const targetEmail = (regEmail || regAddress).trim();
    if (!regName || !targetEmail || !regPassword) {
      setRegSuccessMsg("⚠️ Please fill in all required fields (Name, Email, Password).");
      return;
    }

    try {
      const res = await fetch("/api/clients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regName,
          phone: regPhone,
          email: targetEmail,
          address: regAddress,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setRegSuccessMsg(`⚠️ ${data.error || "Failed to create account."}`);
        return;
      }

      setRegSuccessMsg(
        `📩 Confirmation email sent to ${targetEmail}! Palihug i-open ang imong Gmail ug i-click ang "CONFIRM & REGISTER OFFICIAL" link para ma-official ang imong account bago ka maka-login.`
      );

      setLoginUsername(targetEmail);
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegAddress("");
      setRegPassword("");

      setTimeout(() => {
        setPortalMode("signin");
      }, 5000);
    } catch (err) {
      console.error("Register request error:", err);
      setRegSuccessMsg("⚠️ Connection error. Could not complete registration.");
    }
  }

  async function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const local: Project = {
      id: Date.now(),
      reference: `CV-2026-${String(projects.length + 1).padStart(3, "0")}`,
      client: String(payload.client),
      model: String(payload.model),
      quantity: Number(payload.quantity) || 1,
      agent: String(payload.agent),
      manager: "Robespierre T. Agir",
      stage: Number(payload.stage) || 1,
      status: "Active",
      priority: String(payload.priority || "Normal"),
      targetDelivery: String(payload.targetDelivery || "To be scheduled"),
      nextAction: String(payload.nextAction || "Complete project details"),
      progress: 12,
    };
    setProjects((current) => [local, ...current]);
    setShowAdd(false);
    setToast("Project added — unit slots created automatically.");
    try {
      const response = await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (response.ok) {
        const data = await response.json();
        setProjects((current) => current.map((p) => p.id === local.id ? data.project : p));
      }
    } catch { /* Keeps the optimistic demo record visible. */ }
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setToast(`Uploading ${file.name}…`);
    const data = new FormData();
    data.set("file", file);
    data.set("category", "Project Document");
    try {
      const response = await fetch("/api/files", { method: "POST", body: data });
      setToast(response.ok ? `${file.name} uploaded safely.` : "Storage is being prepared; file was not saved yet.");
    } catch {
      setToast("Storage is being prepared; file was not saved yet.");
    }
    event.target.value = "";
  }

  const [showCustomerDashboard, setShowCustomerDashboard] = useState(false);
  const [customerDashboardTab, setCustomerDashboardTab] = useState<string>("settings");

  if (!entered) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }


  // If regular Customer logged in → Customer Portal Interface
  if (activeWorkspace === "CUSTOMER") {
    return (
      <CustomerPortal
        customer={customerData || { fullName: activeUser, email: loginUsername }}
        onSignOut={() => {
          setEntered(false);
          setActiveWorkspace("CV_SALES");
        }}
      />
    );
  }

  // If Robert Herrero logged in → RHPS OS
  if (activeWorkspace === "RHPS") {
    return (
      <div className="workspace-wrapper" style={{ position: "relative" }}>
        {/* Floating Quick Action for Workspace Switcher & User Management */}
        <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 900, display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setOpenAiTrigger((prev) => prev + 1)}
            style={{
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "#38bdf8",
              border: "1px solid #38bdf8",
              padding: "0.4rem 0.8rem",
              borderRadius: "99px",
              fontWeight: 750,
              fontSize: "0.75rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04) translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 18px rgba(56, 189, 248, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(56, 189, 248, 0.3)";
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>🤖</span> RHPS Master AI
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspace("CV_SALES")}
            style={{
              background: "#18181b",
              color: "#f59e0b",
              border: "1px solid #f59e0b",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontWeight: 750,
              fontSize: "0.75rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04) translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
            }}
          >
            ⇄ Switch to CV Sales OS (Ara)
          </button>
          <button
            type="button"
            onClick={() => setShowAdminUserManagement(true)}
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontWeight: 750,
              fontSize: "0.75rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04) translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
            }}
          >
            <span>👥</span> Registered User Management
          </button>
        </div>

        <RhpsWorkspace activeUser="Robert Herrero" onLockWorkspace={() => setEntered(false)} openAiTrigger={openAiTrigger} />

        <AdminUserManagementModal
          isOpen={showAdminUserManagement}
          onClose={() => setShowAdminUserManagement(false)}
        />
      </div>
    );
  }

  // ── ARA MAE MARCILLO → CV SALES ADMIN OS ────────────────────────────────
  return (
    <div className="workspace" data-theme={theme} data-density={density} data-font-size={fontSize} style={{ ...(fontColor ? { "--font-color": fontColor } as React.CSSProperties : {}), ...(backgroundColor ? { "--bg-color": backgroundColor } as React.CSSProperties : {}) }}>
      {toast && <div className="toast">{toast}</div>}

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="side-brand">
          <span className="brand-mark small">CV</span>
          <div>
            <strong>CV Sales Admin OS</strong>
            <span>ARA'S SAFE HAVEN</span>
          </div>
        </div>
        <nav>
          {navGroups.map((group, idx) => (
            <div key={group.title || idx} className="nav-group">
              {group.title ? <p className="nav-group-title">{group.title}</p> : null}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={active === item.id ? "nav-item active" : "nav-item"}
                  onClick={() => { setActive(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={item.disabled}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.count ? <b className="nav-count">{item.count}</b> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN AREA (OFFSETS BY SIDEBAR WIDTH 238PX) */}
      <div className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="brand">
            <strong>CV Sales Admin OS</strong>
            <small style={{ marginLeft: 8, opacity: 0.7 }}>· Ara Mae Marcillo</small>
          </div>
          <div className="topbar-right" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button className="secondary" onClick={() => setActiveWorkspace("RHPS")}>⇄ Switch to RHPS OS (Robert)</button>
            <button className="secondary" onClick={() => setShowAgentPinModal(true)}>🔑 Agent Incentive PIN</button>
            <button className="secondary" onClick={() => setShowVault(true)}>⌁ Commission Vault</button>
            <button className="secondary" onClick={() => setShowSettings(true)}>⚙ Settings</button>
            <button className="secondary" onClick={() => setEntered(false)}>🔒 Lock</button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="content">
          {active === "dashboard" && <Dashboard projects={filteredProjects} setActive={setActive} setShowAdd={setShowAdd} setSelectedProject={setSelectedProject} />}
          {active === "website_editor" && <WebsiteEditor onViewWebsite={() => { setEntered(false); setShowPortalLogin(false); }} />}
          {active === "projects" && <ProjectsView projects={filteredProjects} query={query} setQuery={setQuery} setShowAdd={setShowAdd} setSelectedProject={setSelectedProject} />}
          {active === "workflow" && <WorkflowView projects={filteredProjects} setSelectedProject={setSelectedProject} />}
          {active === "ai" && <AIAssistantView projects={filteredProjects} />}
          {!["dashboard", "projects", "workflow", "ai", "website_editor"].includes(active) && (
            <TrackerView id={active} label={navGroups.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? active} onAdd={() => placeholderAction("Add record")} onUpload={() => fileRef.current?.click()} personsList={personsList} onAddPerson={() => setShowAddPersonModal(true)} />
          )}
        </main>
      </div>

      {/* MODALS */}
      {showAdd && <AddProjectModal close={() => setShowAdd(false)} submit={addProject} />}
      {showAddPersonModal && <AddPersonModal close={() => setShowAddPersonModal(false)} submit={handleAddPerson} />}
      {selectedProject && <ProjectDrawer project={selectedProject} close={() => setSelectedProject(null)} />}
      {showSettings && <SettingsDrawer close={() => setShowSettings(false)} theme={theme} setTheme={setTheme} density={density} setDensity={setDensity} fontSize={fontSize} setFontSize={setFontSize} fontColor={fontColor} setFontColor={setFontColor} backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor} sessionMinutes={sessionMinutes} setSessionMinutes={setSessionMinutes} />}
      {showVault && <VaultModal close={() => setShowVault(false)} unlocked={vaultUnlocked} unlock={() => setVaultUnlocked(true)} />}
      {showAgentPinModal && <AgentPinModal close={() => setShowAgentPinModal(false)} unlock={() => { setAgentPinUnlocked(true); setShowAgentPinModal(false); setToast("Agent Incentive record unlocked!"); }} />}


      <input ref={fileRef} type="file" hidden onChange={uploadFile} />
    </div>
  );
}


function Dashboard({ projects, setActive, setShowAdd, setSelectedProject }: { projects: Project[]; setActive: (v: string) => void; setShowAdd: (v: boolean) => void; setSelectedProject: (v: Project) => void }) {
  const cards = [["Active Projects", String(projects.length), "+2 this month", "▦", "plum"], ["Physical Units", String(projects.reduce((n, p) => n + p.quantity, 0)), "Across all projects", "◇", "rose"], ["Pending Documents", "7", "3 need attention", "▤", "amber"], ["In Fabrication", "7", "2 nearing target", "⚙", "blue"], ["Ready for Delivery", "4", "Within 15 days", "⌁", "green"], ["Pending Billing", "3", "Follow-up required", "◒", "lavender"]];
  return <>
    <div className="welcome-row"><div><p className="eyebrow">MONDAY, AUGUST 3</p><h1>Good morning, Ara! <span>✿</span></h1><p>Here’s your calm, clear view of everything that needs attention.</p></div><div className="welcome-actions"><button className="secondary" onClick={() => setActive("upcoming")}>◫ View Schedule</button><button className="primary" onClick={() => setShowAdd(true)}>＋ Quick Add</button></div></div>
    <div className="focus-strip"><button onClick={() => setActive("urgent")}><span className="focus-icon urgent">!</span><div><strong>5 urgent items</strong><small>2 overdue · 3 need action</small></div><b>→</b></button><button onClick={() => setActive("today")}><span className="focus-icon today">◷</span><div><strong>8 tasks for today</strong><small>3 completed · 5 remaining</small></div><b>→</b></button><button onClick={() => setActive("upcoming")}><span className="focus-icon upcoming">◫</span><div><strong>14 upcoming</strong><small>Within the next 15 days</small></div><b>→</b></button></div>
    <div className="metric-grid">{cards.map(([label, value, note, icon, tone]) => <button className="metric-card" key={label} onClick={() => setActive(label === "Active Projects" || label === "Physical Units" ? "projects" : label === "Pending Documents" ? "documents" : label === "In Fabrication" ? "fabrication" : label === "Ready for Delivery" ? "releases" : "reports")}><span className={`metric-icon ${tone}`}>{icon}</span><small>{label}</small><strong>{value}</strong><p>{note}</p><b>↗</b></button>)}</div>
    <div className="dashboard-grid">
      <section className="panel work-queue"><PanelHead title="Priority Work Queue" subtitle="Sorted by urgency and due date" action="View all" onAction={() => setActive("urgent")} /><div className="table-wrap"><table><thead><tr><th>PROJECT / CLIENT</th><th>NEXT ACTION</th><th>OWNER</th><th>DUE</th><th>STATUS</th><th /></tr></thead><tbody>{projects.slice(0, 4).map((p) => <tr key={p.id} onClick={() => setSelectedProject(p)}><td><strong>{p.client}</strong></td><td><strong>{p.nextAction}</strong><span>{p.model} · {p.quantity} unit{p.quantity > 1 ? "s" : ""}</span></td><td><span className="agent-dot">{p.agent.slice(0, 1)}</span>{p.agent}</td><td><strong>{p.targetDelivery}</strong></td><td><Status>{p.priority === "Urgent" ? "Urgent" : p.status}</Status></td><td>›</td></tr>)}</tbody></table></div>
      </section>
      <section className="panel schedule-card"><PanelHead title="Upcoming Schedule" subtitle="Next 15 days" action="Calendar" onAction={() => setActive("upcoming")} /><div className="date-chip"><b>03</b><span>AUG<br />MON</span></div><div className="schedule-item"><i className="rose-line" /><div><strong>Fabrication follow-up</strong><span>City Emergency Response Fleet · 9:00 AM</span></div><Status>Urgent</Status></div><div className="schedule-item"><i className="blue-line" /><div><strong>PDI checklist review</strong><span>Provincial Mobile Services · 11:00 AM</span></div><Status>For Review</Status></div><div className="schedule-item"><i className="green-line" /><div><strong>Delivery confirmation</strong><span>Regional Logistics Support · 2:00 PM</span></div><Status>Active</Status></div>
      </section>
      <section className="panel workflow-panel"><PanelHead title="17-Stage Workflow" subtitle="Click a stage to see its projects" action="Full workflow" onAction={() => setActive("workflow")} /><div className="mini-stages">{stages.slice(5, 14).map((stage, index) => <button key={stage} onClick={() => setActive("workflow")}><span>{index + 6}</span><strong>{stage}</strong><b>{[2, 3, 1, 7, 4, 3, 2, 4, 1][index]}</b></button>)}</div></section>
      <section className="panel activity-panel"><PanelHead title="Recent Activity" subtitle="Latest workspace updates" /><div className="activity"><i className="green" /> <div><strong>PDI status updated</strong><span>Provincial Mobile Services moved to For PDI</span><small>10 minutes ago · Ara</small></div></div><div className="activity"><i className="purple" /> <div><strong>Document uploaded</strong><span>Insurance added to Provincial Mobile Services</span><small>42 minutes ago · Ara</small></div></div><div className="activity"><i className="amber" /> <div><strong>Follow-up scheduled</strong><span>Fabricator call set for today</span><small>1 hour ago · Ara</small></div></div></section>
    </div>
  </>;
}

function PanelHead({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) { return <header className="panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button onClick={onAction}>{action} →</button>}</header>; }

function ProjectsView({ projects, query, setQuery, setShowAdd, setSelectedProject }: { projects: Project[]; query: string; setQuery: (v: string) => void; setShowAdd: (v: boolean) => void; setSelectedProject: (v: Project) => void }) {
  return <><div className="module-hero"><div><p className="eyebrow">OPERATIONS</p><h1>Projects & Units</h1><p>One organized record from inquiry to after-sales support.</p></div><button className="primary" onClick={() => setShowAdd(true)}>＋ Add Project</button></div><div className="toolbar"><div className="small-search">⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this table…" /></div><button onClick={() => placeholderAction("Filter")}>☷ Filter</button><button onClick={() => placeholderAction("Sort")}>⇅ Sort</button><button onClick={() => placeholderAction("Columns")}>▦ Columns</button><button onClick={() => placeholderAction("Saved views")}>Saved Views ⌄</button></div><section className="panel project-table"><table><thead><tr><th>PROJECT</th><th>CLIENT & UNIT</th><th>AGENT</th><th>WORKFLOW</th><th>DELIVERY</th><th>STATUS</th><th>PROGRESS</th><th /></tr></thead><tbody>{projects.map((p) => <tr key={p.id} onClick={() => setSelectedProject(p)}><td><strong>{p.reference}</strong><span>{p.quantity} physical unit{p.quantity > 1 ? "s" : ""}</span></td><td><strong>{p.client}</strong><span>{p.model}</span></td><td><span className="agent-dot">{p.agent[0]}</span>{p.agent}</td><td><strong>Stage {p.stage}</strong><span>{stages[p.stage - 1]}</span></td><td>{p.targetDelivery}</td><td><Status>{p.status}</Status></td><td><div className="progress"><i style={{ width: `${p.progress}%` }} /></div><span>{p.progress}% complete</span></td><td>›</td></tr>)}</tbody></table></section></>;
}

function TrackerView({ id, label, onAdd, onUpload, personsList, onAddPerson }: { id: string; label: string; onAdd: () => void; onUpload: () => void; personsList?: string[][]; onAddPerson?: () => void }) {
  const data = trackerContent[id] ?? { title: label, subtitle: "Organized records and clear next actions.", metrics: [["0", "Open"], ["0", "Due"], ["0", "Completed"]] as [string, string][], columns: ["Record", "Details", "Owner", "Status"], rows: [] };
  const [activeFollowupCategory, setActiveFollowupCategory] = useState("All");

  const followupCategories = [
    "All", "Missing PO", "Missing NOA", "Missing NTP", "Missing Contract Agreement", "PHILGEPS/Bidding",
    "Insurance Pending", "Budget Pending", "For Liquidation", "For Transmittal", "Notarial Pending",
    "Payment/Collection", "Bank Processing", "Unit Transfer", "PDI/Service", "Fabrication",
    "Internal Release", "Actual Release", "Client Decision"
  ];

  const getModuleButtons = () => {
    switch (id) {
      case "urgent":
        return [];
      case "leads":
        return [
          { text: "＋ Add Lead / Client", action: () => placeholderAction("Add Lead / Client") },
          { text: "Save Lead Info", action: () => placeholderAction("Save Lead Info") },
          { text: "Check Legal Requirements", action: () => placeholderAction("Check Legal Requirements") },
          { text: "Proceed with Missing Docs", action: () => placeholderAction("Proceed with Missing Docs") },
          { text: "Upload Legal Document", action: onUpload },
          { text: "Allocate Unit", action: () => placeholderAction("Allocate Unit") },
        ];
      case "inventory":
        return [
          { text: "＋ Add Unit", action: () => placeholderAction("Add Unit") },
          { text: "Edit Unit", action: () => placeholderAction("Edit Unit") },
          { text: "Assign Unit", action: () => placeholderAction("Assign Unit") },
          { text: "Reserve Unit", action: () => placeholderAction("Reserve Unit") },
          { text: "Mark For Service", action: () => placeholderAction("Mark For Service") },
          { text: "Upload Unit Document", action: onUpload },
          { text: "Export Inventory", action: () => placeholderAction("Export Inventory") },
        ];
      case "allocations":
        return [
          { text: "＋ Allocate Unit", action: () => placeholderAction("Allocate Unit") },
          { text: "Change Unit", action: () => placeholderAction("Change Unit") },
          { text: "Change Assigned Person", action: () => placeholderAction("Change Assigned Person") },
          { text: "Add Follow-up", action: () => placeholderAction("Add Follow-up") },
          { text: "Request Budget", action: () => placeholderAction("Request Budget") },
          { text: "Upload Required Document", action: onUpload },
          { text: "Cancel Allocation", action: () => placeholderAction("Cancel Allocation") },
        ];
      case "documents":
        return [
          { text: "＋ Upload Document", action: onUpload },
          { text: "Mark Submitted", action: () => placeholderAction("Mark Submitted") },
          { text: "Mark Complete", action: () => placeholderAction("Mark Complete") },
          { text: "Mark For Notarial", action: () => placeholderAction("Mark For Notarial") },
          { text: "Mark Notarized", action: () => placeholderAction("Mark Notarized") },
          { text: "Add Transmittal", action: () => placeholderAction("Add Transmittal") },
          { text: "Replace File", action: onUpload },
        ];
      case "followups":
        return [
          { text: "＋ Add Follow-up", action: () => placeholderAction("Add Follow-up") },
          { text: "Mark Done", action: () => placeholderAction("Mark Done") },
          { text: "Reschedule", action: () => placeholderAction("Reschedule") },
          { text: "Add Note", action: () => placeholderAction("Add Note") },
          { text: "Mark Contacted", action: () => placeholderAction("Mark Contacted") },
          { text: "Upload Document", action: onUpload },
          { text: "Convert to Urgent", action: () => placeholderAction("Convert to Urgent") },
        ];
      case "pdi":
        return [
          { text: "＋ Schedule PDI", action: () => placeholderAction("Schedule PDI") },
          { text: "Start PDI", action: () => placeholderAction("Start PDI") },
          { text: "Add PDI Finding", action: () => placeholderAction("Add PDI Finding") },
          { text: "Mark For Correction", action: () => placeholderAction("Mark For Correction") },
          { text: "Upload PDI Document", action: onUpload },
          { text: "Mark PDI Complete", action: () => placeholderAction("Mark PDI Complete") },
          { text: "Waive PDI with Remarks", action: () => placeholderAction("Waive PDI with Remarks") },
        ];
      case "releases":
        return [
          { text: "＋ Prepare Gate Pass", action: () => placeholderAction("Prepare Gate Pass") },
          { text: "Start Accounting Check", action: () => placeholderAction("Start Accounting Check") },
          { text: "Upload Signed Gate Pass", action: onUpload },
          { text: "Check Client Handover", action: () => placeholderAction("Check Client Handover Items") },
          { text: "Add Stencil Copies", action: () => placeholderAction("Add Stencil Copies") },
          { text: "Mark Ready for Release", action: () => placeholderAction("Mark Ready for Release") },
          { text: "Release with Pending", action: () => placeholderAction("Release with Pending Requirements") },
          { text: "Mark Actual Released", action: () => placeholderAction("Mark Actual Released") },
        ];
      case "expenses":
        return [
          { text: "＋ Request Budget", action: () => placeholderAction("Request Budget") },
          { text: "Approve Budget", action: () => placeholderAction("Approve Budget") },
          { text: "Release Amount", action: () => placeholderAction("Release Amount") },
          { text: "Add Liquidation", action: () => placeholderAction("Add Liquidation") },
          { text: "Add Transmittal", action: () => placeholderAction("Add Transmittal") },
          { text: "Verify Expense", action: () => placeholderAction("Verify Expense") },
          { text: "Close Expense", action: () => placeholderAction("Close Expense") },
        ];
      case "collections":
        return [
          { text: "＋ Add Collection Record", action: () => placeholderAction("Add Collection Record") },
          { text: "Update Bank PO Status", action: () => placeholderAction("Update Bank PO Status") },
          { text: "Mark For Collection", action: () => placeholderAction("Mark For Collection") },
          { text: "Mark Collected", action: () => placeholderAction("Mark Collected") },
          { text: "Add Follow-up", action: () => placeholderAction("Add Follow-up") },
        ];
      case "agents":
        return [
          { text: "＋ Add Person", action: onAddPerson || onAdd },
        ];
      case "insurance":
        return [
          { text: "＋ Add Insurance Info", action: () => placeholderAction("Add Insurance Info") },
          { text: "Select Company", action: () => placeholderAction("Select Insurance Company") },
          { text: "Add New Company", action: () => placeholderAction("Add New Insurance Company") },
          { text: "Upload Document", action: onUpload },
          { text: "Mark Active", action: () => placeholderAction("Mark Active") },
          { text: "Set Expiry Reminder", action: () => placeholderAction("Set Expiry Reminder") },
        ];
      case "incentives":
        return [
          { text: "🔓 Unlock Incentives", action: () => placeholderAction("Unlock Incentives") },
          { text: "Check Requirements", action: () => placeholderAction("Check Incentive Requirements") },
          { text: "Upload Sales Invoice", action: onUpload },
          { text: "Upload Delivery Receipt", action: onUpload },
          { text: "Upload HTB Sales Leads", action: onUpload },
          { text: "Prepare Template", action: () => placeholderAction("Prepare CV Incentives Template") },
          { text: "Submit Incentive", action: () => placeholderAction("Submit Incentive") },
          { text: "Lock Incentives", action: () => placeholderAction("Lock Incentives") },
        ];
      case "reports":
        return [
          { text: "＋ Generate Report", action: () => placeholderAction("Generate Report") },
          { text: "Export Excel", action: () => placeholderAction("Export Excel") },
          { text: "Export PDF", action: () => placeholderAction("Export PDF") },
          { text: "Print Report", action: () => placeholderAction("Print Report") },
          { text: "Save View", action: () => placeholderAction("Save View") },
        ];
      case "settings":
        return [
          { text: "＋ Add New Option", action: () => placeholderAction("Add New Option") },
          { text: "Edit Option", action: () => placeholderAction("Edit Option") },
          { text: "Deactivate Option", action: () => placeholderAction("Deactivate Option") },
          { text: "Reactivate Option", action: () => placeholderAction("Reactivate Option") },
          { text: "Merge Duplicate", action: () => placeholderAction("Merge Duplicate") },
          { text: "Manage Options", action: () => placeholderAction("Manage Options") },
        ];
      default:
        return [
          { text: "＋ Add Record", action: onAdd },
          { text: "⇧ Upload File", action: onUpload },
        ];
    }
  };

  const moduleButtons = getModuleButtons();
  const displayRows = (id === "agents" && personsList) ? personsList : data.rows;
  const displayMetrics: [string, string][] = (id === "agents" && personsList)
    ? [
        [String(personsList.filter((p) => p[4] === "Active").length), "Active persons"],
        [String(personsList.filter((p) => p[1].toLowerCase().includes("consultant") || p[1].toLowerCase().includes("representative")).length), "Sales agents"],
        [String(personsList.filter((p) => p[1].toLowerCase().includes("manager") || p[1].toLowerCase().includes("admin")).length), "Managers & Admin"],
      ]
    : data.metrics;

  return (
    <>
      <div className="module-hero">
        <div>
          <p className="eyebrow">CV SALES ADMIN OS • ARA MAE MARCILLO</p>
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
        </div>
        <div className="hero-buttons" style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 500, justifyContent: "flex-end" }}>
          {moduleButtons.slice(0, 4).map((btn, idx) => (
            <button key={idx} className={idx === 0 ? "primary" : "secondary"} onClick={btn.action}>
              {btn.text}
            </button>
          ))}
        </div>
      </div>

      <div className="module-metrics">
        {displayMetrics.map(([value, text]) => (
          <div key={text}>
            <strong>{value}</strong>
            <span>{text}</span>
          </div>
        ))}
      </div>

      {id === "expenses" && (
        <div className="info-card" style={{ marginBottom: 16, background: "var(--surface)", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)" }}>
          <strong>Formula Rule (3.9):</strong> <span style={{ marginLeft: 8, fontFamily: "monospace" }}>Unliquidated Balance = Released Amount − Liquidated Amount</span>
        </div>
      )}

      {id === "followups" && (
        <div className="category-pills-bar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 12 }}>
          {followupCategories.map((cat) => (
            <button
              key={cat}
              className={`chip ${activeFollowupCategory === cat ? "primary" : "secondary"}`}
              style={{ fontSize: "13px", padding: "4px 12px", borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={() => setActiveFollowupCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="toolbar">
        <div className="small-search">
          ⌕<input placeholder={`Search ${data.title.toLowerCase()}…`} />
        </div>
        <button onClick={() => placeholderAction("Filter")}>☷ Filter</button>
        <button onClick={() => placeholderAction("Sort")}>⇅ Sort</button>
        <button onClick={() => placeholderAction("Columns")}>▦ Columns</button>
        <button onClick={() => placeholderAction("Export")}>Export ⌄</button>
      </div>

      <section className="panel tracker-table">
        <table>
          <thead>
            <tr>
              {data.columns.map((c) => (
                <th key={c}>{c.toUpperCase()}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    {cellIndex === row.length - 1 ||
                    cell.toLowerCase().includes("pending") ||
                    cell.toLowerCase().includes("received") ||
                    cell.toLowerCase().includes("urgent") ||
                    cell.toLowerCase().includes("active") ||
                    cell.toLowerCase().includes("resigned") ||
                    cell.toLowerCase().includes("awol") ||
                    cell.toLowerCase().includes("complete") ||
                    cell.toLowerCase().includes("submitted") ||
                    cell.toLowerCase().includes("missing") ? (
                      <Status>{cell}</Status>
                    ) : (
                      <strong>{cell}</strong>
                    )}
                  </td>
                ))}
                <td>›</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}


function WorkflowView({ projects, setSelectedProject }: { projects: Project[]; setSelectedProject: (v: Project) => void }) {
  return <><div className="module-hero"><div><p className="eyebrow">FAST AUTO CORE INC.</p><h1>17-Stage CV Admin Workflow</h1><p>Every project has a visible current stage, owner, and next action.</p></div><button className="secondary" onClick={() => placeholderAction("Workflow editor")}>Edit Workflow</button></div><div className="workflow-board">{stages.map((stage, index) => { const matches = projects.filter((p) => p.stage === index + 1); return <section className="stage-card" key={stage}><header><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{stage}</strong><small>{matches.length} active project{matches.length !== 1 ? "s" : ""}</small></div><b>{matches.length}</b></header>{matches.map((p) => <button key={p.id} onClick={() => setSelectedProject(p)}><strong>{p.reference}</strong><span>{p.client}</span><Status>{p.status}</Status></button>)}</section>; })}</div></>;
}

function AddProjectModal({ close, submit }: { close: () => void; submit: (e: FormEvent<HTMLFormElement>) => void }) {
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><form className="modal add-modal" onSubmit={submit}><button type="button" className="close" onClick={close}>×</button><p className="eyebrow">QUICK ADD</p><h2>Create a new project</h2><p>Start with the essentials. You can complete unit identifiers later.</p><div className="form-grid"><label className="full">Client / Project Name<input name="client" required placeholder="Enter official client or project name" /></label><label>Sales Consultant<select name="agent" required defaultValue=""><option value="" disabled>Select agent</option><option>RAM</option><option>Kath</option><option>Darnet</option><option>Ergem</option><option>Ara Mae Marcillo</option></select></label><label>General Sales Manager<input name="manager" defaultValue="Robespierre T. Agir" /></label><label>Unit Model<input name="model" required placeholder="e.g. H-100 Ambulance" /></label><label>Quantity<input name="quantity" type="number" min="1" defaultValue="1" /></label><label>Target Delivery<input name="targetDelivery" type="date" /></label><label>Current Stage<select name="stage" defaultValue="1">{stages.map((s, i) => <option value={i + 1} key={s}>{i + 1}. {s}</option>)}</select></label><label>Priority<select name="priority"><option>Normal</option><option>High</option><option>Urgent</option></select></label><label className="full">Next Action / Notes<textarea name="nextAction" placeholder="What needs to happen next?" /></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">Save Project & Create Unit Slots</button></div></form></div>;
}

function AddPersonModal({ close, submit }: { close: () => void; submit: (e: FormEvent<HTMLFormElement>) => void }) {
  const [birthdate, setBirthdate] = useState("");
  const [age, setAge] = useState<number | "">("");

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBirthdate(val);
    if (val) {
      const birth = new Date(val);
      const today = new Date();
      let calcAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calcAge--;
      }
      setAge(calcAge >= 0 ? calcAge : "");
    } else {
      setAge("");
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <form className="modal add-modal" onSubmit={submit}>
        <button type="button" className="close" onClick={close}>×</button>
        <p className="eyebrow">PERSONAL INFORMATION</p>
        <h2>Add New Person</h2>
        <p>Register official staff or sales team member information.</p>
        <div className="form-grid">
          <label className="full">
            FULL NAME
            <input name="fullName" required placeholder="Enter official full name" />
          </label>
          <label>
            POSITION
            <select name="position" required defaultValue="">
              <option value="" disabled>Select position</option>
              <option value="CV Sales Representative">CV SALES REPRESENTATIVE</option>
              <option value="CV Fleet Representative">CV FLEET REPRESENTATIVE</option>
              <option value="CV Sales Supervisor">CV SALES SUPERVISOR</option>
              <option value="CV PDI">CV PDI</option>
              <option value="CV Technician">CV TECHNICIAN</option>
              <option value="CV Sales Admin/Coordinator">CV SALES ADMIN/COORDINATOR</option>
              <option value="General Sales Manager">GENERAL SALES MANAGER</option>
              <option value="Sales Consultant">SALES CONSULTANT</option>
            </select>
          </label>
          <label>
            EMAIL ADDRESS
            <input name="email" type="email" placeholder="INPUT EMAIL ADDRESS PERSONAL / BUSINESS" />
          </label>
          <label>
            BIRTHDATE
            <input name="birthdate" type="date" value={birthdate} onChange={handleBirthdateChange} />
          </label>
          <label>
            AGE:
            <input name="age" type="number" value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")} placeholder="Age" />
          </label>
          <label>
            DATE HIRED:
            <input name="dateHired" type="date" />
          </label>
          <label className="full">
            HOME ADDRESS:
            <input name="homeAddress" placeholder="Enter complete home address" />
          </label>
          <label>
            STATUS
            <select name="status" defaultValue="Active">
              <option value="Active">Active</option>
              <option value="Resigned">Resigned</option>
              <option value="AWOL">AWOL</option>
            </select>
          </label>
          <label className="full">
            NOTES:
            <textarea name="notes" placeholder="What needs to happen next?" />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>Cancel</button>
          <button className="primary" type="submit">Save Person</button>
        </div>
      </form>
    </div>
  );
}

function ProjectDrawer({ project, close }: { project: Project; close: () => void }) {
  return <div className="overlay drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><aside className="drawer project-drawer"><button className="close" onClick={close}>×</button><div className="drawer-head"><Status>{project.status}</Status><h2>{project.reference}</h2><p>{project.client}</p><div className="progress large"><i style={{ width: `${project.progress}%` }} /></div><small>{project.progress}% record complete</small></div><div className="drawer-tabs"><button className="active" onClick={() => placeholderAction("Overview tab")}>Overview</button><button onClick={() => placeholderAction("Unit records tab")}>Units ({project.quantity})</button><button onClick={() => placeholderAction("Documents tab")}>Documents</button><button onClick={() => placeholderAction("History tab")}>History</button></div><div className="info-card"><p>UNIT / MODEL</p><strong>{project.model}</strong><span>{project.quantity} physical unit slot{project.quantity > 1 ? "s" : ""}</span></div><div className="info-grid"><div><p>CURRENT WORKFLOW</p><strong>Stage {project.stage}</strong><span>{stages[project.stage - 1]}</span></div><div><p>TARGET DELIVERY</p><strong>{project.targetDelivery}</strong><span>{project.priority} priority</span></div><div><p>SALES CONSULTANT</p><strong>{project.agent}</strong><span>Assigned</span></div><div><p>GENERAL MANAGER</p><strong>{project.manager}</strong><span>Project oversight</span></div></div><div className="next-action"><span>→</span><div><p>NEXT ACTION</p><strong>{project.nextAction}</strong></div></div><div className="completion-list"><h3>Completion checklist</h3>{["Client and project details", "Unit model and quantity", "Sales consultant assignment", "CS / VIN / Engine numbers", "Required documents"].map((item, i) => <div key={item}><span className={i < 3 ? "done" : ""}>{i < 3 ? "✓" : ""}</span>{item}<b>{i < 3 ? "Complete" : "Pending"}</b></div>)}</div><div className="drawer-actions"><button className="secondary" onClick={() => placeholderAction("Task creator")}>＋ Add Task</button><button className="primary" onClick={() => placeholderAction("Project editor")}>Edit Project</button></div></aside></div>;
}

function SettingsDrawer({ close, theme, setTheme, density, setDensity, fontSize, setFontSize, fontColor, setFontColor, backgroundColor, setBackgroundColor, sessionMinutes, setSessionMinutes }: { close: () => void; theme: string; setTheme: (v: string) => void; density: string; setDensity: (v: string) => void; fontSize: string; setFontSize: (v: string) => void; fontColor: string; setFontColor: (v: string) => void; backgroundColor: string; setBackgroundColor: (v: string) => void; sessionMinutes: number; setSessionMinutes: (v: number) => void }) {
  return <div className="overlay drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><aside className="drawer settings-drawer"><button className="close" onClick={close}>×</button><p className="eyebrow">SYSTEM EDITOR</p><h2>Make it feel like yours</h2><p>Appearance, navigation, dashboard, forms, alerts, and security are editable.</p><h3>Workspace theme · 3 styles</h3><div className="themes">{themes.map((item) => <button key={item.key} className={theme === item.key ? "selected" : ""} onClick={() => setTheme(item.key)}><span>{item.swatches.map((color) => <i key={color} style={{ background: color }} />)}</span><strong>{item.name}</strong><em>{item.collection}</em>{theme === item.key && <b>✓</b>}</button>)}</div><h3>Fonts Editor</h3><div className="segmented triple"><button className={fontSize === "medium" ? "active" : ""} onClick={() => setFontSize("medium")}>Medium</button><button className={fontSize === "large" ? "active" : ""} onClick={() => setFontSize("large")}>Large</button><button className={fontSize === "xlarge" ? "active" : ""} onClick={() => setFontSize("xlarge")}>Extra Large</button></div><label className="setting-row color-setting"><div><strong>Font color</strong><span>Changes main readable text color</span></div><input type="color" value={fontColor || "#322832"} onChange={(event) => setFontColor(event.target.value)} /></label><button className="reset-link" onClick={() => setFontColor("")}>Reset font color</button><h3>Background Color Editor</h3><label className="setting-row color-setting"><div><strong>Background color</strong><span>Color only, no image background</span></div><input type="color" value={backgroundColor || "#f8f3f1"} onChange={(event) => setBackgroundColor(event.target.value)} /></label><button className="reset-link" onClick={() => setBackgroundColor("")}>Reset background color</button><h3>Table density</h3><div className="segmented"><button className={density === "comfortable" ? "active" : ""} onClick={() => setDensity("comfortable")}>Comfortable</button><button className={density === "compact" ? "active" : ""} onClick={() => setDensity("compact")}>Compact</button></div><h3>Focus & alerts</h3><label className="setting-row"><div><strong>Upcoming period</strong><span>Number of days shown across Focus views</span></div><input type="number" defaultValue="15" min="1" max="60" /></label><label className="setting-row"><div><strong>Automatic logout</strong><span>Lock after inactivity</span></div><select value={sessionMinutes} onChange={(event) => setSessionMinutes(Number(event.target.value))}><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option></select></label><label className="setting-row"><div><strong>Show AI placeholder</strong><span>No AI is active or connected</span></div><input type="checkbox" defaultChecked /></label><div className="editor-links"><button onClick={() => placeholderAction("Dashboard editor")}>Customize dashboard <span>›</span></button><button onClick={() => placeholderAction("Navigation tab editor")}>Edit navigation tabs <span>›</span></button><button onClick={() => placeholderAction("Forms and field labels")}>Forms & field labels <span>›</span></button><button onClick={() => placeholderAction("Status color rules")}>Status colors & rules <span>›</span></button><button onClick={() => placeholderAction("Import and duplicate review")}>Import & duplicate review <span>›</span></button></div><div className="drawer-actions"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={close}>Save Settings</button></div></aside></div>;
}

function VaultModal({ close, unlocked, unlock }: { close: () => void; unlocked: boolean; unlock: () => void }) {
  const [pin, setPin] = useState("");
  return <div className="overlay vault-overlay"><section className="modal vault-modal"><button className="close" onClick={close}>×</button>{!unlocked ? <><div className="vault-lock">⌁</div><p className="eyebrow">PRIVATE · ARA ONLY</p><h2>Commission Vault</h2><p>Your solo commissions are separated from the dashboard, global search, reports, and ordinary exports.</p><label>Separate 6-digit PIN<div className="pin-input"><input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" /><button className="primary" disabled={pin.length !== 6} onClick={unlock}>Unlock</button></div></label><div className="secure-note">Preview protection only. A live PIN will be encrypted and securely configured before importing real commission data.</div></> : <><div className="vault-unlocked"><span>✓</span> Vault unlocked</div><p className="eyebrow">PRIVATE COMMISSION SUMMARY</p><h2>Solo Commission</h2><div className="vault-metrics"><div><span>Expected</span><strong>₱ •••,•••</strong></div><div><span>Received</span><strong>₱ •••,•••</strong></div><div><span>Pending</span><strong>₱ •••,•••</strong></div></div><p className="empty-vault">No live commission records have been imported.</p><button className="primary full-button" onClick={() => placeholderAction("Commission record creator")}>＋ Add Commission Record</button></>}</section></div>;
}

function AgentPinModal({ close, unlock }: { close: () => void; unlock: () => void }) {
  const [pin, setPin] = useState("");
  const [agentName, setAgentName] = useState("Kath");
  return (
    <div className="overlay vault-overlay">
      <section className="modal vault-modal">
        <button className="close" onClick={close}>×</button>
        <div className="vault-lock">☆</div>
        <p className="eyebrow">SALES AGENT INCENTIVE VERIFICATION (RULE 1 & 3.13)</p>
        <h2>Check My Incentive</h2>
        <p>Option (b) single-operator access: Type your agent PIN to unlock your personal incentive record only.</p>
        <label style={{ display: "block", marginBottom: 12 }}>Select Consultant Name
          <select value={agentName} onChange={(e) => setAgentName(e.target.value)} style={{ width: "100%", marginTop: 6, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)" }}>
            <option>Kath</option>
            <option>RAM</option>
            <option>Darnet</option>
            <option>Ergem</option>
          </select>
        </label>
        <label style={{ display: "block" }}>Enter 4-Digit Agent PIN
          <div className="pin-input" style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)" }} />
            <button className="primary" disabled={pin.length < 4} onClick={unlock}>Unlock My Record</button>
          </div>
        </label>
        <div className="secure-note" style={{ marginTop: 12, fontSize: "12px", opacity: 0.8 }}>
          Verification active. Only released units with signed Sales Invoice, DR, and HTB Sales Leads allow template preparation.
        </div>
      </section>
    </div>
  );
}


function renderFormattedMarkdown(content: string) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection (lines starting and ending with |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        const dataRows = tableLines
          .slice(1)
          .filter((rowLine) => !/^\|[\s\-:|]+\|$/.test(rowLine))
          .map((rowLine) =>
            rowLine
              .split("|")
              .map((c) => c.trim())
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          );

        blocks.push(
          <div key={`table-${i}`} className="ai-table-container">
            <table className="ai-markdown-table">
              <thead>
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx}>{formatInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        {cell.toLowerCase().includes("in fabrication") ||
                        cell.toLowerCase().includes("for pdi") ||
                        cell.toLowerCase().includes("delivery") ||
                        cell.toLowerCase().includes("pending") ||
                        cell.toLowerCase().includes("completed") ? (
                          <Status>{cell}</Status>
                        ) : (
                          formatInline(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push(<h3 key={`h3-${i}`}>{formatInline(trimmed.replace(/^###\s+/, ""))}</h3>);
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(<h2 key={`h2-${i}`}>{formatInline(trimmed.replace(/^##\s+/, ""))}</h2>);
      i++;
      continue;
    }

    // Bullet lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") ||
          lines[i].trim().startsWith("* ") ||
          lines[i].trim().startsWith("• "))
      ) {
        listItems.push(lines[i].trim().replace(/^[\-\*\•]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="ai-bullet-list">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s+/.test(trimmed)) {
      blocks.push(
        <p key={`num-${i}`} className="list-item">
          <strong>{trimmed.match(/^\d+\./)?.[0]}</strong> {formatInline(trimmed.replace(/^\d+\.\s+/, ""))}
        </p>
      );
      i++;
      continue;
    }

    // Paragraphs
    if (trimmed.length > 0) {
      blocks.push(<p key={`p-${i}`}>{formatInline(trimmed)}</p>);
    }
    i++;
  }

  return blocks;
}

function AIAssistantView({ projects }: { projects: Project[] }) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Hello Ara! 👋 I am **Haven AI**, your dedicated CV Sales Admin Assistant.

I have full visibility into your active commercial vehicle projects, unit availability, delivery schedules, and pending documents.

How can I help you today? You can choose a quick action below or type any question!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          projectsContext: projects,
        }),
      });

      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "Apologies, I encountered an issue processing your request. Please try again." },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Network error while connecting to AI assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chips = [
    "📊 Summarize active projects",
    "🚚 Which units are ready for delivery?",
    "⚠️ Show urgent tasks & missing documents",
    "📝 Draft client follow-up email",
    "💰 Sales & commission advice",
  ];

  return (
    <>
      <div className="module-hero">
        <div>
          <p className="eyebrow">INTELLIGENT WORKSPACE</p>
          <h1>Haven AI Assistant</h1>
          <p>Real-time commercial vehicle sales intelligence & workspace assistant.</p>
        </div>
        <div className="ai-status-badge">
          <span className="online-dot" /> Haven AI Connected
        </div>
      </div>

      <section className="panel ai-chat-panel">
        <div className="ai-messages-list">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-message-row ${msg.role}`}>
              <div className="ai-avatar">{msg.role === "user" ? "👤" : "✦"}</div>
              <div className="ai-message-bubble">
                <div className="ai-message-header">
                  <strong>{msg.role === "user" ? "Ara Mae Marcillo" : "Haven AI"}</strong>
                </div>
                <div className="ai-message-body">
                  {renderFormattedMarkdown(msg.content)}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="ai-message-row assistant">
              <div className="ai-avatar">✦</div>
              <div className="ai-message-bubble loading-bubble">
                <span className="pulse-dot" />
                <span className="pulse-dot" />
                <span className="pulse-dot" />
                <em>AI is analyzing workspace data...</em>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="ai-chips-bar">
          <small>Suggested Prompts:</small>
          <div className="ai-chips-scroll">
            {chips.map((chip) => (
              <button key={chip} className="ai-chip" onClick={() => sendMessage(chip)} disabled={loading}>
                {chip}
              </button>
            ))}
          </div>
        </div>

        <form
          className="ai-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            placeholder="Ask AI Assistant about projects, delivery targets, documents, or draft emails..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="primary" disabled={!input.trim() || loading}>
            Send ↵
          </button>
        </form>
      </section>
    </>
  );
}



