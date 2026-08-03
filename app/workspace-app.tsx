"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

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
      { id: "dashboard", label: "Dashboard", icon: "⌂" },
      { id: "urgent", label: "Urgent", icon: "!", count: 5 },
      { id: "today", label: "Today", icon: "◷", count: 8 },
      { id: "upcoming", label: "Upcoming 15 Days", icon: "◫", count: 14 },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { id: "projects", label: "Projects & Units", icon: "▦" },
      { id: "inventory", label: "Inventory", icon: "◇" },
      { id: "tasks", label: "Tasks", icon: "✓" },
      { id: "documents", label: "Documents", icon: "▤" },
      { id: "followups", label: "Follow-Ups", icon: "↗" },
      { id: "workflow", label: "Workflow", icon: "⇢" },
      { id: "fabrication", label: "Fabrication & PDI", icon: "⚙" },
      { id: "releases", label: "Releases", icon: "⌁" },
      { id: "incentives", label: "Incentives", icon: "☆" },
      { id: "caltex", label: "Caltex Cards", icon: "▣" },
    ],
  },
  {
    title: "PEOPLE & INSIGHTS",
    items: [
      { id: "clients", label: "Clients", icon: "♙" },
      { id: "agents", label: "Agents / Persons", icon: "♢" },
      { id: "reports", label: "Reports", icon: "◒" },
      { id: "files", label: "File Library", icon: "▱" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { id: "ai", label: "AI Assistant", icon: "✦", disabled: true },
      { id: "settings", label: "Settings", icon: "⚙" },
    ],
  },
];

