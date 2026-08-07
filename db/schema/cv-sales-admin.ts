import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull(),
  client: text("client").notNull(),
  model: text("model").notNull(),
  quantity: integer("quantity").notNull().default(1),
  agent: text("agent").notNull(),
  manager: text("manager").notNull().default("Robespierre T. Agir"),
  stage: integer("stage").notNull().default(1),
  status: text("status").notNull().default("Active"),
  priority: text("priority").notNull().default("Normal"),
  targetDelivery: text("target_delivery"),
  nextAction: text("next_action").notNull().default(""),
  progress: integer("progress").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  objectKey: text("object_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  projectReference: text("project_reference"),
  category: text("category").notNull().default("Other"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commissionRecords = pgTable("commission_records", {
  id: serial("id").primaryKey(),
  projectReference: text("project_reference").notNull(),
  expectedAmount: doublePrecision("expected_amount").notNull().default(0),
  receivedAmount: doublePrecision("received_amount").notNull().default(0),
  status: text("status").notNull().default("Pending"),
  receivedDate: text("received_date"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("customer"),
  verified: boolean("verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationOtp: text("verification_otp"),
  verificationExpires: timestamp("verification_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  userId: text("user_id"),
  accountType: text("account_type").notNull().default("Government"), // Government, LGU, Cooperative, Private
  contactPerson: text("contact_person").notNull(),
  contactNumber: text("contact_number").notNull(),
  philgepsItbNo: text("philgeps_itb_no"),
  procurementEntity: text("procurement_entity"),
  abcAmount: doublePrecision("abc_amount"),
  unitToBeUsed: text("unit_to_be_used"),
  remarks: text("remarks"),
  legalChecked: boolean("legal_checked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  csNumber: text("cs_number").notNull().unique(),
  vinNumber: text("vin_number"),
  engineNumber: text("engine_number"),
  modelDescription: text("model_description").notNull(),
  color: text("color").notNull().default("White"),
  location: text("location").notNull().default("Davao Yard"),
  status: text("status").notNull().default("Available"), // Available, Reserved, Allocated, Service, Released
  clientId: integer("client_id"),
  salesConsultant: text("sales_consultant"),
  dateAssigned: text("date_assigned"),
  dateReleased: text("date_released"),
  dealersPrice: doublePrecision("dealers_price").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull(),
  clientId: integer("client_id").notNull(),
  salesAgent: text("sales_agent").notNull(),
  gsmName: text("gsm_name").notNull().default("Robespierre T. Agir"),
  legalDocsMissing: boolean("legal_docs_missing").notNull().default(false),
  missingReason: text("missing_reason"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  docName: text("doc_name").notNull(),
  docType: text("doc_type").notNull(),
  unitCsNumber: text("unit_cs_number"),
  clientId: integer("client_id"),
  status: text("status").notNull().default("Pending"),
  fileUrl: text("file_url"),
  notarialStatus: text("notarial_status").default("Not Required"),
  transmittalStatus: text("transmittal_status").default("Pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const followups = pgTable("followups", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  unitCsNumber: text("unit_cs_number"),
  clientName: text("client_name").notNull(),
  requirement: text("requirement").notNull(),
  actionNeeded: text("action_needed").notNull(),
  dueDate: text("due_date").notNull(),
  contactPerson: text("contact_person"),
  contactNumber: text("contact_number"),
  remarks: text("remarks"),
  status: text("status").notNull().default("Open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pdiChecks = pgTable("pdi_checks", {
  id: serial("id").primaryKey(),
  unitCsNumber: text("unit_cs_number").notNull(),
  status: text("status").notNull().default("Not Started"),
  findings: text("findings"),
  remarks: text("remarks"),
  waivedReason: text("waived_reason"),
  scheduledDate: text("scheduled_date"),
  completedDate: text("completed_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const releases = pgTable("releases", {
  id: serial("id").primaryKey(),
  unitCsNumber: text("unit_cs_number").notNull(),
  clientName: text("client_name").notNull(),
  salesAgent: text("sales_agent").notNull(),
  gatePassStatus: text("gate_pass_status").notNull().default("Missing"),
  isReady: boolean("is_ready").notNull().default(false),
  releasedWithPending: boolean("released_with_pending").notNull().default(false),
  pendingReason: text("pending_reason"),
  releaseStatus: text("release_status").notNull().default("Pending"),
  actualReleaseDate: text("actual_release_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  unitCsNumber: text("unit_cs_number"),
  projectName: text("project_name").notNull(),
  requestedAmount: doublePrecision("requested_amount").notNull().default(0),
  approvedAmount: doublePrecision("approved_amount").notNull().default(0),
  releasedAmount: doublePrecision("released_amount").notNull().default(0),
  liquidatedAmount: doublePrecision("liquidated_amount").notNull().default(0),
  unliquidatedBalance: doublePrecision("unliquidated_balance").notNull().default(0),
  status: text("status").notNull().default("Requested"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  unitCsNumber: text("unit_cs_number"),
  clientName: text("client_name").notNull(),
  bankPoStatus: text("bank_po_status").notNull().default("For Submission"),
  expectedAmount: doublePrecision("expected_amount").notNull().default(0),
  collectedAmount: doublePrecision("collected_amount").notNull().default(0),
  status: text("status").notNull().default("Pending"),
  dueDate: text("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insuranceRecords = pgTable("insurance_records", {
  id: serial("id").primaryKey(),
  unitCsNumber: text("unit_cs_number").notNull(),
  insuranceCompany: text("insurance_company").notNull(),
  policyNumber: text("policy_number"),
  status: text("status").notNull().default("Active"),
  expiryDate: text("expiry_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const incentives = pgTable("incentives", {
  id: serial("id").primaryKey(),
  unitCsNumber: text("unit_cs_number").notNull(),
  salesConsultant: text("sales_consultant").notNull(),
  agentPin: text("agent_pin").default("1234"),
  invoiceUploaded: boolean("invoice_uploaded").notNull().default(false),
  drUploaded: boolean("dr_uploaded").notNull().default(false),
  htbLeadsUploaded: boolean("htb_leads_uploaded").notNull().default(false),
  status: text("status").notNull().default("Requirements Pending"),
  incentiveAmount: doublePrecision("incentive_amount").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull().default("Sales"),
  departmentStartDate: text("department_start_date"),
  contactNumber: text("contact_number"),
  email: text("email"),
  activeStatus: text("active_status").notNull().default("Active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const masterLists = pgTable("master_lists", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  optionValue: text("option_value").notNull(),
  activeStatus: text("active_status").notNull().default("Active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  actor: text("actor").notNull().default("Ara Mae Marcillo"),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