const trackerContent: Record<string, { title: string; subtitle: string; metrics: [string, string][]; columns: string[]; rows: string[][] }> = {
  urgent: { title: "Urgent Work", subtitle: "Critical items that need action now.", metrics: [["5", "Urgent items"], ["2", "Overdue"], ["1", "Blocked"]], columns: ["Priority", "Record", "Issue", "Owner", "Due"], rows: [["Urgent", "CV-2026-001", "Fabrication update overdue", "Kath", "Today"], ["Urgent", "CV-2026-004", "Trucking not confirmed", "Ara", "Today"], ["High", "CV-2026-003", "2 documents missing", "Ergem", "Tomorrow"]] },
  today: { title: "Today's Work", subtitle: "Everything lined up for today.", metrics: [["8", "Due today"], ["3", "Completed"], ["5", "Remaining"]], columns: ["Time", "Task", "Project", "Owner", "Status"], rows: [["9:00 AM", "Supplier coordination", "CV-2026-001", "Ara", "Ongoing"], ["11:00 AM", "PDI checklist", "CV-2026-002", "Ara", "Pending"], ["2:00 PM", "Delivery confirmation", "CV-2026-004", "Darnet", "Pending"]] },
  upcoming: { title: "Upcoming 15 Days", subtitle: "A clear view of the next two weeks.", metrics: [["14", "Upcoming"], ["4", "Deliveries"], ["6", "Follow-ups"]], columns: ["Date", "Activity", "Project", "Category", "Days"], rows: [["Aug 06", "Confirm delivery team", "CV-2026-004", "Delivery", "3"], ["Aug 08", "Complete PDI", "CV-2026-002", "Inspection", "5"], ["Aug 12", "Fabrication target", "CV-2026-001", "Fabrication", "9"]] },
  inventory: { title: "Inventory Tracker", subtitle: "Availability, assignments, age, and unit identifiers.", metrics: [["38", "Total units"], ["12", "Available"], ["9", "Assigned"]], columns: ["Unit Ref", "Model", "Location", "Age", "Status"], rows: [["INV-0261", "HD65 Cab & Chassis", "Davao Yard", "18 days", "Available"], ["INV-0254", "H-100", "Fabricator", "31 days", "Assigned"], ["INV-0248", "HD78", "Davao Yard", "47 days", "For Review"]] },
  tasks: { title: "Daily Task Tracker", subtitle: "Prioritized work with clear owners and deadlines.", metrics: [["23", "Open"], ["8", "Due today"], ["5", "Completed"]], columns: ["Task", "Project", "Owner", "Priority", "Due"], rows: [["Request missing documents", "CV-2026-003", "Ara", "High", "Today"], ["Confirm accessory list", "CV-2026-001", "Kath", "Normal", "Aug 05"], ["Prepare delivery packet", "CV-2026-004", "Ara", "High", "Aug 06"]] },
  documents: { title: "Document Tracker", subtitle: "Requirements, missing items, and completion status.", metrics: [["84%", "Overall complete"], ["7", "Missing"], ["18", "Received"]], columns: ["Project", "Document", "Status", "Responsible", "Updated"], rows: [["CV-2026-003", "Acceptance requirements", "Missing", "Ergem", "Aug 02"], ["CV-2026-002", "Insurance", "Received", "Ara", "Aug 03"], ["CV-2026-004", "Delivery receipt", "Draft", "Ara", "Aug 03"]] },
  followups: { title: "Follow-Up Tracker", subtitle: "Every commitment has a next date and owner.", metrics: [["11", "Open"], ["3", "Due today"], ["2", "Overdue"]], columns: ["Contact", "Project", "Category", "Next Follow-Up", "Status"], rows: [["Body fabricator", "CV-2026-001", "Progress", "Today", "Due"], ["Client representative", "CV-2026-003", "Documents", "Tomorrow", "Scheduled"], ["Trucking provider", "CV-2026-004", "Delivery", "Today", "Due"]] },
  fabrication: { title: "Fabrication & PDI", subtitle: "Track build progress, inspections, issues, and photos.", metrics: [["7", "In fabrication"], ["3", "For PDI"], ["1", "Needs recheck"]], columns: ["Project", "Application", "Progress", "Target", "Status"], rows: [["CV-2026-001", "Ambulance Body", "64%", "Aug 12", "In Progress"], ["CV-2026-002", "Wing Van", "100%", "Aug 08", "For PDI"], ["CV-2026-003", "Rescue Body", "22%", "Aug 17", "Waiting"]] },
  releases: { title: "Release Tracker", subtitle: "Internal release, actual release, and delivery history.", metrics: [["9", "Ready"], ["6", "Released this month"], ["2", "For delivery"]], columns: ["Reference", "Client", "Model", "Agent", "Release Status"], rows: [["CV-2026-004", "Regional Logistics Support", "HD78", "Darnet", "Ready"], ["REL-2026-031", "Demo Client A", "H-100", "Kath", "Released"], ["REL-2026-030", "Demo Client B", "HD65", "RAM", "Delivered"]] },
  incentives: { title: "Incentive Tracker", subtitle: "Restricted monitoring linked to actual released units.", metrics: [["6", "This month"], ["4", "Submitted"], ["2", "Pending"]], columns: ["Batch", "Unit Reference", "Consultant", "Status", "Proof"], rows: [["Aug 2026", "REL-2026-031", "Kath", "Submitted", "Attached"], ["Aug 2026", "REL-2026-030", "RAM", "Received", "Attached"], ["Aug 2026", "REL-2026-029", "Ergem", "Pending", "Missing"]] },
  caltex: { title: "Caltex Card Monitoring", subtitle: "Card distribution with masked numbers and proof.", metrics: [["13", "Total cards"], ["9", "Received"], ["4", "Pending"]], columns: ["Card", "Recipient", "Unit", "Status", "Date"], rows: [["•••• 4821", "Demo Recipient A", "H-100", "Received", "Aug 01"], ["•••• 1176", "Demo Recipient B", "HD65", "Pending", "—"], ["•••• 9034", "Demo Recipient C", "HD78", "Received", "Jul 29"]] },
  clients: { title: "Client Directory", subtitle: "Reusable client records with connected projects and history.", metrics: [["26", "Active clients"], ["4", "New this month"], ["11", "With active projects"]], columns: ["Client", "Type", "Contact", "Active Projects", "Last Update"], rows: [["City Emergency Response Fleet", "Government", "Primary Contact", "1", "Today"], ["Provincial Mobile Services", "Government", "Primary Contact", "1", "Today"], ["Municipal Rescue Upgrade", "Government", "Primary Contact", "1", "Yesterday"]] },
  agents: { title: "Agents / Persons", subtitle: "Assignments and history, separate from login access.", metrics: [["6", "Active persons"], ["4", "Sales agents"], ["1", "Manager"]], columns: ["Name", "Role", "Active Projects", "Units", "Status"], rows: [["Ara Mae Marcillo", "CV Sales Admin", "4", "10", "Active"], ["Robespierre T. Agir", "General Sales Manager", "4", "10", "Active"], ["RAM", "Sales Consultant", "1", "2", "Active"], ["Kath", "Sales Consultant", "1", "3", "Active"], ["Darnet", "Sales Consultant", "1", "4", "Active"], ["Ergem", "Sales Consultant", "1", "1", "Active"]] },
  reports: { title: "Reports & Analytics", subtitle: "Filtered, printable, and export-ready operational views.", metrics: [["12", "Saved reports"], ["6", "Operational"], ["4", "Monthly"]], columns: ["Report", "Period", "Format", "Last Generated", "Access"], rows: [["Active Projects & Units", "Current", "Dashboard", "Today", "Standard"], ["Release History", "August 2026", "PDF / Excel", "Yesterday", "Restricted"], ["Pending Documents", "Current", "Dashboard", "Today", "Standard"]] },
  files: { title: "File Library", subtitle: "Production-ready storage linked to projects, units, and stages.", metrics: [["34", "Files"], ["12", "Documents"], ["16", "Photos"]], columns: ["File", "Category", "Linked Record", "Uploaded", "Status"], rows: [["quotation-sample.pdf", "Quotation", "CV-2026-001", "Aug 03", "Available"], ["pdi-photo-01.jpg", "PDI Photo", "CV-2026-002", "Aug 03", "Available"], ["delivery-draft.pdf", "Delivery", "CV-2026-004", "Aug 02", "Draft"]] },
};

const themes = [
  { name: "Ara Signature", key: "rose", collection: "Signature", swatches: ["#7d4f67", "#e8c8d4", "#fbf6f3"] },
  { name: "Corporate Navy", key: "corporate", collection: "Office", swatches: ["#173f73", "#3d6fa8", "#eef3f8"] },
  { name: "Black & White", key: "mono", collection: "Office", swatches: ["#050505", "#ffffff", "#8f8f8f"] },
];

const stages = ["Inquiry", "Sales Consultant", "Quotation", "Decision", "PO / NOA", "Project Encoding", "Documents", "Availability", "Fabrication", "Monitoring", "PDI", "Delivery Docs", "Scheduling", "Delivery", "Acceptance", "Billing", "After-Sales"];

function statusTone(value: string) {
  const v = value.toLowerCase();
  if (v.includes("urgent") || v.includes("overdue") || v.includes("missing")) return "red";
  if (v.includes("pending") || v.includes("waiting") || v.includes("draft")) return "amber";
  if (v.includes("complete") || v.includes("received") || v.includes("released") || v.includes("available")) return "green";
  if (v.includes("review") || v.includes("pdi")) return "purple";
  return "blue";
}

function placeholderAction(label: string) {
  window.alert(`${label} is ready for the real database phase.`);
}

function Status({ children }: { children: string }) {
  return <span className={`status ${statusTone(children)}`}><i />{children}</span>;
}

export default function WorkspaceApp({ authenticatedName }: { authenticatedName: string | null }) {
  const [entered, setEntered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(15);
  const [active, setActive] = useState("dashboard");
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState("rose");
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState("medium");
  const [fontColor, setFontColor] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastActivityRef = useRef(0);
  const warningShownRef = useRef(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.projects) && data.projects.length) setProjects(data.projects);
      })
      .catch(() => undefined);
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

  function enterWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEntered(true);
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

  if (!entered) {
    return (
      <main className="login-page" data-theme={theme}>
        <section className="login-portrait">
          <Image src="/robert-herrero.png" alt="Robert Pogs Herrero" fill priority sizes="47vw" />
          <div className="portrait-shade" />
          <div className="prepared-card">
            <span>Thoughtfully prepared by</span>
            <strong>ROBERT POGS! HERRERO</strong>
          </div>
        </section>
        <section className="login-panel">
          <div className="login-box">
            <div className="brand-mark">CV</div>
            <p className="eyebrow">PRIVATE WORKSPACE</p>
            <h1>Welcome to your<br /><em>Safe Haven.</em></h1>
            <p className="login-copy">Everything you need to keep projects moving—organized, calm, and beautifully clear.</p>
            <form onSubmit={enterWorkspace}>
              <label>Username</label>
              <div className="input-shell"><span>♙</span><input required defaultValue={authenticatedName ?? "Ara Mae Marcillo"} aria-label="Username" /></div>
              <label>Password</label>
              <div className="input-shell"><span>◇</span><input required type={showPassword ? "text" : "password"} placeholder="Enter your secure password" aria-label="Password" /><button type="button" className="eye" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "◌" : "◉"}</button></div>
              <div className="session-note"><span>●</span> Secure private session · Auto-lock after 15 minutes</div>
              <button className="primary login-button" type="submit">Enter Workspace <span>→</span></button>
            </form>
            <p className="login-foot">CV SALES ADMIN OS <i>•</i> ARA’S SAFE HAVEN</p>
          </div>
        </section>
      </main>
    );
  }

  const activeLabel = navGroups.flatMap((g) => g.items).find((item) => item.id === active)?.label ?? "Dashboard";

  return (
    <main className={`workspace density-${density} font-${fontSize}`} data-theme={theme} style={{ ...(fontColor ? { "--ink": fontColor } : {}), ...(backgroundColor ? { "--page": backgroundColor } : {}) } as React.CSSProperties}>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="side-brand"><div className="brand-mark small">CV</div><div><strong>CV Sales Admin</strong><span>Ara’s Safe Haven</span></div><button className="mobile-close" onClick={() => setMobileNav(false)}>×</button></div>
        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p>{group.title}</p>
              {group.items.map((item) => (
                <button key={item.id} className={`${active === item.id ? "active" : ""} ${item.disabled ? "disabled" : ""}`} onClick={() => { if (!item.disabled) { setActive(item.id); setMobileNav(false); if (item.id === "settings") setShowSettings(true); } }}>
                  <span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.count ? <b>{item.count}</b> : null}{item.disabled ? <small>SOON</small> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button className="help-card" onClick={() => setToast("Help center is ready for your company guides.")}><span>?</span><div><strong>Need a hand?</strong><small>Open help center</small></div></button>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="hamburger" onClick={() => setMobileNav(true)}>☰</button>
          <div className="global-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, units, CS, VIN, clients…" /><kbd>⌘ K</kbd></div>
          <button className="icon-button" aria-label="Notifications" onClick={() => setToast("Notifications panel is ready for alerts and reminders.")}>♢<i /></button>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setMenuOpen(!menuOpen)}><Image src="/ara-mae.png" alt="Ara Mae Marcillo" width={35} height={35} /><span><strong>Ara Mae Marcillo</strong><small>CV Sales Admin</small></span><b>⌄</b></button>
            {menuOpen && <div className="profile-menu"><button onClick={() => { setShowVault(true); setMenuOpen(false); }}>Private Commission Vault <span>⌁</span></button><button onClick={() => { setShowSettings(true); setMenuOpen(false); }}>Workspace Settings <span>⚙</span></button><button onClick={() => setEntered(false)}>Lock Workspace <span>↗</span></button></div>}
          </div>
        </header>

        <div className="content">
          {active === "dashboard" ? (
            <Dashboard projects={filteredProjects} setActive={setActive} setShowAdd={setShowAdd} setSelectedProject={setSelectedProject} />
          ) : active === "projects" ? (
            <ProjectsView projects={filteredProjects} query={query} setQuery={setQuery} setShowAdd={setShowAdd} setSelectedProject={setSelectedProject} />
          ) : active === "workflow" ? (
            <WorkflowView projects={projects} setSelectedProject={setSelectedProject} />
          ) : active === "ai" ? null : (
            <TrackerView id={active} label={activeLabel} onAdd={() => setShowAdd(true)} onUpload={() => fileRef.current?.click()} />
          )}
        </div>
      </section>

      <input ref={fileRef} type="file" className="hidden-input" onChange={uploadFile} accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.jpg,.jpeg,.png" />
      {showAdd && <AddProjectModal close={() => setShowAdd(false)} submit={addProject} />}
      {selectedProject && <ProjectDrawer project={selectedProject} close={() => setSelectedProject(null)} />}
      {showSettings && <SettingsDrawer close={() => { setShowSettings(false); setActive("dashboard"); }} theme={theme} setTheme={setTheme} density={density} setDensity={setDensity} fontSize={fontSize} setFontSize={setFontSize} fontColor={fontColor} setFontColor={setFontColor} backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor} sessionMinutes={sessionMinutes} setSessionMinutes={setSessionMinutes} />}
      {showVault && <VaultModal close={() => { setShowVault(false); setVaultUnlocked(false); }} unlocked={vaultUnlocked} unlock={() => setVaultUnlocked(true)} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}

function Dashboard({ projects, setActive, setShowAdd, setSelectedProject }: { projects: Project[]; setActive: (v: string) => void; setShowAdd: (v: boolean) => void; setSelectedProject: (v: Project) => void }) {
  const cards = [["Active Projects", String(projects.length), "+2 this month", "▦", "plum"], ["Physical Units", String(projects.reduce((n, p) => n + p.quantity, 0)), "Across all projects", "◇", "rose"], ["Pending Documents", "7", "3 need attention", "▤", "amber"], ["In Fabrication", "7", "2 nearing target", "⚙", "blue"], ["Ready for Delivery", "4", "Within 15 days", "⌁", "green"], ["Pending Billing", "3", "Follow-up required", "◒", "lavender"]];
  return <>
    <div className="welcome-row"><div><p className="eyebrow">MONDAY, AUGUST 3</p><h1>Good morning, Ara! <span>✿</span></h1><p>Here’s your calm, clear view of everything that needs attention.</p></div><div className="welcome-actions"><button className="secondary" onClick={() => setActive("upcoming")}>◫ View Schedule</button><button className="primary" onClick={() => setShowAdd(true)}>＋ Quick Add</button></div></div>
    <div className="focus-strip"><button onClick={() => setActive("urgent")}><span className="focus-icon urgent">!</span><div><strong>5 urgent items</strong><small>2 overdue · 3 need action</small></div><b>→</b></button><button onClick={() => setActive("today")}><span className="focus-icon today">◷</span><div><strong>8 tasks for today</strong><small>3 completed · 5 remaining</small></div><b>→</b></button><button onClick={() => setActive("upcoming")}><span className="focus-icon upcoming">◫</span><div><strong>14 upcoming</strong><small>Within the next 15 days</small></div><b>→</b></button></div>
    <div className="metric-grid">{cards.map(([label, value, note, icon, tone]) => <button className="metric-card" key={label} onClick={() => setActive(label === "Active Projects" || label === "Physical Units" ? "projects" : label === "Pending Documents" ? "documents" : label === "In Fabrication" ? "fabrication" : label === "Ready for Delivery" ? "releases" : "reports")}><span className={`metric-icon ${tone}`}>{icon}</span><small>{label}</small><strong>{value}</strong><p>{note}</p><b>↗</b></button>)}</div>
    <div className="dashboard-grid">
      <section className="panel work-queue"><PanelHead title="Priority Work Queue" subtitle="Sorted by urgency and due date" action="View all" onAction={() => setActive("urgent")} /><div className="table-wrap"><table><thead><tr><th>PROJECT / CLIENT</th><th>NEXT ACTION</th><th>OWNER</th><th>DUE</th><th>STATUS</th><th /></tr></thead><tbody>{projects.slice(0, 4).map((p) => <tr key={p.id} onClick={() => setSelectedProject(p)}><td><strong>{p.reference}</strong><span>{p.client}</span></td><td><strong>{p.nextAction}</strong><span>{p.model} · {p.quantity} unit{p.quantity > 1 ? "s" : ""}</span></td><td><span className="agent-dot">{p.agent.slice(0, 1)}</span>{p.agent}</td><td><strong>{p.targetDelivery}</strong></td><td><Status>{p.priority === "Urgent" ? "Urgent" : p.status}</Status></td><td>›</td></tr>)}</tbody></table></div>
      </section>
      <section className="panel schedule-card"><PanelHead title="Upcoming Schedule" subtitle="Next 15 days" action="Calendar" onAction={() => setActive("upcoming")} /><div className="date-chip"><b>03</b><span>AUG<br />MON</span></div><div className="schedule-item"><i className="rose-line" /><div><strong>Fabrication follow-up</strong><span>CV-2026-001 · 9:00 AM</span></div><Status>Urgent</Status></div><div className="schedule-item"><i className="blue-line" /><div><strong>PDI checklist review</strong><span>CV-2026-002 · 11:00 AM</span></div><Status>For Review</Status></div><div className="schedule-item"><i className="green-line" /><div><strong>Delivery confirmation</strong><span>CV-2026-004 · 2:00 PM</span></div><Status>Active</Status></div>
      </section>
      <section className="panel workflow-panel"><PanelHead title="17-Stage Workflow" subtitle="Click a stage to see its projects" action="Full workflow" onAction={() => setActive("workflow")} /><div className="mini-stages">{stages.slice(5, 14).map((stage, index) => <button key={stage} onClick={() => setActive("workflow")}><span>{index + 6}</span><strong>{stage}</strong><b>{[2, 3, 1, 7, 4, 3, 2, 4, 1][index]}</b></button>)}</div></section>
      <section className="panel activity-panel"><PanelHead title="Recent Activity" subtitle="Latest workspace updates" /><div className="activity"><i className="green" /> <div><strong>PDI status updated</strong><span>CV-2026-002 moved to For PDI</span><small>10 minutes ago · Ara</small></div></div><div className="activity"><i className="purple" /> <div><strong>Document uploaded</strong><span>Insurance added to CV-2026-002</span><small>42 minutes ago · Ara</small></div></div><div className="activity"><i className="amber" /> <div><strong>Follow-up scheduled</strong><span>Fabricator call set for today</span><small>1 hour ago · Ara</small></div></div></section>
    </div>
  </>;
}

function PanelHead({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) { return <header className="panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button onClick={onAction}>{action} →</button>}</header>; }

function ProjectsView({ projects, query, setQuery, setShowAdd, setSelectedProject }: { projects: Project[]; query: string; setQuery: (v: string) => void; setShowAdd: (v: boolean) => void; setSelectedProject: (v: Project) => void }) {
  return <><div className="module-hero"><div><p className="eyebrow">OPERATIONS</p><h1>Projects & Units</h1><p>One organized record from inquiry to after-sales support.</p></div><button className="primary" onClick={() => setShowAdd(true)}>＋ Add Project</button></div><div className="toolbar"><div className="small-search">⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this table…" /></div><button onClick={() => placeholderAction("Filter")}>☷ Filter</button><button onClick={() => placeholderAction("Sort")}>⇅ Sort</button><button onClick={() => placeholderAction("Columns")}>▦ Columns</button><button onClick={() => placeholderAction("Saved views")}>Saved Views ⌄</button></div><section className="panel project-table"><table><thead><tr><th>PROJECT</th><th>CLIENT & UNIT</th><th>AGENT</th><th>WORKFLOW</th><th>DELIVERY</th><th>STATUS</th><th>PROGRESS</th><th /></tr></thead><tbody>{projects.map((p) => <tr key={p.id} onClick={() => setSelectedProject(p)}><td><strong>{p.reference}</strong><span>{p.quantity} physical unit{p.quantity > 1 ? "s" : ""}</span></td><td><strong>{p.client}</strong><span>{p.model}</span></td><td><span className="agent-dot">{p.agent[0]}</span>{p.agent}</td><td><strong>Stage {p.stage}</strong><span>{stages[p.stage - 1]}</span></td><td>{p.targetDelivery}</td><td><Status>{p.status}</Status></td><td><div className="progress"><i style={{ width: `${p.progress}%` }} /></div><span>{p.progress}% complete</span></td><td>›</td></tr>)}</tbody></table></section></>;
}

function TrackerView({ id, label, onAdd, onUpload }: { id: string; label: string; onAdd: () => void; onUpload: () => void }) {
  const data = trackerContent[id] ?? { title: label, subtitle: "Organized records and clear next actions.", metrics: [["0", "Open"], ["0", "Due"], ["0", "Completed"]] as [string, string][], columns: ["Record", "Details", "Owner", "Status"], rows: [] };
  return <><div className="module-hero"><div><p className="eyebrow">CV SALES ADMIN OS</p><h1>{data.title}</h1><p>{data.subtitle}</p></div><div className="hero-buttons">{id === "files" && <button className="secondary" onClick={onUpload}>⇧ Upload File</button>}<button className="primary" onClick={onAdd}>＋ Add Record</button></div></div><div className="module-metrics">{data.metrics.map(([value, text]) => <div key={text}><strong>{value}</strong><span>{text}</span></div>)}</div><div className="toolbar"><div className="small-search">⌕<input placeholder={`Search ${data.title.toLowerCase()}…`} /></div><button onClick={() => placeholderAction("Filter")}>☷ Filter</button><button onClick={() => placeholderAction("Sort")}>⇅ Sort</button><button onClick={() => placeholderAction("Columns")}>▦ Columns</button><button onClick={() => placeholderAction("Export")}>Export ⌄</button></div><section className="panel tracker-table"><table><thead><tr>{data.columns.map((c) => <th key={c}>{c.toUpperCase()}</th>)}<th /></tr></thead><tbody>{data.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cellIndex === row.length - 1 || cell.toLowerCase().includes("pending") || cell.toLowerCase().includes("received") || cell.toLowerCase().includes("urgent") || cell.toLowerCase().includes("active") ? <Status>{cell}</Status> : <strong>{cell}</strong>}</td>)}<td>›</td></tr>)}</tbody></table></section></>;
}

function WorkflowView({ projects, setSelectedProject }: { projects: Project[]; setSelectedProject: (v: Project) => void }) {
  return <><div className="module-hero"><div><p className="eyebrow">FAST AUTO CORE INC.</p><h1>17-Stage CV Admin Workflow</h1><p>Every project has a visible current stage, owner, and next action.</p></div><button className="secondary" onClick={() => placeholderAction("Workflow editor")}>Edit Workflow</button></div><div className="workflow-board">{stages.map((stage, index) => { const matches = projects.filter((p) => p.stage === index + 1); return <section className="stage-card" key={stage}><header><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{stage}</strong><small>{matches.length} active project{matches.length !== 1 ? "s" : ""}</small></div><b>{matches.length}</b></header>{matches.map((p) => <button key={p.id} onClick={() => setSelectedProject(p)}><strong>{p.reference}</strong><span>{p.client}</span><Status>{p.status}</Status></button>)}</section>; })}</div></>;
}

function AddProjectModal({ close, submit }: { close: () => void; submit: (e: FormEvent<HTMLFormElement>) => void }) {
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><form className="modal add-modal" onSubmit={submit}><button type="button" className="close" onClick={close}>×</button><p className="eyebrow">QUICK ADD</p><h2>Create a new project</h2><p>Start with the essentials. You can complete unit identifiers later.</p><div className="form-grid"><label className="full">Client / Project Name<input name="client" required placeholder="Enter official client or project name" /></label><label>Sales Consultant<select name="agent" required defaultValue=""><option value="" disabled>Select agent</option><option>RAM</option><option>Kath</option><option>Darnet</option><option>Ergem</option><option>Ara Mae Marcillo</option></select></label><label>General Sales Manager<input name="manager" defaultValue="Robespierre T. Agir" /></label><label>Unit Model<input name="model" required placeholder="e.g. H-100 Ambulance" /></label><label>Quantity<input name="quantity" type="number" min="1" defaultValue="1" /></label><label>Target Delivery<input name="targetDelivery" type="date" /></label><label>Current Stage<select name="stage" defaultValue="1">{stages.map((s, i) => <option value={i + 1} key={s}>{i + 1}. {s}</option>)}</select></label><label>Priority<select name="priority"><option>Normal</option><option>High</option><option>Urgent</option></select></label><label className="full">Next Action / Notes<textarea name="nextAction" placeholder="What needs to happen next?" /></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">Save Project & Create Unit Slots</button></div></form></div>;
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
