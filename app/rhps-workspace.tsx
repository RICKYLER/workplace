"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "../lib/supabase/client";
import "./workspace.css";

// --- TYPES ALIGNED WITH REQUIRED FIELDS & DEVELOPER HANDOFF SPECIFICATIONS ---

export type RecordMode = "ACTUAL" | "TEST";

export type CustomerPiano = {
  id: string;
  linkedCustomerId: string;
  pianoType: "Upright" | "Grand";
  brand: string;
  model: string;
  serialNumber: string;
  currentLocation: string;
  pianoStatus: "Owned by Customer" | "In Service" | "For Repair" | "Archived";
  createdDate: string;
  lastUpdatedDate: string;
  color?: string;
  size?: string;
  photos?: string[];
  lastTuningDate?: string;
  lastServiceDate?: string;
  conditionNotes?: string;
};

export type Customer = {
  id: string;
  name: string;
  contactNumber: string;
  completeAddress: string;
  customerType: "New" | "Old" | "Repeat";
  linkedPianoIds: string[];
  createdDate: string;
  lastUpdatedDate: string;
  email?: string;
  facebookName?: string;
  facebookLink?: string;
  gmapsLink?: string;
  reminderDate?: string;
  reminderNotes?: string;
  alternateContactNumber?: string;
  cityArea?: string;
  landmark?: string;
  notes?: string;
  pianos?: CustomerPiano[];
};

export type Lead = {
  id: string;
  createdDate: string;
  source: "Facebook" | "Website" | "Call" | "Walk-In" | "Referral" | "Repeat Customer" | "Other";
  customerName: string;
  contactNumber: string;
  locationCity: string;
  inquiryType: "Tuning" | "Repair" | "Cleaning" | "Assessment" | "Moving" | "Sales" | "Trade-In" | "Rental" | "Other";
  pianoType: string;
  mainConcern: string;
  preferredSchedule: string;
  status: "New Lead" | "Contacted" | "Qualified" | "Converted to Estimate" | "Lost / Closed No Sale";
  nextAction: string;
  assignedOwner: string;
  recordMode: RecordMode;
  email?: string;
  facebookName?: string;
  existingCustomerId?: string;
  pianoBrand?: string;
  photosVideos?: string[];
  budgetRange?: string;
  accessParkingTravelNotes?: string;
  notes?: string;
  followUpDate?: string;
  gmapsLink?: string;
};

export type EstimateStatus =
  | "Draft"
  | "Sent to Customer"
  | "Approved"
  | "Declined"
  | "Revision Requested"
  | "Expired"
  | "Converted to Quotation";

export type Estimate = {
  id: string;
  date: string;
  leadId: string;
  customerName: string;
  contactNumber: string;
  serviceLocation: string;
  pianoBrandTypeModelSerial: string;
  mainConcern: string;
  recommendedScope: string;
  estimatedAmount: number;
  estimatedAmountRange?: string;
  estimateBasis: "Remote" | "On-Site";
  validityDate: string;
  status: EstimateStatus;
  preparedBy: string;
  recordMode: RecordMode;
  landmarkAccessNotes?: string;
  lastTuningServiceDate?: string;
  photosVideoReviewed?: "Yes" | "No";
  depositRequired?: number;
  notes?: string;
};

export type QuotationStatus =
  | "Draft"
  | "Sent for Approval"
  | "Approved"
  | "Declined"
  | "Revision Needed"
  | "Expired"
  | "Converted to Customer Case";

export type Quotation = {
  id: string;
  date: string;
  estimateId: string;
  revisionNo: string;
  customerName: string;
  contactNumber: string;
  serviceLocation: string;
  pianoBrandTypeModelSerial: string;
  proposedScope: string;
  approvedQuotedAmount: number;
  depositRequired: number;
  balanceTerms: string;
  validityDate: string;
  status: QuotationStatus;
  preparedBy: string;
  recordMode: RecordMode;
  customerDecisionNotes?: string;
  writtenApprovalRef?: string;
  specialTermsConditions?: string;
};

export type CustomerCase = {
  id: string;
  dateConfirmed: string;
  confirmedBy: string;
  linkedCustomerId: string;
  linkedPianoIds: string[];
  linkedQuotationNo: string;
  approvedScopeOfWork: string;
  approvedAmount: number;
  status: "Open" | "Confirmed" | "Waiting for Schedule" | "Scheduled" | "In Service" | "Additional Finding Pending" | "For Billing" | "Paid" | "Follow-Up" | "Closed" | "Lost";
  createdDate: string;
  lastUpdatedDate: string;
  customerName: string;
  serviceType: string;
  recordMode: RecordMode;
};

export type ScheduleStatus =
  | "Pending Confirmation"
  | "Confirmed"
  | "Rescheduled"
  | "Cancelled"
  | "Converted to Job Order";

export type ScheduleItem = {
  id: string;
  caseId: string;
  customerName: string;
  serviceLocation: string;
  pianoDetails: string;
  serviceDate: string;
  arrivalWindow: string;
  leadTechnician: string;
  associates: string;
  status: ScheduleStatus;
  recordMode: RecordMode;
  accessParkingTravelNotes?: string;
  rescheduledFromDate?: string;
  cancellationReason?: string;
  notes?: string;
};

export type JobOrderStatus =
  | "Assigned"
  | "In Progress"
  | "Additional Finding Pending"
  | "Completed"
  | "Cancelled";

export type PreServiceChecklist = {
  pinsCheck: boolean;
  soundboardIntegrity: boolean;
  keybedLevel: boolean;
  pedalMovement: boolean;
  benchStability: boolean;
};

export type FinalTestingChecklist = {
  pitchA440Check: boolean;
  keyRepetitionTest: boolean;
  voicingUniformity: boolean;
  pedalTrapworkTest: boolean;
  cabinetCleanUp: boolean;
};

export type JobOrder = {
  id: string;
  date: string;
  linkedQuotationNo: string;
  appointmentNo: string;
  linkedCaseId: string;
  customerName: string;
  location: string;
  pianoDetails: string;
  approvedScope: string;
  serviceDate: string;
  arrivalWindow: string;
  leadTechnician: string;
  associates: string;
  preServiceChecklist: PreServiceChecklist | string;
  status: JobOrderStatus;
  recordMode: RecordMode;
  createdDate: string;

  // Conditional Required (only if Additional Finding occurs)
  findingDescription?: string;
  customerDecision?: "Approved" | "Declined" | "Pending";
  findingWrittenApprovalRef?: string;

  // Optional but useful
  notApprovedPendingItems?: string;
  initialInspectionNotes?: string;
  initialInspectionFindings?: string;
  partsUsed?: string;
  photosCount?: number;
  finalTestingChecklist?: FinalTestingChecklist;
  cost?: number;
  serviceType?: string;
  caseId?: string;
};

export type ServiceReportStatus =
  | "Draft"
  | "Pending Signature"
  | "Signed by Customer"
  | "Sent to Customer";

export type ServiceReport = {
  id: string;
  jobOrderNo: string;
  quotationNo: string;
  serviceDate: string;
  customerName: string;
  location: string;
  pianoDetails: string;
  customerReportedConcern: string;
  initialInspectionFindings: string;
  approvedServiceScope: string;
  workActuallyPerformed: string;
  serviceResultsLimitations: string;
  leadTechnician: string;
  associates: string;
  customerAcknowledgment: string;
  status: ServiceReportStatus;
  recordMode: RecordMode;
  createdDate: string;
  signedByCustomer?: string;
  signatureDate?: string;

  // Optional but useful
  partsUsed?: string;
  recommendedNextServiceDate?: string;
  followUpRequired?: "Yes" | "No";
  photosCount?: number;
  notes?: string;
};

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Partially Paid"
  | "Paid in Full"
  | "Overdue"
  | "Void";

export type Invoice = {
  id: string;
  invoiceDate: string;
  serviceReportNo: string;
  jobOrderNo: string;
  quotationNo: string;
  caseId: string;
  customerName: string;
  billingAddress: string;
  serviceDescription: string;
  invoiceAmount: number;
  amountPaid: number;
  balance: number;
  paymentTerms: string;
  dueDate: string;
  status: InvoiceStatus;
  preparedBy: string;
  recordMode: RecordMode;
  createdDate: string;

  // Conditional Required (only if Invoice issued without Service Report)
  exceptionWithoutReport?: boolean;
  exceptionApprovedBy?: string;
  exceptionReason?: string;

  // Conditional Required (only if Voided)
  voidReason?: string;

  // Optional but useful
  discount?: number;
  paymentMethodExpected?: string;
  internalNotes?: string;
  pdfGenerated?: boolean;
  sentDate?: string;
  grandTotal?: number;
  linkedJobOrderNo?: string;
};

export type PaymentType = "Deposit" | "Partial" | "Progress" | "Full" | "Other";
export type PaymentMethod = "Cash" | "GCash" | "Bank Transfer" | "Check" | "Other";
export type PaymentStatus = "Pending Verification" | "Verified" | "Acknowledgment Generated" | "Refunded" | "Voided";

export type Payment = {
  id: string;
  paymentAckNo: string;
  invoiceNo: string;
  jobOrderNo: string;
  caseId: string;
  customerName: string;
  paymentDateTime: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  referenceNo: string;
  amountReceivedToday: number;
  invoiceTotal: number;
  previousTotalPaid: number;
  newTotalPaid: number;
  remainingBalance: number;
  status: PaymentStatus;
  receivedBy: string;
  verifiedBy: string;
  recordMode: RecordMode;
  createdDate: string;

  // Optional / Conditional
  customerConfirmation?: string;
  notes?: string;
  refundReason?: string;
  voidReason?: string;
};

export type ExpenseCategory = "Parts" | "Transport / Fuel" | "Tools" | "Utilities" | "Marketing" | "Job Overhead" | "Other";

export type Expense = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo: string;
  date: string;
  linkedJobOrderNo?: string;
  linkedCaseId?: string;
  receiptRefNo?: string;
  recordedBy: string;
  recordMode: RecordMode;
  notes?: string;
};

export type FollowUpType = "Routine Check-In" | "Next Service Reminder" | "Warranty Comeback" | "Other";
export type FollowUpStatus = "Pending" | "Completed" | "Rescheduled" | "Cancelled";

export type FollowUp = {
  id: string;
  caseId: string;
  customerName: string;
  pianoDetails: string;
  followUpType: FollowUpType;
  targetDate: string;
  assignedTo: string;
  status: FollowUpStatus;
  recordMode: RecordMode;
  createdDate: string;

  // Conditional Required (only if Follow-Up Type = Warranty Comeback)
  linkedOriginalJobOrderNo?: string;
  linkedOriginalServiceReportNo?: string;
  issueDescription?: string;
  coveredByWarranty?: "Yes" | "No";
  newChargesRequired?: "Yes" | "No";

  // Optional / Useful
  contactMethod?: "Call" | "Message";
  notes?: string;
  rescheduleReason?: string;
  outcomeSummary?: string;
};

export type RepairStage = "Intake & Inspection" | "Parts Ordering" | "In Repair" | "Testing & Tuning" | "Ready for Delivery" | "Delivered & Closed";

export type RepairRecord = {
  id: string;
  customerName: string;
  contactNumber: string;
  pianoModel: string;
  pianoSerialNo: string;
  issueDescription: string;
  intakeDate: string;
  estimatedCompletion: string;
  stage: RepairStage;
  nextAction: string;
  assignedTechnician: string;
  linkedCaseId?: string;
  linkedJobOrderNo?: string;
  repairCost?: number;
  downpaymentPaid?: number;
  paymentStatus?: "Unpaid" | "Downpayment Paid" | "Paid in Full";
  linkedExpenseIds?: string[];
  convertedToServiceReportId?: string;
  repairNotes?: string;
  recordMode: RecordMode;
  // Legacy compat
  status: RepairStage;
};

export type TradeInStatus = "Opportunity Added" | "In Appraisal" | "Valuation Offered" | "Buyer Registered" | "Closed Won" | "Closed Lost";

export type TradeInSale = {
  id: string;
  customerName: string;
  contactNumber: string;

  // Registered Buyer Details (Optional / Conditional)
  buyerName?: string;
  buyerContact?: string;

  // Traded-In Unit (Customer's Piano)
  offeredPianoBrandModel: string;
  offeredPianoSerialNo: string;
  offeredPianoCondition: string;
  appraisalValuation: number;

  // Target Unit Purchased (Store Inventory Unit)
  targetInventoryUnitId?: string;
  targetPianoBrandModel?: string;
  targetGrossPrice: number;
  netPayableBalance: number;

  // Linked Records & Roles
  linkedQuotationNo?: string;
  linkedInvoiceNo?: string;
  appraisedBy: string;
  approvedByOwner: string;
  status: TradeInStatus;
  recordMode: RecordMode;
  createdDate: string;
  notes?: string;
  closeLostReason?: string;
};

export type InventoryCategory = "Personal Inventory" | "Shop Inventory";

export type InventoryUnit = {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  condition: "Refurbished" | "Pre-Owned Excellent" | "Brand New" | "As Is";
  price: number;
  status: "In Stock" | "Reserved" | "Sold" | "Under Repair";
  inventoryCategory?: InventoryCategory;
  recordMode: RecordMode;
  notes?: string;
  photos?: string[];
  reservedBy?: string;
  reservedUntil?: string;
  soldDate?: string;
  soldTo?: string;
};

export type DocumentType = "Estimate" | "Quotation" | "Job Order" | "Service Report" | "Invoice" | "Payment Acknowledgment";
export type GeneratingModule = "Customer Desk" | "Service & Quotations" | "Office & Records";
export type DocumentStatus = "Generated" | "Sent" | "Archived";

export type RHPSDocument = {
  id: string;
  documentType: DocumentType;
  recordType: RecordMode;
  linkedSourceRecordNo: string;
  linkedCaseId: string;
  dateGenerated: string;
  generatedBy: string;
  generatingModule: GeneratingModule;
  documentOwnershipRole: string;
  status: DocumentStatus;

  // Optional / Useful
  pdfFileLink?: string;
  sentDate?: string;
  sentTo?: string;
  versionNo?: string;
  notes?: string;
};

// --- DEMO BUSINESS DATA ---
const demoCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "Atty. Fernando Alonso",
    contactNumber: "0917-555-0192",
    alternateContactNumber: "0920-111-2233",
    completeAddress: "142 Matina Aplaya, Davao City",
    customerType: "Repeat",
    linkedPianoIds: ["P-101", "P-102"],
    createdDate: "2026-01-15",
    lastUpdatedDate: "2026-08-01",
    email: "falonso@example.com",
    facebookName: "Fernando Alonso Law",
    cityArea: "Davao City Central / Matina",
    landmark: "Beside St. Jude Parish Church",
    notes: "VIP Repeat Client. Prefers morning appointments for Yamaha U3 tuning & action regulation.",
    pianos: [
      { id: "P-101", linkedCustomerId: "CUST-001", brand: "Yamaha", model: "U3 Upright", serialNumber: "YM-582910", pianoType: "Upright", currentLocation: "Home Studio", pianoStatus: "In Service", createdDate: "2026-01-15", lastUpdatedDate: "2026-08-01", conditionNotes: "Action regulation & pitch raise A440", lastTuningDate: "2026-02-01" },
      { id: "P-102", linkedCustomerId: "CUST-001", brand: "Kawai", model: "KG-2C Grand", serialNumber: "KW-119284", pianoType: "Grand", currentLocation: "Living Room", pianoStatus: "Owned by Customer", createdDate: "2026-01-15", lastUpdatedDate: "2026-08-01", conditionNotes: "Regular tuning every 6 months", lastTuningDate: "2026-01-20" },
    ],
  },
  {
    id: "CUST-002",
    name: "San Pedro Cathedral Academy",
    contactNumber: "082-224-8890",
    alternateContactNumber: "0919-444-5566",
    completeAddress: "San Pedro St, Bajada District, Davao City",
    customerType: "New",
    linkedPianoIds: ["P-103"],
    createdDate: "2026-02-10",
    lastUpdatedDate: "2026-08-02",
    email: "music@sanpedroacademy.edu.ph",
    facebookName: "San Pedro Cathedral Academy Official",
    cityArea: "Davao City Central",
    landmark: "Across San Pedro Cathedral Plaza",
    notes: "Institutional client. Requires official tax invoice and formal service report.",
    pianos: [
      { id: "P-103", linkedCustomerId: "CUST-002", brand: "Kawai", model: "K-300", serialNumber: "KW-994821", pianoType: "Upright", currentLocation: "Main Auditorium", pianoStatus: "For Repair", createdDate: "2026-02-10", lastUpdatedDate: "2026-08-02", conditionNotes: "Sticky keys in middle octave" },
    ],
  },
];

const demoLeads: Lead[] = [
  { id: "LEAD-001", createdDate: "2026-08-01", source: "Website", customerName: "Maria Santos", contactNumber: "0918-123-4567", locationCity: "Bajada, Davao City", gmapsLink: "https://maps.google.com/?q=7.0731,125.6128", inquiryType: "Tuning", pianoType: "Grand (Steinway Model M)", mainConcern: "Full tuning and pitch raise A440", preferredSchedule: "Mornings", status: "Converted to Estimate", nextAction: "Send formal Estimate", assignedOwner: "Robert Herrero", recordMode: "ACTUAL", email: "maria@example.com", budgetRange: "₱15,000 – ₱20,000", followUpDate: "2026-08-05" },
  { id: "LEAD-002", createdDate: "2026-08-03", source: "Referral", customerName: "Davao Concert Hall", contactNumber: "0920-987-6543", locationCity: "Davao City", gmapsLink: "https://maps.google.com/?q=7.0800,125.6100", inquiryType: "Assessment", pianoType: "Concert Grand", mainConcern: "Concert grand tuning & hammer voicing", preferredSchedule: "Weekends", status: "New Lead", nextAction: "Schedule On-Site Visit", assignedOwner: "Robert Herrero", recordMode: "ACTUAL", pianoBrand: "Steinway", accessParkingTravelNotes: "Security clearance required at front gate" },
  { id: "LEAD-003", createdDate: "2026-08-03", source: "Walk-In", customerName: "Dr. Gabriel Cruz", contactNumber: "0917-888-1234", locationCity: "Matina, Davao City", inquiryType: "Repair", pianoType: "Kawai Upright", mainConcern: "Sticky key regulation & pedal alignment", preferredSchedule: "Afternoons", status: "Qualified", nextAction: "Send Estimate", assignedOwner: "Robert Herrero", recordMode: "ACTUAL", facebookName: "Gabriel Cruz Music", existingCustomerId: "CUST-001", photosVideos: ["photo-reference-1.jpg"], notes: "Walk-in lead from existing customer referral." },
];

const demoEstimates: Estimate[] = [
  {
    id: "EST-2026-001",
    date: "2026-08-01",
    leadId: "LEAD-001",
    customerName: "Maria Santos",
    contactNumber: "0918-123-4567",
    serviceLocation: "124 Bajada Road, Davao City",
    pianoBrandTypeModelSerial: "Steinway Model M Grand S/N: ST-44912",
    mainConcern: "Pitch drop A438 & stiff keys",
    recommendedScope: "Pitch raise A440, tuning, damper felt replacement, keybed lubrication",
    estimatedAmount: 18500,
    estimatedAmountRange: "₱17,500 – ₱19,500",
    estimateBasis: "On-Site",
    validityDate: "2026-08-15",
    status: "Converted to Quotation",
    preparedBy: "Robert Herrero",
    landmarkAccessNotes: "2nd floor music room, elevator available",
    lastTuningServiceDate: "2024-05-10",
    photosVideoReviewed: "Yes",
    depositRequired: 5000,
    notes: "Preliminary estimate provided after on-site inspection of soundboard & key pins.",
    recordMode: "ACTUAL",
  },
  {
    id: "EST-2026-002",
    date: "2026-08-02",
    leadId: "LEAD-002",
    customerName: "Atty. Fernando Alonso",
    contactNumber: "0917-555-0192",
    serviceLocation: "142 Matina Aplaya, Davao City",
    pianoBrandTypeModelSerial: "Yamaha U3 Upright S/N: YM-582910",
    mainConcern: "Heavy action feel & key click",
    recommendedScope: "Action regulation, hammer voicing, center pin lubrication",
    estimatedAmount: 25000,
    estimatedAmountRange: "₱24,000 – ₱26,000",
    estimateBasis: "Remote",
    validityDate: "2026-08-20",
    status: "Approved",
    preparedBy: "Robert Herrero",
    landmarkAccessNotes: "Beside St. Jude Parish, ground floor home studio",
    lastTuningServiceDate: "2026-01-20",
    photosVideoReviewed: "Yes",
    depositRequired: 6000,
    notes: "Remote estimate based on client video demonstration & audio frequency test. Approved by client, ready for formal quotation.",
    recordMode: "ACTUAL",
  },
  {
    id: "EST-2026-003",
    date: "2026-08-03",
    leadId: "LEAD-003",
    customerName: "Dr. Gabriel Cruz",
    contactNumber: "0917-888-1234",
    serviceLocation: "78 Matina Heights, Davao City",
    pianoBrandTypeModelSerial: "Kawai K-15 Upright S/N: KW-88291",
    mainConcern: "Sticky key regulation & pedal alignment",
    recommendedScope: "Keybed levelling, whippen spring tension adjustment",
    estimatedAmount: 12000,
    estimatedAmountRange: "₱11,000 – ₱13,000",
    estimateBasis: "Remote",
    validityDate: "2026-08-17",
    status: "Sent to Customer",
    preparedBy: "Robert Herrero",
    landmarkAccessNotes: "Subdivision gate clearance required",
    photosVideoReviewed: "Yes",
    notes: "Sent estimate via SMS/Email. Awaiting customer review.",
    recordMode: "ACTUAL",
  },
];

const demoQuotations: Quotation[] = [
  {
    id: "QT-2026-001",
    date: "2026-08-02",
    estimateId: "EST-2026-001",
    revisionNo: "REV-01",
    customerName: "Maria Santos",
    contactNumber: "0918-123-4567",
    serviceLocation: "124 Bajada Road, Davao City",
    pianoBrandTypeModelSerial: "Steinway Model M Grand S/N: ST-44912",
    proposedScope: "Concert Pitch Tuning A440, Damper Felt Replacement, Keybed Lubrication & Action Regulation",
    approvedQuotedAmount: 18500,
    depositRequired: 5000,
    balanceTerms: "50% Downpayment upon Approval, 50% Balance upon Completion & Pitch Verification",
    validityDate: "2026-08-20",
    status: "Converted to Customer Case",
    preparedBy: "Robert Herrero",
    customerDecisionNotes: "Client approved binding scope after in-person soundboard inspection.",
    writtenApprovalRef: "Signed Quote #SQ-9912 / Email confirmation dated Aug 2",
    specialTermsConditions: "Includes 1-month pitch stabilization guarantee & complimentary humidity check.",
    recordMode: "ACTUAL",
  },
  {
    id: "QT-2026-002",
    date: "2026-08-03",
    estimateId: "EST-2026-002",
    revisionNo: "REV-01",
    customerName: "Atty. Fernando Alonso",
    contactNumber: "0917-555-0192",
    serviceLocation: "142 Matina Aplaya, Davao City",
    pianoBrandTypeModelSerial: "Yamaha U3 Upright S/N: YM-582910",
    proposedScope: "Full Action Regulation, Hammer Voicing & Center Pin Replacement",
    approvedQuotedAmount: 25000,
    depositRequired: 6000,
    balanceTerms: "50% Downpayment upon Approval, 50% Balance upon Delivery",
    validityDate: "2026-08-25",
    status: "Approved",
    preparedBy: "Robert Herrero",
    customerDecisionNotes: "Approved by Atty. Alonso via Viber call. Awaiting conversion to Customer Case.",
    writtenApprovalRef: "Viber chat acknowledgment dated Aug 3",
    specialTermsConditions: "Work scheduled during morning hours; includes 6-month tuning check-in reminder.",
    recordMode: "ACTUAL",
  },
  {
    id: "QT-2026-003",
    date: "2026-08-04",
    estimateId: "EST-2026-003",
    revisionNo: "REV-01",
    customerName: "Dr. Gabriel Cruz",
    contactNumber: "0917-888-1234",
    serviceLocation: "78 Matina Heights, Davao City",
    pianoBrandTypeModelSerial: "Kawai K-15 Upright S/N: KW-88291",
    proposedScope: "Keybed Levelling, Whippen Spring Adjustment & Pedal Alignment",
    approvedQuotedAmount: 12000,
    depositRequired: 3000,
    balanceTerms: "Full payment upon service completion",
    validityDate: "2026-08-22",
    status: "Sent for Approval",
    preparedBy: "Robert Herrero",
    specialTermsConditions: "Standard 30-day price validity.",
    recordMode: "ACTUAL",
  },
];

const demoCases: CustomerCase[] = [
  { id: "CASE-2026-001", dateConfirmed: "2026-08-02", confirmedBy: "Robert Herrero", linkedCustomerId: "CUST-001", linkedPianoIds: ["P-101"], linkedQuotationNo: "QT-2026-001", approvedScopeOfWork: "Complete Action Regulation & Tuning", approvedAmount: 18500, status: "Scheduled", createdDate: "2026-08-02", lastUpdatedDate: "2026-08-03", customerName: "Atty. Fernando Alonso", serviceType: "Action Regulation & Tuning", recordMode: "ACTUAL" },
];

const demoSchedules: ScheduleItem[] = [
  {
    id: "SCH-2026-01",
    caseId: "CASE-2026-001",
    customerName: "Atty. Fernando Alonso",
    serviceLocation: "142 Matina Aplaya, Davao City",
    pianoDetails: "Yamaha U3 Upright S/N: YM-582910",
    serviceDate: "2026-08-05",
    arrivalWindow: "09:00 AM - 11:00 AM",
    leadTechnician: "Robert Herrero",
    associates: "Jun (Tech Asst)",
    status: "Confirmed",
    accessParkingTravelNotes: "Beside St. Jude Parish; park at driveway; 1st floor home studio",
    notes: "Action regulation & pitch verification A440; bring Renner action springs.",
    recordMode: "ACTUAL",
  },
  {
    id: "SCH-2026-02",
    caseId: "CASE-2026-002",
    customerName: "Maria Santos",
    serviceLocation: "124 Bajada Road, Davao City",
    pianoDetails: "Steinway Model M Grand S/N: ST-44912",
    serviceDate: "2026-08-07",
    arrivalWindow: "01:00 PM - 03:00 PM",
    leadTechnician: "Robert Herrero",
    associates: "Jun (Tech Asst)",
    status: "Pending Confirmation",
    accessParkingTravelNotes: "2nd floor music room, service elevator available",
    notes: "Awaiting customer confirmation for Friday afternoon window.",
    recordMode: "ACTUAL",
  },
  {
    id: "SCH-2026-03",
    caseId: "CASE-2026-003",
    customerName: "Dr. Gabriel Cruz",
    serviceLocation: "78 Matina Heights, Davao City",
    pianoDetails: "Kawai K-15 Upright S/N: KW-88291",
    serviceDate: "2026-08-10",
    arrivalWindow: "10:00 AM - 12:00 PM",
    leadTechnician: "Robert Herrero",
    associates: "Jun (Tech Asst)",
    status: "Rescheduled",
    rescheduledFromDate: "2026-08-04",
    accessParkingTravelNotes: "Subdivision security code required at gate",
    notes: "Rescheduled per customer request due to medical conference.",
    recordMode: "ACTUAL",
  },
];

const demoJobOrders: JobOrder[] = [
  {
    id: "JO-2026-001",
    date: "2026-08-03",
    linkedQuotationNo: "QT-2026-001",
    appointmentNo: "SCH-2026-01",
    linkedCaseId: "CASE-2026-001",
    customerName: "Atty. Fernando Alonso (0917-555-0192)",
    location: "142 Matina Aplaya, Davao City (Beside St. Jude Parish)",
    pianoDetails: "Yamaha U3 Upright S/N: YM-582910",
    approvedScope: "Full Action Regulation, Hammer Voicing & Concert Pitch Tuning A440",
    serviceDate: "2026-08-05",
    arrivalWindow: "09:00 AM - 11:00 AM",
    leadTechnician: "Robert Herrero",
    associates: "Jun (Tech Asst)",
    preServiceChecklist: {
      pinsCheck: true,
      soundboardIntegrity: true,
      keybedLevel: true,
      pedalMovement: true,
      benchStability: true,
    },
    status: "In Progress",
    createdDate: "2026-08-03",
    initialInspectionFindings: "Pitch flat by 18 cents; slight key friction in middle octave.",
    partsUsed: "1 Set Renner Action Felts, 6 Action Springs, Center Pin Wire #20",
    photosCount: 4,
    recordMode: "ACTUAL",
  },
  {
    id: "JO-2026-002",
    date: "2026-08-04",
    linkedQuotationNo: "QT-2026-002",
    appointmentNo: "SCH-2026-02",
    linkedCaseId: "CASE-2026-002",
    customerName: "Maria Santos (0918-123-4567)",
    location: "124 Bajada Road, Davao City",
    pianoDetails: "Steinway Model M Grand S/N: ST-44912",
    approvedScope: "Damper Felt Replacement & Keybed Levelling",
    serviceDate: "2026-08-07",
    arrivalWindow: "01:00 PM - 03:00 PM",
    leadTechnician: "Robert Herrero",
    associates: "Jun (Tech Asst)",
    preServiceChecklist: {
      pinsCheck: true,
      soundboardIntegrity: true,
      keybedLevel: false,
      pedalMovement: true,
      benchStability: true,
    },
    status: "Additional Finding Pending",
    createdDate: "2026-08-04",
    findingDescription: "Cracked bass bridge pin & 2 broken whippen springs requiring replacement.",
    customerDecision: "Pending",
    findingWrittenApprovalRef: "Viber photo sent to client #VB-9921",
    notApprovedPendingItems: "Bass bridge pin re-pinning awaiting client approval",
    initialInspectionFindings: "Damper felts hardened; bass bridge pin loose.",
    partsUsed: "Steinway Damper Felts",
    photosCount: 6,
    recordMode: "ACTUAL",
  },
];

const demoServiceReports: ServiceReport[] = [
  {
    id: "SR-2026-001",
    jobOrderNo: "JO-2026-001",
    quotationNo: "QT-2026-001",
    serviceDate: "2026-08-05",
    customerName: "Atty. Fernando Alonso (0917-555-0192)",
    location: "142 Matina Aplaya, Davao City",
    pianoDetails: "Yamaha U3 Upright S/N: YM-582910",
    customerReportedConcern: "Keys felt sluggish & pitch was flat by 18 cents",
    initialInspectionFindings: "Pitch flat by 18 cents; friction in whippen center pins due to humidity expansion.",
    approvedServiceScope: "Full Action Regulation, Hammer Voicing & Concert Pitch Tuning A440",
    workActuallyPerformed: "Tuned 88 keys to concert pitch A440; lubricated center pins, regulated key height & let-off distance.",
    serviceResultsLimitations: "Pitch fully stabilized to A440; recommended installing Dampp-Chaser humidity control rod for long-term stability.",
    leadTechnician: "Robert Herrero",
    associates: "Jun (Tech Asst)",
    customerAcknowledgment: "Signed by Atty. Fernando Alonso on 2026-08-05",
    status: "Signed by Customer",
    partsUsed: "1 Set Renner Action Felts, Center Pin Wire #20",
    recommendedNextServiceDate: "2027-02-05",
    followUpRequired: "Yes",
    photosCount: 4,
    notes: "Client signed digitally via tablet on-site. Requested 6-month SMS reminder.",
    recordMode: "ACTUAL",
    createdDate: "2026-08-05",
    signedByCustomer: "Atty. Fernando Alonso",
    signatureDate: "2026-08-05",
  },
  {
    id: "SR-2026-002",
    jobOrderNo: "JO-2026-002",
    quotationNo: "QT-2026-002",
    serviceDate: "2026-08-07",
    customerName: "Maria Santos (0918-123-4567)",
    location: "124 Bajada Road, Davao City",
    pianoDetails: "Steinway Model M Grand S/N: ST-44912",
    customerReportedConcern: "Buzzing sound on bass notes & uneven key response",
    initialInspectionFindings: "Damper felts hardened & cracked bass bridge pin causing resonance buzz.",
    approvedServiceScope: "Damper Felt Replacement & Keybed Levelling",
    workActuallyPerformed: "Replaced 68 damper felts, level-set keybed, lubricated balance pins.",
    serviceResultsLimitations: "Damper buzzing resolved; bass bridge pin repair pending client approval.",
    leadTechnician: "Robert Herrero",
    associates: "Jun (Tech Asst)",
    customerAcknowledgment: "Pending digital signature on delivery",
    status: "Pending Signature",
    partsUsed: "Steinway Damper Felts",
    recommendedNextServiceDate: "2027-02-07",
    followUpRequired: "Yes",
    photosCount: 6,
    notes: "Report generated; awaiting customer signature.",
    recordMode: "ACTUAL",
    createdDate: "2026-08-07",
  },
];

const demoInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    invoiceDate: "2026-08-05",
    serviceReportNo: "SR-2026-001",
    jobOrderNo: "JO-2026-001",
    quotationNo: "QT-2026-001",
    caseId: "CASE-2026-001",
    customerName: "Atty. Fernando Alonso (0917-555-0192)",
    billingAddress: "142 Matina Aplaya, Davao City",
    serviceDescription: "Full Action Regulation, Hammer Voicing & Concert Pitch Tuning A440",
    invoiceAmount: 18500,
    amountPaid: 18500,
    balance: 0,
    paymentTerms: "Net 7",
    dueDate: "2026-08-12",
    status: "Paid in Full",
    preparedBy: "Robert Herrero",
    paymentMethodExpected: "GCash",
    pdfGenerated: true,
    sentDate: "2026-08-05",
    recordMode: "ACTUAL",
    createdDate: "2026-08-05",
  },
  {
    id: "INV-2026-002",
    invoiceDate: "2026-08-01",
    serviceReportNo: "SR-2026-002",
    jobOrderNo: "JO-2026-002",
    quotationNo: "QT-2026-002",
    caseId: "CASE-2026-002",
    customerName: "Maria Santos (0918-123-4567)",
    billingAddress: "124 Bajada Road, Davao City",
    serviceDescription: "Damper Felt Replacement & Keybed Levelling",
    invoiceAmount: 22000,
    amountPaid: 10000,
    balance: 12000,
    paymentTerms: "Net 7",
    dueDate: "2026-08-03", // Past due date with balance -> OVERDUE
    status: "Overdue",
    preparedBy: "Robert Herrero",
    paymentMethodExpected: "Bank Transfer",
    pdfGenerated: true,
    sentDate: "2026-08-01",
    recordMode: "ACTUAL",
    createdDate: "2026-08-01",
  },
  {
    id: "INV-2026-003",
    invoiceDate: "2026-08-04",
    serviceReportNo: "N/A (Owner Exception Allowed)",
    jobOrderNo: "JO-2026-003",
    quotationNo: "QT-2026-003",
    caseId: "CASE-2026-003",
    customerName: "Marco Valdes (0919-888-7766)",
    billingAddress: "45 Ecoland Drive, Davao City",
    serviceDescription: "Advance Deposit & Action Overhaul Materials",
    invoiceAmount: 15000,
    amountPaid: 0,
    balance: 15000,
    paymentTerms: "Due on Receipt",
    dueDate: "2026-08-11",
    status: "Sent",
    preparedBy: "Robert Herrero",
    exceptionWithoutReport: true,
    exceptionApprovedBy: "Robert Herrero (Owner)",
    exceptionReason: "Client requested advance invoice prior to final service report sign-off",
    paymentMethodExpected: "Cash",
    pdfGenerated: true,
    sentDate: "2026-08-04",
    recordMode: "ACTUAL",
    createdDate: "2026-08-04",
  },
];

const demoPayments: Payment[] = [
  {
    id: "PAY-2026-001",
    paymentAckNo: "ACK-2026-001",
    invoiceNo: "INV-2026-001",
    jobOrderNo: "JO-2026-001",
    caseId: "CASE-2026-001",
    customerName: "Atty. Fernando Alonso",
    paymentDateTime: "2026-08-05 14:30",
    paymentType: "Full",
    paymentMethod: "GCash",
    referenceNo: "GC-994810294",
    amountReceivedToday: 18500,
    invoiceTotal: 18500,
    previousTotalPaid: 0,
    newTotalPaid: 18500,
    remainingBalance: 0,
    status: "Acknowledgment Generated",
    receivedBy: "Jun (Tech Asst)",
    verifiedBy: "Robert Herrero (Owner)",
    customerConfirmation: "GCash App Receipt Screenshot verified by Owner",
    notes: "Full payment received for concert pitch regulation & tuning",
    recordMode: "ACTUAL",
    createdDate: "2026-08-05",
  },
  {
    id: "PAY-2026-002",
    paymentAckNo: "ACK-2026-002",
    invoiceNo: "INV-2026-002",
    jobOrderNo: "JO-2026-002",
    caseId: "CASE-2026-002",
    customerName: "Maria Santos",
    paymentDateTime: "2026-08-01 11:15",
    paymentType: "Deposit",
    paymentMethod: "Bank Transfer",
    referenceNo: "BDO-88319201",
    amountReceivedToday: 10000,
    invoiceTotal: 22000,
    previousTotalPaid: 0,
    newTotalPaid: 10000,
    remainingBalance: 12000,
    status: "Verified",
    receivedBy: "Staff Member",
    verifiedBy: "Robert Herrero (Owner)",
    customerConfirmation: "Bank Deposit Slip Copy #BDO-88319201",
    notes: "Initial deposit received for Steinway damper felt work",
    recordMode: "ACTUAL",
    createdDate: "2026-08-01",
  },
];

const demoExpenses: Expense[] = [
  {
    id: "EXP-2026-001",
    category: "Parts",
    description: "Steinway Renner Hammer Felts & Damper Cloth Set",
    amount: 12400,
    paidTo: "PianoParts Asia Supply Co.",
    date: "2026-08-01",
    linkedJobOrderNo: "JO-2026-002",
    linkedCaseId: "CASE-2026-002",
    receiptRefNo: "OR-882910",
    recordedBy: "Robert Herrero",
    recordMode: "ACTUAL",
    notes: "Imported genuine felt set for Steinway Model M restoration",
  },
  {
    id: "EXP-2026-002",
    category: "Transport / Fuel",
    description: "Service Van Fuel & Tolls for On-Site Tuning Trip",
    amount: 2500,
    paidTo: "Shell Station Matina / Tollways",
    date: "2026-08-02",
    linkedJobOrderNo: "JO-2026-001",
    linkedCaseId: "CASE-2026-001",
    receiptRefNo: "POS-991823",
    recordedBy: "Robert Herrero",
    recordMode: "ACTUAL",
    notes: "Round trip service van transport for Yamaha U3 tuning",
  },
  {
    id: "EXP-2026-003",
    category: "Tools",
    description: "Jahn German Tuning Hammer Tip Replacement",
    amount: 4800,
    paidTo: "Jahn Hardware Imports",
    date: "2026-08-03",
    receiptRefNo: "INV-55102",
    recordedBy: "Robert Herrero",
    recordMode: "ACTUAL",
    notes: "Shop tool replacement for precision regulation work",
  },
];

const demoFollowUps: FollowUp[] = [
  {
    id: "FOL-2026-001",
    caseId: "CASE-2026-001",
    customerName: "Atty. Fernando Alonso",
    pianoDetails: "Yamaha U3 Upright S/N: YM-582910",
    followUpType: "Next Service Reminder",
    targetDate: "2026-08-05",
    assignedTo: "Robert Herrero",
    status: "Pending",
    contactMethod: "Call",
    notes: "6-month post-regulation tuning check-in due!",
    recordMode: "ACTUAL",
    createdDate: "2026-08-05",
  },
  {
    id: "FOL-2026-002",
    caseId: "CASE-2026-002",
    customerName: "Maria Santos",
    pianoDetails: "Steinway Model M Grand S/N: ST-44912",
    followUpType: "Warranty Comeback",
    targetDate: "2026-08-06",
    assignedTo: "Robert Herrero",
    status: "Pending",
    linkedOriginalJobOrderNo: "JO-2026-002",
    linkedOriginalServiceReportNo: "SR-2026-002",
    issueDescription: "Damper felts buzz slight resonance on C#4 key after extended playing",
    coveredByWarranty: "Yes",
    newChargesRequired: "No",
    contactMethod: "Message",
    notes: "Client reported minor resonance buzz; covered under 1-year service warranty.",
    recordMode: "ACTUAL",
    createdDate: "2026-08-05",
  },
];

const demoDocuments: RHPSDocument[] = [
  {
    id: "DOC-2026-001",
    documentType: "Estimate",
    recordType: "ACTUAL",
    linkedSourceRecordNo: "EST-2026-001",
    linkedCaseId: "CASE-2026-001",
    dateGenerated: "2026-08-01",
    generatedBy: "Robert Herrero",
    generatingModule: "Customer Desk",
    documentOwnershipRole: "Lead Technician / Owner",
    status: "Sent",
    pdfFileLink: "file:///rhps/docs/EST-2026-001.pdf",
    sentDate: "2026-08-01",
    sentTo: "0917-555-0192 (SMS/Viber)",
    versionNo: "v1.0",
    notes: "Initial diagnostic estimate sent to Atty. Alonso",
  },
  {
    id: "DOC-2026-002",
    documentType: "Quotation",
    recordType: "ACTUAL",
    linkedSourceRecordNo: "QT-2026-001",
    linkedCaseId: "CASE-2026-001",
    dateGenerated: "2026-08-02",
    generatedBy: "Robert Herrero",
    generatingModule: "Service & Quotations",
    documentOwnershipRole: "Lead Technician / Owner",
    status: "Sent",
    pdfFileLink: "file:///rhps/docs/QT-2026-001.pdf",
    sentDate: "2026-08-02",
    sentTo: "0917-555-0192 (Email PDF)",
    versionNo: "v1.0",
    notes: "Formal quotation for full regulation A440",
  },
  {
    id: "DOC-2026-003",
    documentType: "Job Order",
    recordType: "ACTUAL",
    linkedSourceRecordNo: "JO-2026-001",
    linkedCaseId: "CASE-2026-001",
    dateGenerated: "2026-08-05",
    generatedBy: "Robert Herrero",
    generatingModule: "Service & Quotations",
    documentOwnershipRole: "Lead Technician / Owner",
    status: "Generated",
    versionNo: "v1.0",
    notes: "Technical job order issued for lead tech",
  },
  {
    id: "DOC-2026-004",
    documentType: "Service Report",
    recordType: "ACTUAL",
    linkedSourceRecordNo: "SR-2026-001",
    linkedCaseId: "CASE-2026-001",
    dateGenerated: "2026-08-05",
    generatedBy: "Robert Herrero",
    generatingModule: "Office & Records",
    documentOwnershipRole: "Lead Technician / Owner",
    status: "Sent",
    sentDate: "2026-08-05",
    sentTo: "Atty. Alonso (Signed)",
    versionNo: "v1.0",
    notes: "Signed service report for concert tuning",
  },
  {
    id: "DOC-2026-005",
    documentType: "Invoice",
    recordType: "TEST",
    linkedSourceRecordNo: "INV-2026-TEST",
    linkedCaseId: "CASE-2026-TEST",
    dateGenerated: "2026-08-05",
    generatedBy: "System Sandbox",
    generatingModule: "Office & Records",
    documentOwnershipRole: "Testing System",
    status: "Generated",
    versionNo: "TEST-v1",
    notes: "⚠️ TEST RECORD ONLY — Excluded from actual income & financial totals!",
  },
];

const demoRepairs: RepairRecord[] = [
  {
    id: "REP-2026-001",
    customerName: "San Pedro Cathedral Academy",
    contactNumber: "082-228-5101",
    pianoModel: "Kawai K-300 Upright",
    pianoSerialNo: "KW-581920",
    issueDescription: "Keybed regulation & damper felt replacement. Several notes not dampening properly.",
    intakeDate: "2026-08-01",
    estimatedCompletion: "2026-08-10",
    stage: "In Repair",
    status: "In Repair",
    nextAction: "Complete damper felt gluing, final regulation pass",
    assignedTechnician: "Robert Herrero (Owner)",
    linkedCaseId: "CASE-2026-003",
    repairCost: 18500,
    repairNotes: "Keybed leveling done. Damper rail replacement in progress.",
    recordMode: "ACTUAL",
  },
  {
    id: "REP-2026-002",
    customerName: "Maria Santos",
    contactNumber: "0917-882-9201",
    pianoModel: "Yamaha U1 Upright",
    pianoSerialNo: "YM-293810",
    issueDescription: "String breakage on 3 bass strings. Soundboard crack inspection needed.",
    intakeDate: "2026-08-03",
    estimatedCompletion: "2026-08-15",
    stage: "Parts Ordering",
    status: "Parts Ordering",
    nextAction: "Wait for Kawai bass string delivery from supplier",
    assignedTechnician: "Robert Herrero (Owner)",
    repairCost: 12000,
    repairNotes: "Parts ordered from piano supplier. ETA 5-7 days.",
    recordMode: "ACTUAL",
  },
  {
    id: "REP-2026-003",
    customerName: "Grand Ballroom Hotel Davao",
    contactNumber: "0920-112-9382",
    pianoModel: "Steinway Model B Grand",
    pianoSerialNo: "ST-881204",
    issueDescription: "Full action regulation, voicing, and pitch raise for concert season.",
    intakeDate: "2026-07-28",
    estimatedCompletion: "2026-08-08",
    stage: "Testing & Tuning",
    status: "Testing & Tuning",
    nextAction: "Final A440 pitch verification and customer sign-off call",
    assignedTechnician: "Robert Herrero (Owner)",
    linkedCaseId: "CASE-2026-004",
    repairCost: 45000,
    repairNotes: "Voicing and regulation completed. Final tuning pass in progress.",
    recordMode: "ACTUAL",
  },
];

const demoTradeIns: TradeInSale[] = [
  {
    id: "TRD-2026-001",
    customerName: "Dr. Gabriel Cruz",
    contactNumber: "0918-992-1823",
    buyerName: "Dr. Gabriel Cruz",
    buyerContact: "0918-992-1823",
    offeredPianoBrandModel: "Kawai K-15 Upright",
    offeredPianoSerialNo: "KW-391820",
    offeredPianoCondition: "Pre-owned good condition; minor cabinet scratches, action pins tight",
    appraisalValuation: 45000,
    targetInventoryUnitId: "RHPS-INV-001",
    targetPianoBrandModel: "Yamaha U1 Professional Upright (Refurbished)",
    targetGrossPrice: 165000,
    netPayableBalance: 120000,
    linkedQuotationNo: "QT-2026-003",
    linkedInvoiceNo: "INV-2026-003",
    appraisedBy: "Robert Herrero (Owner)",
    approvedByOwner: "Robert Herrero (Owner Sign-Off)",
    status: "Closed Won",
    recordMode: "ACTUAL",
    createdDate: "2026-08-03",
    notes: "Deal Closed Won! Trade-in credit applied towards Yamaha U1 purchase.",
  },
  {
    id: "TRD-2026-002",
    customerName: "Elena Rostova",
    contactNumber: "0920-334-9182",
    buyerName: "Elena Rostova",
    buyerContact: "0920-334-9182",
    offeredPianoBrandModel: "Samick Upright JS-115",
    offeredPianoSerialNo: "SM-102948",
    offeredPianoCondition: "Fair; requires hammer shaping & pitch raise",
    appraisalValuation: 32000,
    targetInventoryUnitId: "RHPS-INV-002",
    targetPianoBrandModel: "Kawai KG-2 Grand Piano 5'10\"",
    targetGrossPrice: 285000,
    netPayableBalance: 253000,
    appraisedBy: "Robert Herrero",
    approvedByOwner: "Robert Herrero (Owner Sign-Off)",
    status: "Buyer Registered",
    recordMode: "ACTUAL",
    createdDate: "2026-08-04",
    notes: "Buyer registered for Kawai KG-2 upgrade. Awaiting final payment confirmation.",
  },
  {
    id: "TRD-2026-003",
    customerName: "Benjamin Tan",
    contactNumber: "0917-883-9102",
    offeredPianoBrandModel: "Yamaha M1 Upright",
    offeredPianoSerialNo: "YM-110293",
    offeredPianoCondition: "Soundboard hairline crack, requires bridge repair",
    appraisalValuation: 25000,
    targetGrossPrice: 150000,
    netPayableBalance: 125000,
    appraisedBy: "Robert Herrero",
    approvedByOwner: "Pending Owner Review",
    status: "Closed Lost",
    closeLostReason: "Client selected another private seller for lower price",
    recordMode: "ACTUAL",
    createdDate: "2026-08-01",
    notes: "Closed Lost — Client rejected appraisal valuation of ₱25,000.",
  },
];

const demoInventory: InventoryUnit[] = [
  {
    id: "RHPS-INV-001",
    brand: "Yamaha",
    model: "U1 Professional Upright",
    serialNumber: "YM-491028",
    condition: "Refurbished",
    price: 165000,
    status: "In Stock",
    inventoryCategory: "Shop Inventory",
    recordMode: "ACTUAL",
  },
  {
    id: "RHPS-INV-002",
    brand: "Kawai",
    model: "KG-2 Grand Piano 5'10\"",
    serialNumber: "KW-382910",
    condition: "Pre-Owned Excellent",
    price: 285000,
    status: "In Stock",
    inventoryCategory: "Shop Inventory",
    recordMode: "ACTUAL",
  },
  {
    id: "RHPS-INV-003",
    brand: "Steinway & Sons",
    model: "Model K-52 Crown Oak Upright",
    serialNumber: "ST-592810",
    condition: "Pre-Owned Excellent",
    price: 380000,
    status: "In Stock",
    inventoryCategory: "Personal Inventory",
    recordMode: "ACTUAL",
    notes: "Owner's personal collection upright piano, pristine crown oak finish.",
  },
  {
    id: "RHPS-INV-004",
    brand: "Yamaha",
    model: "C3 Conservatory Grand 6'1\"",
    serialNumber: "YM-610293",
    condition: "Refurbished",
    price: 495000,
    status: "In Stock",
    inventoryCategory: "Personal Inventory",
    recordMode: "ACTUAL",
    notes: "Personal residence studio grand piano unit.",
  },
];

export type BackupType = "Manual" | "Scheduled Auto";
export type BackupScope = "Full System" | "Actual Records Only";
export type BackupStatus = "Completed" | "Failed" | "In Progress";
export type TestRestoreResult = "Pass" | "Fail";

export type BackupRecord = {
  id: string;
  dateTimeCreated: string;
  backupType: BackupType;
  backupScope: BackupScope;
  fileSize: string;
  storageLocation: string;
  triggeredBy: string;
  status: BackupStatus;
  restoreDateTime?: string;
  restoredBy?: string;
  restoreConfirmation?: boolean;
  reasonForRestore?: string;
  preRestoreSnapshotRef?: string;
  lastTestRestoreDate?: string;
  testRestoreResult?: TestRestoreResult;
  retentionPeriodDate?: string;
  notes?: string;
};

const demoBackups: BackupRecord[] = [
  {
    id: "BAK-2026-003",
    dateTimeCreated: "2026-08-04 08:00 AM",
    backupType: "Manual",
    backupScope: "Full System",
    fileSize: "4.8 MB",
    storageLocation: "RHPS Cloud Vault / Davao Primary Storage",
    triggeredBy: "Robert Herrero (Owner)",
    status: "Completed",
    lastTestRestoreDate: "2026-08-04 08:05 AM",
    testRestoreResult: "Pass",
    retentionPeriodDate: "2027-08-04",
    notes: "Pre-operational full system backup. All customer records, invoices, and job orders secured.",
  },
  {
    id: "BAK-2026-002",
    dateTimeCreated: "2026-08-03 06:00 PM",
    backupType: "Scheduled Auto",
    backupScope: "Actual Records Only",
    fileSize: "3.2 MB",
    storageLocation: "RHPS Secure Vault Storage",
    triggeredBy: "Scheduled Auto Daemon",
    status: "Completed",
    lastTestRestoreDate: "2026-08-03 06:10 PM",
    testRestoreResult: "Pass",
    retentionPeriodDate: "2026-11-03",
    notes: "Automated daily end-of-day actual records backup.",
  },
  {
    id: "BAK-2026-001",
    dateTimeCreated: "2026-08-02 06:00 PM",
    backupType: "Scheduled Auto",
    backupScope: "Actual Records Only",
    fileSize: "0.4 MB",
    storageLocation: "RHPS Secure Vault Storage",
    triggeredBy: "Scheduled Auto Daemon",
    status: "Failed",
    retentionPeriodDate: "2026-08-10",
    notes: "⚠️ Backup process interrupted: Davao local server storage sync timeout. Retried successfully in BAK-2026-002.",
  },
];

// --- RHPS AI MARKDOWN & TABLE RENDERER ---
function renderRhpsAiMarkdown(content: string, isDark: boolean = false) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return <strong key={idx} style={{ fontWeight: 700, color: isDark ? "#ffffff" : "#0f172a" }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return <em key={idx} style={{ fontStyle: "italic", color: isDark ? "#cbd5e1" : "#475569" }}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return <code key={idx} style={{ background: isDark ? "rgba(255,255,255,0.12)" : "#f1f5f9", color: isDark ? "#38bdf8" : "#0f172a", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 12 }}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection (line starts with |)
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
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
          <div key={`table-${i}`} className="ai-table-container" style={{ margin: "10px 0", overflowX: "auto" }}>
            <table
              className="ai-markdown-table"
              style={
                isDark
                  ? {
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12.5px",
                      color: "#f8fafc",
                      background: "#0f172a",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                    }
                  : undefined
              }
            >
              <thead>
                <tr style={isDark ? { background: "#1e293b" } : undefined}>
                  {headerCells.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      style={
                        isDark
                          ? {
                              background: "#1e293b",
                              color: "#38bdf8",
                              fontWeight: 800,
                              padding: "10px 14px",
                              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                              textAlign: "left",
                            }
                          : undefined
                      }
                    >
                      {formatInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={
                      isDark
                        ? { background: rIdx % 2 === 0 ? "#0f172a" : "#182238" }
                        : undefined
                    }
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        style={
                          isDark
                            ? {
                                padding: "10px 14px",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                                color: "#e2e8f0",
                              }
                            : undefined
                        }
                      >
                        {formatInline(cell)}
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
      blocks.push(
        <h3 key={`h3-${i}`} style={{ fontSize: 15, fontWeight: 800, color: isDark ? "#38bdf8" : "#0f172a", margin: "14px 0 8px" }}>
          {formatInline(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} style={{ fontSize: 17, fontWeight: 800, color: isDark ? "#38bdf8" : "#0f172a", margin: "16px 0 10px", borderBottom: isDark ? "1px solid rgba(56, 189, 248, 0.3)" : "2px solid #e2e8f0", paddingBottom: 6 }}>
          {formatInline(trimmed.replace(/^##\s+/, ""))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${i}`} style={{ fontSize: 19, fontWeight: 900, color: isDark ? "#38bdf8" : "#0f172a", margin: "18px 0 12px", borderBottom: isDark ? "1px solid rgba(56, 189, 248, 0.4)" : "2px solid #cbd5e1", paddingBottom: 8 }}>
          {formatInline(trimmed.replace(/^#\s+/, ""))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote key={`bq-${i}`} style={{ borderLeft: "4px solid #38bdf8", paddingLeft: 14, margin: "10px 0", color: isDark ? "#e2e8f0" : "#475569", fontStyle: "italic", background: isDark ? "rgba(15, 23, 42, 0.6)" : "#ffffff", padding: "10px 14px", borderRadius: "0 8px 8px 0", border: isDark ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid #e2e8f0", borderLeftWidth: 4, borderLeftColor: isDark ? "#38bdf8" : "#0f172a" }}>
          {formatInline(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
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
        <ul key={`ul-${i}`} style={{ paddingLeft: 20, margin: "8px 0 12px", listStyleType: "disc", color: isDark ? "#38bdf8" : "inherit" }}>
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} style={{ marginBottom: 4, color: isDark ? "#f1f5f9" : "#334155", lineHeight: 1.65 }}>
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: 20, margin: "8px 0 12px", color: isDark ? "#38bdf8" : "inherit" }}>
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} style={{ marginBottom: 4, color: isDark ? "#f1f5f9" : "#334155", lineHeight: 1.65 }}>
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph
    if (trimmed.length > 0) {
      blocks.push(
        <p key={`p-${i}`} style={{ margin: "0 0 8px", lineHeight: 1.75, color: isDark ? "#e2e8f0" : "#334155" }}>
          {formatInline(trimmed)}
        </p>
      );
    }
    i++;
  }

  return blocks;
}

// --- MAIN WORKSPACE COMPONENT ---
export default function RhpsWorkspace({
  activeUser = "Robert Herrero",
  onLockWorkspace,
  openAiTrigger = 0,
}: {
  activeUser?: string;
  onLockWorkspace?: () => void;
  openAiTrigger?: number;
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAiBubbleModalOpen, setIsAiBubbleModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (openAiTrigger && openAiTrigger > 0) {
      setIsAiBubbleModalOpen(true);
      showToast("🤖 RHPS Master AI Chatbot opened!");
    }
  }, [openAiTrigger]);

  const mainContentRef = useRef<HTMLElement | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<"Medium" | "Large" | "Extra Large">("Medium");

  // State arrays
  const [customers, setCustomers] = useState<Customer[]>(demoCustomers);
  const [leads, setLeads] = useState<Lead[]>(demoLeads);
  const [estimates, setEstimates] = useState<Estimate[]>(demoEstimates);
  const [quotations, setQuotations] = useState<Quotation[]>(demoQuotations);
  const [cases, setCases] = useState<CustomerCase[]>(demoCases);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(demoSchedules);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>(demoJobOrders);
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>(demoServiceReports);
  const [invoices, setInvoices] = useState<Invoice[]>(demoInvoices);
  const [payments, setPayments] = useState<Payment[]>(demoPayments);
  const [expenses, setExpenses] = useState<Expense[]>(demoExpenses);
  const [followUps, setFollowUps] = useState<FollowUp[]>(demoFollowUps);
  const [repairs, setRepairs] = useState<RepairRecord[]>(demoRepairs);
  const [tradeIns, setTradeIns] = useState<TradeInSale[]>(demoTradeIns);
  const [inventory, setInventory] = useState<InventoryUnit[]>(demoInventory);
  const [documents, setDocuments] = useState<RHPSDocument[]>(demoDocuments);
  const [backups, setBackups] = useState<BackupRecord[]>(demoBackups);

  // Backup System UI State
  const [showCreateBackupModal, setShowCreateBackupModal] = useState<boolean>(false);

  // --- REPAIRS MODULE STATE & HANDLERS ---
  const [repairSearch, setRepairSearch] = useState<string>("");
  const [repairStageFilter, setRepairStageFilter] = useState<"All" | RepairStage>("All");
  const [showRepairModal, setShowRepairModal] = useState<boolean>(false);
  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);
  const [selectedRepairDetail, setSelectedRepairDetail] = useState<RepairRecord | null>(null);
  const [showUpdateStageModal, setShowUpdateStageModal] = useState<boolean>(false);
  const [stageTargetRepair, setStageTargetRepair] = useState<RepairRecord | null>(null);
  const [newStageInput, setNewStageInput] = useState<RepairStage>("In Repair");
  const [nextActionInput, setNextActionInput] = useState<string>("");

  // Repair Form State
  const [repCustomerName, setRepCustomerName] = useState<string>("San Pedro Cathedral Academy");
  const [repContactNumber, setRepContactNumber] = useState<string>("082-228-5101");
  const [repPianoModel, setRepPianoModel] = useState<string>("Kawai K-300 Upright");
  const [repPianoSerialNo, setRepPianoSerialNo] = useState<string>("KW-581920");
  const [repIssueDescription, setRepIssueDescription] = useState<string>("");
  const [repIntakeDate, setRepIntakeDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [repEstimatedCompletion, setRepEstimatedCompletion] = useState<string>("");
  const [repStage, setRepStage] = useState<RepairStage>("Intake & Inspection");
  const [repNextAction, setRepNextAction] = useState<string>("");
  const [repAssignedTechnician, setRepAssignedTechnician] = useState<string>("Robert Herrero (Owner)");
  const [repLinkedCaseId, setRepLinkedCaseId] = useState<string>("");
  const [repLinkedJobOrderNo, setRepLinkedJobOrderNo] = useState<string>("");
  const [repRepairCost, setRepRepairCost] = useState<number>(0);
  const [repNotes, setRepNotes] = useState<string>("");

  const openCreateRepairModal = () => {
    setEditingRepair(null);
    setRepCustomerName("San Pedro Cathedral Academy");
    setRepContactNumber("082-228-5101");
    setRepPianoModel("Kawai K-300 Upright");
    setRepPianoSerialNo("KW-581920");
    setRepIssueDescription("");
    setRepIntakeDate(new Date().toISOString().split("T")[0]);
    setRepEstimatedCompletion("");
    setRepStage("Intake & Inspection");
    setRepNextAction("");
    setRepAssignedTechnician("Robert Herrero (Owner)");
    setRepLinkedCaseId("");
    setRepLinkedJobOrderNo("");
    setRepRepairCost(0);
    setRepNotes("");
    setShowRepairModal(true);
  };

  const openEditRepairModal = (r: RepairRecord) => {
    setEditingRepair(r);
    setRepCustomerName(r.customerName);
    setRepContactNumber(r.contactNumber);
    setRepPianoModel(r.pianoModel);
    setRepPianoSerialNo(r.pianoSerialNo);
    setRepIssueDescription(r.issueDescription);
    setRepIntakeDate(r.intakeDate);
    setRepEstimatedCompletion(r.estimatedCompletion);
    setRepStage(r.stage);
    setRepNextAction(r.nextAction);
    setRepAssignedTechnician(r.assignedTechnician);
    setRepLinkedCaseId(r.linkedCaseId || "");
    setRepLinkedJobOrderNo(r.linkedJobOrderNo || "");
    setRepRepairCost(r.repairCost || 0);
    setRepNotes(r.repairNotes || "");
    setShowRepairModal(true);
  };

  const handleSaveRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRepair) {
      setRepairs(
        repairs.map((item) =>
          item.id === editingRepair.id
            ? {
                ...item,
                customerName: repCustomerName,
                contactNumber: repContactNumber,
                pianoModel: repPianoModel,
                pianoSerialNo: repPianoSerialNo,
                issueDescription: repIssueDescription,
                intakeDate: repIntakeDate,
                estimatedCompletion: repEstimatedCompletion,
                stage: repStage,
                status: repStage,
                nextAction: repNextAction,
                assignedTechnician: repAssignedTechnician,
                linkedCaseId: repLinkedCaseId,
                linkedJobOrderNo: repLinkedJobOrderNo,
                repairCost: repRepairCost,
                repairNotes: repNotes,
              }
            : item
        )
      );
      showToast(`💾 Repair ${editingRepair.id} updated! Stage: ${repStage}`);
    } else {
      const newRepId = `REP-2026-${String(repairs.length + 1).padStart(3, "0")}`;
      const newRepair: RepairRecord = {
        id: newRepId,
        customerName: repCustomerName,
        contactNumber: repContactNumber,
        pianoModel: repPianoModel,
        pianoSerialNo: repPianoSerialNo,
        issueDescription: repIssueDescription,
        intakeDate: repIntakeDate,
        estimatedCompletion: repEstimatedCompletion,
        stage: repStage,
        status: repStage,
        nextAction: repNextAction,
        assignedTechnician: repAssignedTechnician,
        linkedCaseId: repLinkedCaseId || undefined,
        linkedJobOrderNo: repLinkedJobOrderNo || undefined,
        repairCost: repRepairCost,
        repairNotes: repNotes,
        recordMode: "ACTUAL",
      };
      setRepairs([newRepair, ...repairs]);
      showToast(`🔧 Repair ${newRepId} logged for ${repCustomerName}!`);
    }
    setShowRepairModal(false);
  };

  const handleOpenUpdateStage = (r: RepairRecord) => {
    setStageTargetRepair(r);
    setNewStageInput(r.stage);
    setNextActionInput(r.nextAction);
    setShowUpdateStageModal(true);
  };

  const handleSaveUpdateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageTargetRepair) return;
    setRepairs(
      repairs.map((item) =>
        item.id === stageTargetRepair.id
          ? { ...item, stage: newStageInput, status: newStageInput, nextAction: nextActionInput }
          : item
      )
    );
    showToast(`🔄 ${stageTargetRepair.id} stage updated to: ${newStageInput}`);
    setShowUpdateStageModal(false);
  };

  const handleConvertRepairToServiceReport = (r: RepairRecord) => {
    const newSrId = `SR-2026-${String(serviceReports.length + 1).padStart(3, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const newSR: ServiceReport = {
      id: newSrId,
      jobOrderNo: r.linkedJobOrderNo || "N/A",
      quotationNo: "N/A",
      serviceDate: todayStr,
      customerName: r.customerName,
      location: "Shop Repair / On-Site",
      pianoDetails: `${r.pianoModel} S/N: ${r.pianoSerialNo}`,
      customerReportedConcern: r.issueDescription,
      initialInspectionFindings: r.repairNotes || r.issueDescription,
      approvedServiceScope: r.issueDescription,
      workActuallyPerformed: r.repairNotes || "Work completed per approved scope.",
      serviceResultsLimitations: "Service completed. Minor wear-related items noted.",
      leadTechnician: r.assignedTechnician,
      associates: "Shop Team",
      customerAcknowledgment: "Pending customer signature",
      status: "Pending Signature",
      recordMode: "ACTUAL",
      createdDate: todayStr,
      recommendedNextServiceDate: "",
      followUpRequired: "No",
      notes: `Auto-converted from Shop Repair ${r.id}.`,
    };
    setServiceReports([newSR, ...serviceReports]);
    setRepairs(
      repairs.map((item) =>
        item.id === r.id
          ? { ...item, convertedToServiceReportId: newSrId, stage: "Delivered & Closed", status: "Delivered & Closed" }
          : item
      )
    );
    showToast(`📋 Service Report ${newSrId} generated from Repair ${r.id}! Repair marked Delivered & Closed.`);
  };

  // --- REPAIR DOWNPAYMENT / PAYMENT HANDLERS ---
  const [showRecordDownpaymentModal, setShowRecordDownpaymentModal] = useState<boolean>(false);
  const [downpaymentTargetRepair, setDownpaymentTargetRepair] = useState<RepairRecord | null>(null);
  const [downpaymentAmountInput, setDownpaymentAmountInput] = useState<number>(5000);
  const [downpaymentMethodInput, setDownpaymentMethodInput] = useState<PaymentMethod>("GCash");
  const [downpaymentRefNoInput, setDownpaymentRefNoInput] = useState<string>("GCASH-8819203");

  const handleOpenRecordDownpayment = (r: RepairRecord) => {
    setDownpaymentTargetRepair(r);
    const defaultDep = r.repairCost ? Math.round(r.repairCost * 0.5) : 5000;
    setDownpaymentAmountInput(defaultDep);
    setDownpaymentMethodInput("GCash");
    setDownpaymentRefNoInput(`GCASH-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowRecordDownpaymentModal(true);
  };

  const handleSaveDownpaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downpaymentTargetRepair) return;

    const currentPaid = downpaymentTargetRepair.downpaymentPaid || 0;
    const newPaidTotal = currentPaid + downpaymentAmountInput;
    const totalCost = downpaymentTargetRepair.repairCost || newPaidTotal;
    const newStatus: "Unpaid" | "Downpayment Paid" | "Paid in Full" =
      newPaidTotal >= totalCost ? "Paid in Full" : "Downpayment Paid";

    // Update Repair Record
    setRepairs(
      repairs.map((item) =>
        item.id === downpaymentTargetRepair.id
          ? {
              ...item,
              downpaymentPaid: newPaidTotal,
              paymentStatus: newStatus,
            }
          : item
      )
    );

    // Auto-create Payment Record
    const todayStr = new Date().toISOString().split("T")[0];
    const newPayId = `PAY-2026-${String(payments.length + 1).padStart(3, "0")}`;
    const newPayObj: Payment = {
      id: newPayId,
      paymentAckNo: `ACK-2026-${String(payments.length + 1).padStart(3, "0")}`,
      invoiceNo: "INV-REP-DIRECT",
      jobOrderNo: downpaymentTargetRepair.linkedJobOrderNo || `JO-REP-${downpaymentTargetRepair.id}`,
      caseId: downpaymentTargetRepair.linkedCaseId || `CASE-REP-${downpaymentTargetRepair.id}`,
      customerName: downpaymentTargetRepair.customerName,
      paymentDateTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      paymentType: newPaidTotal >= totalCost ? "Full" : "Deposit",
      paymentMethod: downpaymentMethodInput,
      referenceNo: downpaymentRefNoInput,
      amountReceivedToday: downpaymentAmountInput,
      invoiceTotal: totalCost,
      previousTotalPaid: currentPaid,
      newTotalPaid: newPaidTotal,
      remainingBalance: Math.max(0, totalCost - newPaidTotal),
      status: "Verified",
      receivedBy: "Robert Herrero (Owner)",
      verifiedBy: "Robert Herrero (Owner)",
      recordMode: "ACTUAL",
      createdDate: todayStr,
      notes: `Downpayment received for Shop Repair ${downpaymentTargetRepair.id} (${downpaymentTargetRepair.pianoModel})`,
    };
    setPayments([newPayObj, ...payments]);

    showToast(
      `💳 Downpayment of ₱${downpaymentAmountInput.toLocaleString()} logged for Repair ${downpaymentTargetRepair.id}! Payment record ${newPayId} generated.`
    );
    setShowRecordDownpaymentModal(false);
  };


  const [showRestoreModal, setShowRestoreModal] = useState<BackupRecord | null>(null);
  const [selectedBackupDetail, setSelectedBackupDetail] = useState<BackupRecord | null>(null);
  const [backupFilter, setBackupFilter] = useState<"All" | "Completed" | "Failed" | "Restored">("All");

  // Create Backup Form State
  const [newBackupType, setNewBackupType] = useState<BackupType>("Manual");
  const [newBackupScope, setNewBackupScope] = useState<BackupScope>("Full System");
  const [newStorageLocation, setNewStorageLocation] = useState<string>("RHPS Cloud Vault / Davao Storage");
  const [newBackupNotes, setNewBackupNotes] = useState<string>("");

  // Owner Restore Form State
  const [restoreReason, setRestoreReason] = useState<string>("");
  const [restoreConfirmed, setRestoreConfirmed] = useState<boolean>(false);

  // --- SETTINGS MODULE STATE ---
  const [businessName, setBusinessName] = useState<string>("R. Herrero Pianos & Services");
  const [businessAddress, setBusinessAddress] = useState<string>("Door 3, RHPS Building, J.P. Laurel Ave, Bajada, Davao City, 8000");
  const [tin, setTin] = useState<string>("482-910-384-0000");
  const [vatStatus, setVatStatus] = useState<"VAT Registered" | "Non-VAT Registered">("VAT Registered");
  const [ownerName, setOwnerName] = useState<string>("Robert Herrero");
  const [ownerContact, setOwnerContact] = useState<string>("+63 917 842 9102 / robert@rhpspianos.com");
  const [businessLogo, setBusinessLogo] = useState<string>("🎹 RHPS Official Seal");
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState<string>("50% Downpayment upon Approval, 50% Balance upon Completion & Pitch Verification");
  const [backupReminderFreq, setBackupReminderFreq] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [systemNotes, setSystemNotes] = useState<string>("RHPS Private Piano Operations System — Confidential Operations & Financial Vault");
  const [activeTheme, setActiveTheme] = useState<string>("Seasalt & Platinum (Default Eye-Care)");

  // Password Security Form State (Never displays active password)
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Document Numbering Config State per Document Type
  type DocNumberConfig = {
    docType: string;
    prefix: string;
    currentNumber: number;
    yearResetRule: "Yes" | "No";
  };

  const [docConfigs, setDocConfigs] = useState<DocNumberConfig[]>([
    { docType: "Estimate", prefix: "EST-", currentNumber: 104, yearResetRule: "Yes" },
    { docType: "Quotation", prefix: "Q-", currentNumber: 89, yearResetRule: "Yes" },
    { docType: "Job Order", prefix: "JO-", currentNumber: 201, yearResetRule: "Yes" },
    { docType: "Service Report", prefix: "SR-", currentNumber: 154, yearResetRule: "Yes" },
    { docType: "Invoice", prefix: "INV-", currentNumber: 98, yearResetRule: "Yes" },
    { docType: "Payment Acknowledgment", prefix: "PAY-", currentNumber: 72, yearResetRule: "Yes" },
  ]);

  // User Roles List State (Multi-user setups)
  type UserRoleItem = {
    id: string;
    name: string;
    role: "Owner" | "Staff" | "Technician";
    permittedActions: string;
  };

  const [userRoles, setUserRoles] = useState<UserRoleItem[]>([
    { id: "USR-01", name: "Robert Herrero", role: "Owner", permittedActions: "Full System Control, Restore, Pricing, VAT Config" },
    { id: "USR-02", name: "Ara Mae Marcillo", role: "Staff", permittedActions: "CV Sales Admin, Client Inquiries, Documentation" },
    { id: "USR-03", name: "Jun Technico", role: "Technician", permittedActions: "On-Site Tuning, Service Reports, Job Order Status" },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserRole, setNewUserRole] = useState<"Owner" | "Staff" | "Technician">("Staff");
  const [newUserActions, setNewUserActions] = useState<string>("");

  // --- CUSTOMER DIRECTORY STATE & HANDLERS ---
  const [customerFilter, setCustomerFilter] = useState<"All" | "New" | "Old">("All");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);
  // --- SEARCHABLE LINKED DROPDOWNS STATE ---
  const [qtEstimateSearch, setQtEstimateSearch] = useState<string>("");
  const [estLeadSearch, setEstLeadSearch] = useState<string>("");
  const [schCaseSearch, setSchCaseSearch] = useState<string>("");
  const [estConvertTarget, setEstConvertTarget] = useState<string>("none");
  const [qtConvertTarget, setQtConvertTarget] = useState<string>("none");

  // --- CRM LEADS MODULE STATE & HANDLERS ---
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadCreatedDate, setLeadCreatedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [leadSource, setLeadSource] = useState<Lead["source"]>("Website");
  const [leadCustomerName, setLeadCustomerName] = useState<string>("");
  const [leadContactNumber, setLeadContactNumber] = useState<string>("");
  const [leadLocationCity, setLeadLocationCity] = useState<string>("");
  const [leadInquiryType, setLeadInquiryType] = useState<Lead["inquiryType"]>("Tuning");
  const [leadPianoType, setLeadPianoType] = useState<string>("");
  const [leadMainConcern, setLeadMainConcern] = useState<string>("");
  const [leadPreferredSchedule, setLeadPreferredSchedule] = useState<string>("");
  const [leadStatus, setLeadStatus] = useState<Lead["status"]>("New Lead");
  const [leadNextAction, setLeadNextAction] = useState<string>("Callback");
  const [leadNextActionNote, setLeadNextActionNote] = useState<string>("");
  const [leadAssignedOwner, setLeadAssignedOwner] = useState<string>("Robert Herrero");
  const [leadFacebookName, setLeadFacebookName] = useState<string>("");
  const [leadEmail, setLeadEmail] = useState<string>("");
  const [leadExistingCustomerId, setLeadExistingCustomerId] = useState<string>("");
  const [leadPianoBrand, setLeadPianoBrand] = useState<string>("");
  const [leadBudgetRange, setLeadBudgetRange] = useState<string>("");
  const [leadAccessNotes, setLeadAccessNotes] = useState<string>("");
  const [leadNotes, setLeadNotes] = useState<string>("");
  const [leadFollowUpDate, setLeadFollowUpDate] = useState<string>("");
  const [leadGmapsLink, setLeadGmapsLink] = useState<string>("");
  const [leadMediaInput, setLeadMediaInput] = useState<string>("");
  const [leadMediaItems, setLeadMediaItems] = useState<string[]>([]);

  const openCreateLeadModal = () => {
    setEditingLead(null);
    setLeadCreatedDate(new Date().toISOString().split("T")[0]);
    setLeadSource("Website");
    setLeadCustomerName("");
    setLeadContactNumber("");
    setLeadLocationCity("");
    setLeadInquiryType("Tuning");
    setLeadPianoType("");
    setLeadMainConcern("");
    setLeadPreferredSchedule("");
    setLeadStatus("New Lead");
    setLeadNextAction("Callback");
    setLeadNextActionNote("");
    setLeadAssignedOwner("Robert Herrero");
    setLeadFacebookName("");
    setLeadEmail("");
    setLeadExistingCustomerId("");
    setLeadPianoBrand("");
    setLeadBudgetRange("");
    setLeadAccessNotes("");
    setLeadNotes("");
    setLeadFollowUpDate("");
    setLeadGmapsLink("");
    setLeadMediaInput("");
    setLeadMediaItems([]);
    setShowLeadModal(true);
  };

  const openEditLeadModal = (lead: Lead) => {
    setEditingLead(lead);
    setLeadCreatedDate(lead.createdDate);
    setLeadSource(lead.source);
    setLeadCustomerName(lead.customerName);
    setLeadContactNumber(lead.contactNumber);
    setLeadLocationCity(lead.locationCity);
    setLeadInquiryType(lead.inquiryType);
    setLeadPianoType(lead.pianoType);
    setLeadMainConcern(lead.mainConcern);
    setLeadPreferredSchedule(lead.preferredSchedule);
    setLeadStatus(lead.status);
    setLeadNextAction(lead.nextAction);
    setLeadNextActionNote(["Callback", "Schedule Visit", "Send Estimate"].includes(lead.nextAction) ? "" : lead.nextAction);
    setLeadAssignedOwner(lead.assignedOwner);
    setLeadFacebookName(lead.facebookName || "");
    setLeadEmail(lead.email || "");
    setLeadExistingCustomerId(lead.existingCustomerId || "");
    setLeadPianoBrand(lead.pianoBrand || "");
    setLeadBudgetRange(lead.budgetRange || "");
    setLeadAccessNotes(lead.accessParkingTravelNotes || "");
    setLeadNotes(lead.notes || "");
    setLeadFollowUpDate(lead.followUpDate || "");
    setLeadGmapsLink(lead.gmapsLink || "");
    setLeadMediaItems(lead.photosVideos || []);
    setLeadMediaInput("");
    setShowLeadModal(true);
  };

  const handleLeadMediaFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readTasks = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => reject(new Error("Failed to read media file."));
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readTasks)
      .then((encodedMedia) => {
        const validMedia = encodedMedia.filter((item) => item);
        if (validMedia.length > 0) {
          setLeadMediaItems((prev) => [...validMedia, ...prev]);
          showToast(`📎 ${validMedia.length} media item(s) uploaded.`);
        }
      })
      .catch(() => showToast("⚠️ Unable to read one or more selected media files."));

    e.target.value = "";
  };

  const handleAddLeadMediaItem = () => {
    const clean = leadMediaInput.trim();
    if (!clean) return;
    setLeadMediaItems((prev) => [clean, ...prev]);
    setLeadMediaInput("");
  };

  const handleRemoveLeadMediaItem = (item: string) => {
    setLeadMediaItems((prev) => prev.filter((entry) => entry !== item));
  };

  const handleSaveLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCustomerName.trim() || !leadContactNumber.trim() || !leadLocationCity.trim() || !leadPianoType.trim() || !leadMainConcern.trim() || !leadPreferredSchedule.trim() || !leadNextAction.trim() || !leadAssignedOwner.trim()) {
      showToast("⚠️ Please fill in all required lead fields.");
      return;
    }

    const activeLeadId = editingLead ? editingLead.id : `LEAD-${String(leads.length + 1).padStart(3, "0")}`;

    if (editingLead) {
      setLeads(
        leads.map((item) =>
          item.id === editingLead.id
            ? {
                ...item,
                createdDate: leadCreatedDate,
                source: leadSource,
                customerName: leadCustomerName.trim(),
                contactNumber: leadContactNumber.trim(),
                locationCity: leadLocationCity.trim(),
                inquiryType: leadInquiryType,
                pianoType: leadPianoType.trim(),
                mainConcern: leadMainConcern.trim(),
                preferredSchedule: leadPreferredSchedule.trim(),
                status: leadStatus,
                nextAction: leadNextAction.trim(),
                assignedOwner: leadAssignedOwner.trim(),
                facebookName: leadFacebookName.trim() || undefined,
                email: leadEmail.trim() || undefined,
                existingCustomerId: leadExistingCustomerId.trim() || undefined,
                pianoBrand: leadPianoBrand.trim() || undefined,
                photosVideos: leadMediaItems.length ? leadMediaItems : undefined,
                budgetRange: leadBudgetRange.trim() || undefined,
                accessParkingTravelNotes: leadAccessNotes.trim() || undefined,
                notes: leadNotes.trim() || undefined,
                followUpDate: leadFollowUpDate || undefined,
                gmapsLink: leadGmapsLink.trim() || undefined,
              }
            : item
        )
      );
    } else {
      const newLead: Lead = {
        id: activeLeadId,
        createdDate: leadCreatedDate,
        source: leadSource,
        customerName: leadCustomerName.trim(),
        contactNumber: leadContactNumber.trim(),
        locationCity: leadLocationCity.trim(),
        inquiryType: leadInquiryType,
        pianoType: leadPianoType.trim(),
        mainConcern: leadMainConcern.trim(),
        preferredSchedule: leadPreferredSchedule.trim(),
        status: leadStatus,
        nextAction: leadNextAction.trim(),
        assignedOwner: leadAssignedOwner.trim(),
        recordMode: "ACTUAL",
        facebookName: leadFacebookName.trim() || undefined,
        email: leadEmail.trim() || undefined,
        existingCustomerId: leadExistingCustomerId.trim() || undefined,
        pianoBrand: leadPianoBrand.trim() || undefined,
        photosVideos: leadMediaItems.length ? leadMediaItems : undefined,
        budgetRange: leadBudgetRange.trim() || undefined,
        accessParkingTravelNotes: leadAccessNotes.trim() || undefined,
        notes: leadNotes.trim() || undefined,
        followUpDate: leadFollowUpDate || undefined,
        gmapsLink: leadGmapsLink.trim() || undefined,
      };
      setLeads([newLead, ...leads]);
    }

    // Auto-create reminder in Follow-Ups if "Schedule Visit" or Follow-Up Date is set
    if (leadNextAction.toLowerCase().includes("schedule visit") || leadNextAction === "Schedule Visit" || leadFollowUpDate) {
      const newFuId = `FU-2026-${String(followUps.length + 1).padStart(3, "0")}`;
      const autoFollowUp: FollowUp = {
        id: newFuId,
        caseId: `CASE-${activeLeadId}`,
        customerName: leadCustomerName.trim(),
        pianoDetails: `${leadPianoBrand || ""} ${leadPianoType}`.trim() || "Piano",
        followUpType: "Next Service Reminder",
        targetDate: leadFollowUpDate || leadCreatedDate || new Date().toISOString().split("T")[0],
        assignedTo: leadAssignedOwner.trim() || "Robert Herrero",
        status: "Pending",
        recordMode: "ACTUAL",
        createdDate: new Date().toISOString().split("T")[0],
        notes: `[Auto-Reminder from Lead ${activeLeadId}] Action: ${leadNextAction.trim()}. Schedule pref: ${leadPreferredSchedule.trim()}`,
      };
      setFollowUps((prev) => [autoFollowUp, ...prev]);
      showToast(`✨ Lead ${activeLeadId} saved & Auto-Reminder ${newFuId} added to Follow-Ups!`);
    } else {
      showToast(editingLead ? `💾 Lead ${editingLead.id} updated.` : `✨ Lead ${activeLeadId} created.`);
    }

    setShowLeadModal(false);
  };

  // --- ESTIMATES MODULE STATE & HANDLERS ---
  const [estimateFilter, setEstimateFilter] = useState<"All" | "Draft" | "Sent to Customer" | "Approved" | "Declined" | "Revision Requested" | "Converted to Quotation">("All");
  const [estimateSearch, setEstimateSearch] = useState<string>("");
  const [showEstimateModal, setShowEstimateModal] = useState<boolean>(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [selectedEstimateDetail, setSelectedEstimateDetail] = useState<Estimate | null>(null);

  // Estimate Form State
  const [estLeadId, setEstLeadId] = useState<string>("");
  const [estCustomerName, setEstCustomerName] = useState<string>("");
  const [estContactNumber, setEstContactNumber] = useState<string>("");
  const [estServiceLocation, setEstServiceLocation] = useState<string>("");
  const [estPianoDetails, setEstPianoDetails] = useState<string>("");
  const [estMainConcern, setEstMainConcern] = useState<string>("");
  const [estRecommendedScope, setEstRecommendedScope] = useState<string>("");
  const [estEstimatedAmount, setEstEstimatedAmount] = useState<number>(15000);
  const [estAmountRange, setEstAmountRange] = useState<string>("₱14,000 – ₱16,000");
  const [estBasis, setEstBasis] = useState<"Remote" | "On-Site">("On-Site");
  const [estValidityDate, setEstValidityDate] = useState<string>("2026-08-18");
  const [estPreparedBy, setEstPreparedBy] = useState<string>("Robert Herrero");
  const [estLandmark, setEstLandmark] = useState<string>("");
  const [estLastTuningDate, setEstLastTuningDate] = useState<string>("");
  const [estPhotosReviewed, setEstPhotosReviewed] = useState<"Yes" | "No">("Yes");
  const [estDepositRequired, setEstDepositRequired] = useState<number>(3000);
  const [estNotes, setEstNotes] = useState<string>("");

  const openCreateEstimateModal = (linkedLead?: Lead) => {
    setEditingEstimate(null);
    if (linkedLead) {
      setEstLeadId(linkedLead.id);
      setEstCustomerName(linkedLead.customerName);
      setEstContactNumber(linkedLead.contactNumber);
      setEstServiceLocation(linkedLead.locationCity);
      setEstPianoDetails(linkedLead.pianoType);
      setEstMainConcern(linkedLead.mainConcern);
    } else {
      setEstLeadId(leads[0]?.id || "LEAD-001");
      setEstCustomerName("");
      setEstContactNumber("");
      setEstServiceLocation("");
      setEstPianoDetails("");
      setEstMainConcern("");
    }
    setEstRecommendedScope("Full Tuning, Action Regulation & Pitch Verification A440");
    setEstEstimatedAmount(15000);
    setEstAmountRange("₱14,000 – ₱16,000");
    setEstBasis("On-Site");
    setEstValidityDate("2026-08-18");
    setEstPreparedBy("Robert Herrero");
    setEstLandmark("");
    setEstLastTuningDate("");
    setEstPhotosReviewed("Yes");
    setEstDepositRequired(3000);
    setEstNotes("");
    setShowEstimateModal(true);
  };

  const openEditEstimateModal = (est: Estimate) => {
    setEditingEstimate(est);
    setEstLeadId(est.leadId);
    setEstCustomerName(est.customerName);
    setEstContactNumber(est.contactNumber);
    setEstServiceLocation(est.serviceLocation);
    setEstPianoDetails(est.pianoBrandTypeModelSerial);
    setEstMainConcern(est.mainConcern);
    setEstRecommendedScope(est.recommendedScope);
    setEstEstimatedAmount(est.estimatedAmount);
    setEstAmountRange(est.estimatedAmountRange || `₱${est.estimatedAmount.toLocaleString()}`);
    setEstBasis(est.estimateBasis);
    setEstValidityDate(est.validityDate);
    setEstPreparedBy(est.preparedBy);
    setEstLandmark(est.landmarkAccessNotes || "");
    setEstLastTuningDate(est.lastTuningServiceDate || "");
    setEstPhotosReviewed(est.photosVideoReviewed || "Yes");
    setEstDepositRequired(est.depositRequired || 0);
    setEstNotes(est.notes || "");
    setShowEstimateModal(true);
  };

  const handleSaveEstimateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEstimate) {
      setEstimates(
        estimates.map((item) =>
          item.id === editingEstimate.id
            ? {
              ...item,
              leadId: estLeadId,
              customerName: estCustomerName,
              contactNumber: estContactNumber,
              serviceLocation: estServiceLocation,
              pianoBrandTypeModelSerial: estPianoDetails,
              mainConcern: estMainConcern,
              recommendedScope: estRecommendedScope,
              estimatedAmount: Number(estEstimatedAmount),
              estimatedAmountRange: estAmountRange,
              estimateBasis: estBasis,
              validityDate: estValidityDate,
              preparedBy: estPreparedBy,
              landmarkAccessNotes: estLandmark,
              lastTuningServiceDate: estLastTuningDate,
              photosVideoReviewed: estPhotosReviewed,
              depositRequired: Number(estDepositRequired),
              notes: estNotes,
            }
            : item
        )
      );
      showToast(`💾 Estimate ${editingEstimate.id} updated successfully!`);
    } else {
      const newEstId = `EST-2026-${String(estimates.length + 1).padStart(3, "0")}`;
      const newEstObj: Estimate = {
        id: newEstId,
        date: new Date().toISOString().split("T")[0],
        leadId: estLeadId,
        customerName: estCustomerName,
        contactNumber: estContactNumber,
        serviceLocation: estServiceLocation,
        pianoBrandTypeModelSerial: estPianoDetails,
        mainConcern: estMainConcern,
        recommendedScope: estRecommendedScope,
        estimatedAmount: Number(estEstimatedAmount),
        estimatedAmountRange: estAmountRange,
        estimateBasis: estBasis,
        validityDate: estValidityDate,
        status: "Draft",
        preparedBy: estPreparedBy,
        landmarkAccessNotes: estLandmark,
        lastTuningServiceDate: estLastTuningDate,
        photosVideoReviewed: estPhotosReviewed,
        depositRequired: Number(estDepositRequired),
        notes: estNotes,
        recordMode: "ACTUAL",
      };
      setEstimates([newEstObj, ...estimates]);
      showToast(`✨ New Estimate ${newEstId} created successfully!`);
      if (estConvertTarget === "QUOTATION") handleConvertToQuotation(newEstObj);
      if (estConvertTarget === "JOB ORDER") handleConvertEstimateDirectToJobOrder(newEstObj);
    }
    setShowEstimateModal(false);
  };

  const handleConvertToQuotation = (est: Estimate) => {
    const newQtNo = `QT-2026-${String(quotations.length + 1).padStart(3, "0")}`;
    const newQuotationObj: Quotation = {
      id: newQtNo,
      date: new Date().toISOString().split("T")[0],
      estimateId: est.id,
      revisionNo: "REV-01",
      customerName: est.customerName,
      contactNumber: est.contactNumber,
      serviceLocation: est.serviceLocation,
      pianoBrandTypeModelSerial: est.pianoBrandTypeModelSerial,
      proposedScope: est.recommendedScope,
      approvedQuotedAmount: est.estimatedAmount,
      depositRequired: est.depositRequired || 5000,
      balanceTerms: defaultPaymentTerms,
      validityDate: est.validityDate,
      status: "Draft",
      preparedBy: activeUser,
      recordMode: "ACTUAL",
    };
    setQuotations([newQuotationObj, ...quotations]);
    setEstimates(estimates.map((e) => e.id === est.id ? { ...e, status: "Converted to Quotation" } : e));
    showToast(`🎉 Approved Estimate ${est.id} converted to formal Quotation ${newQtNo}!`);
  };

  const handleConvertEstimateDirectToJobOrder = (est: Estimate) => {
    const newJoNo = `JO-2026-${String(jobOrders.length + 1).padStart(3, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newJoObj: JobOrder = {
      id: newJoNo,
      date: todayStr,
      linkedQuotationNo: `QT-${est.id}`,
      appointmentNo: `SCH-${est.id}`,
      linkedCaseId: `CASE-${est.leadId || est.id}`,
      customerName: `${est.customerName} (${est.contactNumber})`,
      location: est.serviceLocation,
      pianoDetails: est.pianoBrandTypeModelSerial,
      approvedScope: est.recommendedScope,
      serviceDate: todayStr,
      arrivalWindow: "09:00 AM - 11:00 AM",
      leadTechnician: est.preparedBy || "Robert Herrero",
      associates: "Jun (Tech Asst)",
      preServiceChecklist: {
        pinsCheck: true,
        soundboardIntegrity: true,
        keybedLevel: true,
        pedalMovement: true,
        benchStability: true,
      },
      finalTestingChecklist: {
        pitchA440Check: true,
        keyRepetitionTest: true,
        voicingUniformity: true,
        pedalTrapworkTest: true,
        cabinetCleanUp: true,
      },
      status: "In Progress",
      recordMode: "ACTUAL",
      createdDate: todayStr,
    };

    setJobOrders([newJoObj, ...jobOrders]);
    setEstimates(estimates.map((e) => (e.id === est.id ? { ...e, status: "Approved" } : e)));
    showToast(`⚡ Late-Encoding Shortcut: Estimate ${est.id} converted DIRECTLY to Job Order ${newJoNo}!`);
  };

  const handleConvertEstimateDirectToSchedule = (est: Estimate) => {
    openCreateScheduleModal();
    setSchCustomerName(est.customerName);
    setSchServiceLocation(est.serviceLocation);
    setSchPianoDetails(est.pianoBrandTypeModelSerial);
    showToast(`⚡ Late-Encoding Shortcut: Populated Schedule form for ${est.customerName}!`);
  };

  const handleConvertQuotationDirectToJobOrder = (qt: Quotation) => {
    const newJoNo = `JO-2026-${String(jobOrders.length + 1).padStart(3, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newJoObj: JobOrder = {
      id: newJoNo,
      date: todayStr,
      linkedQuotationNo: qt.id,
      appointmentNo: `SCH-${qt.id}`,
      linkedCaseId: `CASE-${qt.estimateId || qt.id}`,
      customerName: `${qt.customerName} (${qt.contactNumber})`,
      location: qt.serviceLocation,
      pianoDetails: qt.pianoBrandTypeModelSerial,
      approvedScope: qt.proposedScope,
      serviceDate: todayStr,
      arrivalWindow: "09:00 AM - 11:00 AM",
      leadTechnician: qt.preparedBy || "Robert Herrero",
      associates: "Jun (Tech Asst)",
      preServiceChecklist: {
        pinsCheck: true,
        soundboardIntegrity: true,
        keybedLevel: true,
        pedalMovement: true,
        benchStability: true,
      },
      finalTestingChecklist: {
        pitchA440Check: true,
        keyRepetitionTest: true,
        voicingUniformity: true,
        pedalTrapworkTest: true,
        cabinetCleanUp: true,
      },
      status: "In Progress",
      recordMode: "ACTUAL",
      createdDate: todayStr,
    };

    setJobOrders([newJoObj, ...jobOrders]);
    setQuotations(quotations.map((q) => (q.id === qt.id ? { ...q, status: "Approved" } : q)));
    showToast(`⚡ Late-Encoding Shortcut: Quotation ${qt.id} converted DIRECTLY to Job Order ${newJoNo}!`);
  };

  // --- QUOTATIONS MODULE STATE & HANDLERS ---
  const [quotationFilter, setQuotationFilter] = useState<"All" | "Draft" | "Sent for Approval" | "Approved" | "Declined" | "Revision Needed" | "Converted to Customer Case">("All");
  const [quotationSearch, setQuotationSearch] = useState<string>("");
  const [showQuotationModal, setShowQuotationModal] = useState<boolean>(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedQuotationDetail, setSelectedQuotationDetail] = useState<Quotation | null>(null);

  // Quotation Form State
  const [qtEstimateId, setQtEstimateId] = useState<string>("");
  const [qtRevisionNo, setQtRevisionNo] = useState<string>("REV-01");
  const [qtCustomerName, setQtCustomerName] = useState<string>("");
  const [qtContactNumber, setQtContactNumber] = useState<string>("");
  const [qtServiceLocation, setQtServiceLocation] = useState<string>("");
  const [qtPianoDetails, setQtPianoDetails] = useState<string>("");
  const [qtProposedScope, setQtProposedScope] = useState<string>("");
  const [qtApprovedAmount, setQtApprovedAmount] = useState<number>(18500);
  const [qtDepositRequired, setQtDepositRequired] = useState<number>(5000);
  const [qtBalanceTerms, setQtBalanceTerms] = useState<string>(defaultPaymentTerms);
  const [qtValidityDate, setQtValidityDate] = useState<string>("2026-08-25");
  const [qtPreparedBy, setQtPreparedBy] = useState<string>("Robert Herrero");
  const [qtDecisionNotes, setQtDecisionNotes] = useState<string>("");
  const [qtWrittenApprovalRef, setQtWrittenApprovalRef] = useState<string>("");
  const [qtSpecialTerms, setQtSpecialTerms] = useState<string>("Includes 1-month pitch stabilization guarantee.");

  const openCreateQuotationModal = (linkedEstimate?: Estimate) => {
    setEditingQuotation(null);
    if (linkedEstimate) {
      setQtEstimateId(linkedEstimate.id);
      setQtCustomerName(linkedEstimate.customerName);
      setQtContactNumber(linkedEstimate.contactNumber);
      setQtServiceLocation(linkedEstimate.serviceLocation);
      setQtPianoDetails(linkedEstimate.pianoBrandTypeModelSerial);
      setQtProposedScope(linkedEstimate.recommendedScope);
      setQtApprovedAmount(linkedEstimate.estimatedAmount);
      setQtDepositRequired(linkedEstimate.depositRequired || 5000);
      setQtValidityDate(linkedEstimate.validityDate);
    } else {
      setQtEstimateId(estimates[0]?.id || "EST-2026-001");
      setQtCustomerName("");
      setQtContactNumber("");
      setQtServiceLocation("");
      setQtPianoDetails("");
      setQtProposedScope("");
      setQtApprovedAmount(18500);
      setQtDepositRequired(5000);
      setQtValidityDate("2026-08-25");
    }
    setQtRevisionNo("REV-01");
    setQtBalanceTerms(defaultPaymentTerms);
    setQtPreparedBy("Robert Herrero");
    setQtDecisionNotes("");
    setQtWrittenApprovalRef("");
    setQtSpecialTerms("Includes 1-month pitch stabilization guarantee.");
    setShowQuotationModal(true);
  };

  const openEditQuotationModal = (qt: Quotation) => {
    setEditingQuotation(qt);
    setQtEstimateId(qt.estimateId);
    setQtRevisionNo(qt.revisionNo);
    setQtCustomerName(qt.customerName);
    setQtContactNumber(qt.contactNumber);
    setQtServiceLocation(qt.serviceLocation);
    setQtPianoDetails(qt.pianoBrandTypeModelSerial);
    setQtProposedScope(qt.proposedScope);
    setQtApprovedAmount(qt.approvedQuotedAmount);
    setQtDepositRequired(qt.depositRequired);
    setQtBalanceTerms(qt.balanceTerms);
    setQtValidityDate(qt.validityDate);
    setQtPreparedBy(qt.preparedBy);
    setQtDecisionNotes(qt.customerDecisionNotes || "");
    setQtWrittenApprovalRef(qt.writtenApprovalRef || "");
    setQtSpecialTerms(qt.specialTermsConditions || "");
    setShowQuotationModal(true);
  };

  const handleSaveQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuotation) {
      setQuotations(
        quotations.map((item) =>
          item.id === editingQuotation.id
            ? {
              ...item,
              estimateId: qtEstimateId,
              revisionNo: qtRevisionNo,
              customerName: qtCustomerName,
              contactNumber: qtContactNumber,
              serviceLocation: qtServiceLocation,
              pianoBrandTypeModelSerial: qtPianoDetails,
              proposedScope: qtProposedScope,
              approvedQuotedAmount: Number(qtApprovedAmount),
              depositRequired: Number(qtDepositRequired),
              balanceTerms: qtBalanceTerms,
              validityDate: qtValidityDate,
              preparedBy: qtPreparedBy,
              customerDecisionNotes: qtDecisionNotes,
              writtenApprovalRef: qtWrittenApprovalRef,
              specialTermsConditions: qtSpecialTerms,
            }
            : item
        )
      );
      showToast(`💾 Quotation ${editingQuotation.id} updated successfully!`);
    } else {
      const newQtId = `QT-2026-${String(quotations.length + 1).padStart(3, "0")}`;
      const newQtObj: Quotation = {
        id: newQtId,
        date: new Date().toISOString().split("T")[0],
        estimateId: qtEstimateId,
        revisionNo: qtRevisionNo,
        customerName: qtCustomerName,
        contactNumber: qtContactNumber,
        serviceLocation: qtServiceLocation,
        pianoBrandTypeModelSerial: qtPianoDetails,
        proposedScope: qtProposedScope,
        approvedQuotedAmount: Number(qtApprovedAmount),
        depositRequired: Number(qtDepositRequired),
        balanceTerms: qtBalanceTerms,
        validityDate: qtValidityDate,
        status: "Draft",
        preparedBy: qtPreparedBy,
        customerDecisionNotes: qtDecisionNotes,
        writtenApprovalRef: qtWrittenApprovalRef,
        specialTermsConditions: qtSpecialTerms,
        recordMode: "ACTUAL",
      };
      setQuotations([newQtObj, ...quotations]);
      showToast(`✨ Formal Quotation ${newQtId} created successfully!`);
    }
    setShowQuotationModal(false);
  };

  // KEY WORKFLOW RULE: Approved Quotation → Convert to Customer Case → Schedule
  const handleConvertToCustomerCase = (qt: Quotation) => {
    const newCaseId = `CASE-2026-${String(cases.length + 1).padStart(3, "0")}`;
    const newCaseObj: CustomerCase = {
      id: newCaseId,
      dateConfirmed: new Date().toISOString().split("T")[0],
      confirmedBy: activeUser,
      linkedCustomerId: customers.find((c) => c.name.toLowerCase() === qt.customerName.toLowerCase())?.id || "CUST-001",
      linkedPianoIds: ["P-101"],
      linkedQuotationNo: qt.id,
      approvedScopeOfWork: qt.proposedScope,
      approvedAmount: qt.approvedQuotedAmount,
      status: "Waiting for Schedule",
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdatedDate: new Date().toISOString().split("T")[0],
      customerName: qt.customerName,
      serviceType: qt.proposedScope,
      recordMode: "ACTUAL",
    };
    setCases([newCaseObj, ...cases]);
    setQuotations(quotations.map((q) => (q.id === qt.id ? { ...q, status: "Converted to Customer Case" } : q)));
    showToast(`🎉 Approved Quotation ${qt.id} converted to Customer Case ${newCaseId} (Status: Waiting for Schedule)!`);
  };

  const handleReviseQuotation = (qt: Quotation) => {
    const currentRev = parseInt(qt.revisionNo.replace("REV-", ""), 10) || 1;
    const nextRev = `REV-${String(currentRev + 1).padStart(2, "0")}`;
    setQuotations(
      quotations.map((q) =>
        q.id === qt.id ? { ...q, revisionNo: nextRev, status: "Revision Needed" } : q
      )
    );
    showToast(`🔄 Quotation ${qt.id} updated to ${nextRev} (Status: Revision Needed)!`);
  };

  // --- SCHEDULE & APPOINTMENT MODULE STATE & HANDLERS ---
  const [scheduleFilter, setScheduleFilter] = useState<"All" | "Pending Confirmation" | "Confirmed" | "Rescheduled" | "Cancelled" | "Converted to Job Order">("All");
  const [scheduleSearch, setScheduleSearch] = useState<string>("");
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<ScheduleItem | null>(null);

  // Schedule Form State
  const [schCaseId, setSchCaseId] = useState<string>("");
  const [schCustomerName, setSchCustomerName] = useState<string>("");
  const [schServiceLocation, setSchServiceLocation] = useState<string>("");
  const [schPianoDetails, setSchPianoDetails] = useState<string>("");
  const [schServiceDate, setSchServiceDate] = useState<string>("2026-08-08");
  const [schArrivalWindow, setSchArrivalWindow] = useState<string>("09:00 AM - 11:00 AM");
  const [schLeadTech, setSchLeadTech] = useState<string>("Robert Herrero");
  const [schAssociates, setSchAssociates] = useState<string>("Jun (Tech Asst)");
  const [schAccessNotes, setSchAccessNotes] = useState<string>("");
  const [schRescheduledFrom, setSchRescheduledFrom] = useState<string>("");
  const [schCancellationReason, setSchCancellationReason] = useState<string>("");
  const [schNotes, setSchNotes] = useState<string>("");

  const openCreateScheduleModal = (linkedCase?: CustomerCase) => {
    setEditingSchedule(null);
    if (linkedCase) {
      setSchCaseId(linkedCase.id);
      setSchCustomerName(linkedCase.customerName);
      setSchServiceLocation("Davao City Central");
      setSchPianoDetails("Yamaha Piano");
    } else {
      setSchCaseId(cases[0]?.id || "CASE-2026-001");
      setSchCustomerName(cases[0]?.customerName || "Maria Santos");
      setSchServiceLocation("Bajada, Davao City");
      setSchPianoDetails("Steinway Model M Grand");
    }
    setSchServiceDate("2026-08-08");
    setSchArrivalWindow("09:00 AM - 11:00 AM");
    setSchLeadTech("Robert Herrero");
    setSchAssociates("Jun (Tech Asst)");
    setSchAccessNotes("Ground floor piano room; driveway parking available");
    setSchRescheduledFrom("");
    setSchCancellationReason("");
    setSchNotes("");
    setShowScheduleModal(true);
  };

  const openEditScheduleModal = (sch: ScheduleItem) => {
    setEditingSchedule(sch);
    setSchCaseId(sch.caseId);
    setSchCustomerName(sch.customerName);
    setSchServiceLocation(sch.serviceLocation);
    setSchPianoDetails(sch.pianoDetails);
    setSchServiceDate(sch.serviceDate);
    setSchArrivalWindow(sch.arrivalWindow);
    setSchLeadTech(sch.leadTechnician);
    setSchAssociates(sch.associates);
    setSchAccessNotes(sch.accessParkingTravelNotes || "");
    setSchRescheduledFrom(sch.rescheduledFromDate || "");
    setSchCancellationReason(sch.cancellationReason || "");
    setSchNotes(sch.notes || "");
    setShowScheduleModal(true);
  };

  const handleSaveScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      setSchedules(
        schedules.map((item) =>
          item.id === editingSchedule.id
            ? {
              ...item,
              caseId: schCaseId,
              customerName: schCustomerName,
              serviceLocation: schServiceLocation,
              pianoDetails: schPianoDetails,
              serviceDate: schServiceDate,
              arrivalWindow: schArrivalWindow,
              leadTechnician: schLeadTech,
              associates: schAssociates,
              accessParkingTravelNotes: schAccessNotes,
              rescheduledFromDate: schRescheduledFrom,
              cancellationReason: schCancellationReason,
              notes: schNotes,
            }
            : item
        )
      );
      showToast(`💾 Appointment ${editingSchedule.id} updated successfully!`);
    } else {
      const newSchId = `SCH-2026-${String(schedules.length + 1).padStart(2, "0")}`;
      const newSchObj: ScheduleItem = {
        id: newSchId,
        caseId: schCaseId,
        customerName: schCustomerName,
        serviceLocation: schServiceLocation,
        pianoDetails: schPianoDetails,
        serviceDate: schServiceDate,
        arrivalWindow: schArrivalWindow,
        leadTechnician: schLeadTech,
        associates: schAssociates,
        status: "Pending Confirmation",
        accessParkingTravelNotes: schAccessNotes,
        rescheduledFromDate: schRescheduledFrom,
        cancellationReason: schCancellationReason,
        notes: schNotes,
        recordMode: "ACTUAL",
      };
      setSchedules([newSchObj, ...schedules]);
      setCases(cases.map((c) => c.id === schCaseId ? { ...c, status: "Scheduled" } : c));
      showToast(`✨ Appointment ${newSchId} scheduled successfully!`);
    }
    setShowScheduleModal(false);
  };

  const handleConvertToJobOrder = (sch: ScheduleItem) => {
    const newJoNo = `JO-2026-${String(jobOrders.length + 1).padStart(3, "0")}`;
    const targetCase = cases.find((c) => c.id === sch.caseId);
    const newJobOrderObj: JobOrder = {
      id: newJoNo,
      date: new Date().toISOString().split("T")[0],
      linkedQuotationNo: targetCase?.linkedQuotationNo || "QT-2026-001",
      appointmentNo: sch.id,
      linkedCaseId: sch.caseId,
      customerName: sch.customerName,
      location: sch.serviceLocation,
      pianoDetails: sch.pianoDetails,
      approvedScope: targetCase?.approvedScopeOfWork || "Full Action Regulation & Tuning A440",
      serviceDate: sch.serviceDate,
      arrivalWindow: sch.arrivalWindow,
      leadTechnician: sch.leadTechnician,
      associates: sch.associates,
      preServiceChecklist: "Pins & soundboard checked; keybed level verified",
      status: "In Progress",
      recordMode: "ACTUAL",
      createdDate: new Date().toISOString().split("T")[0],
    };
    setJobOrders([newJobOrderObj, ...jobOrders]);
    setSchedules(schedules.map((s) => (s.id === sch.id ? { ...s, status: "Converted to Job Order" } : s)));
    setCases(cases.map((c) => (c.id === sch.caseId ? { ...c, status: "In Service" } : c)));
    showToast(`🎉 Appointment ${sch.id} converted to Job Order ${newJoNo} (Status: In Progress)!`);
  };

  const handleRescheduleAction = (sch: ScheduleItem) => {
    const newDate = prompt(`Reschedule Appointment ${sch.id}.\nEnter New Service Date (YYYY-MM-DD):`, sch.serviceDate);
    if (!newDate) return;
    const reason = prompt("Enter Reason for Rescheduling:", "Customer requested schedule change") || "Schedule adjustment";
    setSchedules(
      schedules.map((s) =>
        s.id === sch.id
          ? {
            ...s,
            rescheduledFromDate: sch.serviceDate,
            serviceDate: newDate,
            status: "Rescheduled",
            notes: `${s.notes || ""} | Rescheduled on ${new Date().toISOString().split("T")[0]}: ${reason}`,
          }
          : s
      )
    );
    showToast(`🔄 Appointment ${sch.id} rescheduled to ${newDate}!`);
  };

  const handleCancelScheduleAction = (sch: ScheduleItem) => {
    const reason = prompt(`Cancel Appointment ${sch.id}.\nEnter Cancellation Reason:`, "Customer postponed indefinitely") || "Cancelled by client";
    setSchedules(
      schedules.map((s) =>
        s.id === sch.id ? { ...s, status: "Cancelled", cancellationReason: reason } : s
      )
    );
    showToast(`❌ Appointment ${sch.id} marked as Cancelled.`);
  };

  // --- JOB ORDERS MODULE STATE & HANDLERS ---
  const [jobOrderFilter, setJobOrderFilter] = useState<"All" | "Assigned" | "In Progress" | "Additional Finding Pending" | "Completed" | "Cancelled">("All");
  const [jobOrderSearch, setJobOrderSearch] = useState<string>("");
  const [showJobOrderModal, setShowJobOrderModal] = useState<boolean>(false);
  const [editingJobOrder, setEditingJobOrder] = useState<JobOrder | null>(null);
  const [selectedJobOrderDetail, setSelectedJobOrderDetail] = useState<JobOrder | null>(null);

  // Job Order Form State
  const [joQuotationNo, setJoQuotationNo] = useState<string>("");
  const [joAppointmentNo, setJoAppointmentNo] = useState<string>("");
  const [joCaseId, setJoCaseId] = useState<string>("");
  const [joCustomerName, setJoCustomerName] = useState<string>("");
  const [joLocation, setJoLocation] = useState<string>("");
  const [joPianoDetails, setJoPianoDetails] = useState<string>("");
  const [joApprovedScope, setJoApprovedScope] = useState<string>("");
  const [joServiceDate, setJoServiceDate] = useState<string>("2026-08-05");
  const [joArrivalWindow, setJoArrivalWindow] = useState<string>("09:00 AM - 11:00 AM");
  const [joLeadTech, setJoLeadTech] = useState<string>("Robert Herrero");
  const [joAssociates, setJoAssociates] = useState<string>("Jun (Tech Asst)");

  // Item-Based Pre-Service Checklist State
  const [joPreCheck, setJoPreCheck] = useState<PreServiceChecklist>({
    pinsCheck: true,
    soundboardIntegrity: true,
    keybedLevel: true,
    pedalMovement: true,
    benchStability: true,
  });

  // Conditional Finding & Optional State
  const [joFindingDesc, setJoFindingDesc] = useState<string>("");
  const [joCustomerDecision, setJoCustomerDecision] = useState<"Approved" | "Declined" | "Pending">("Pending");
  const [joFindingApprovalRef, setJoFindingApprovalRef] = useState<string>("");
  const [joPendingItems, setJoPendingItems] = useState<string>("");
  const [joInspectionNotes, setJoInspectionNotes] = useState<string>("");
  const [joPartsUsed, setJoPartsUsed] = useState<string>("");
  const [joPhotosCount, setJoPhotosCount] = useState<number>(0);

  // Item-Based Final Testing Checklist State
  const [joFinalCheck, setJoFinalCheck] = useState<FinalTestingChecklist>({
    pitchA440Check: true,
    keyRepetitionTest: true,
    voicingUniformity: true,
    pedalTrapworkTest: true,
    cabinetCleanUp: true,
  });

  const openCreateJobOrderModal = (linkedSch?: ScheduleItem) => {
    setEditingJobOrder(null);
    if (linkedSch) {
      setJoAppointmentNo(linkedSch.id);
      setJoCaseId(linkedSch.caseId);
      setJoCustomerName(linkedSch.customerName);
      setJoLocation(linkedSch.serviceLocation);
      setJoPianoDetails(linkedSch.pianoDetails);
      setJoServiceDate(linkedSch.serviceDate);
      setJoArrivalWindow(linkedSch.arrivalWindow);
      setJoLeadTech(linkedSch.leadTechnician);
      setJoAssociates(linkedSch.associates);
      const targetCase = cases.find((c) => c.id === linkedSch.caseId);
      setJoQuotationNo(targetCase?.linkedQuotationNo || "QT-2026-001");
      setJoApprovedScope(targetCase?.approvedScopeOfWork || "Full Action Regulation & Concert Pitch Tuning A440");
    } else {
      setJoQuotationNo("QT-2026-001");
      setJoAppointmentNo("SCH-2026-01");
      setJoCaseId("CASE-2026-001");
      setJoCustomerName("Atty. Fernando Alonso (0917-555-0192)");
      setJoLocation("142 Matina Aplaya, Davao City");
      setJoPianoDetails("Yamaha U3 Upright S/N: YM-582910");
      setJoApprovedScope("Full Action Regulation & Voicing");
      setJoServiceDate("2026-08-05");
      setJoArrivalWindow("09:00 AM - 11:00 AM");
      setJoLeadTech("Robert Herrero");
      setJoAssociates("Jun (Tech Asst)");
    }
    setJoPreCheck({
      pinsCheck: true,
      soundboardIntegrity: true,
      keybedLevel: true,
      pedalMovement: true,
      benchStability: true,
    });
    setJoFindingDesc("");
    setJoCustomerDecision("Pending");
    setJoFindingApprovalRef("");
    setJoPendingItems("");
    setJoInspectionNotes("Pins tight, soundboard intact; slight friction on key pins.");
    setJoPartsUsed("");
    setJoPhotosCount(0);
    setJoFinalCheck({
      pitchA440Check: true,
      keyRepetitionTest: true,
      voicingUniformity: true,
      pedalTrapworkTest: true,
      cabinetCleanUp: true,
    });
    setShowJobOrderModal(true);
  };

  const openEditJobOrderModal = (jo: JobOrder) => {
    setEditingJobOrder(jo);
    setJoQuotationNo(jo.linkedQuotationNo);
    setJoAppointmentNo(jo.appointmentNo);
    setJoCaseId(jo.linkedCaseId);
    setJoCustomerName(jo.customerName);
    setJoLocation(jo.location);
    setJoPianoDetails(jo.pianoDetails);
    setJoApprovedScope(jo.approvedScope);
    setJoServiceDate(jo.serviceDate);
    setJoArrivalWindow(jo.arrivalWindow);
    setJoLeadTech(jo.leadTechnician);
    setJoAssociates(jo.associates);
    if (typeof jo.preServiceChecklist === "object") {
      setJoPreCheck(jo.preServiceChecklist);
    } else {
      setJoPreCheck({
        pinsCheck: true,
        soundboardIntegrity: true,
        keybedLevel: true,
        pedalMovement: true,
        benchStability: true,
      });
    }
    setJoFindingDesc(jo.findingDescription || "");
    setJoCustomerDecision(jo.customerDecision || "Pending");
    setJoFindingApprovalRef(jo.findingWrittenApprovalRef || "");
    setJoPendingItems(jo.notApprovedPendingItems || "");
    setJoInspectionNotes(jo.initialInspectionFindings || "");
    setJoPartsUsed(jo.partsUsed || "");
    setJoPhotosCount(jo.photosCount || 0);
    if (jo.finalTestingChecklist) {
      setJoFinalCheck(jo.finalTestingChecklist);
    } else {
      setJoFinalCheck({
        pitchA440Check: true,
        keyRepetitionTest: true,
        voicingUniformity: true,
        pedalTrapworkTest: true,
        cabinetCleanUp: true,
      });
    }
    setShowJobOrderModal(true);
  };

  const handleSaveJobOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJobOrder) {
      setJobOrders(
        jobOrders.map((item) =>
          item.id === editingJobOrder.id
            ? {
              ...item,
              linkedQuotationNo: joQuotationNo,
              appointmentNo: joAppointmentNo,
              linkedCaseId: joCaseId,
              customerName: joCustomerName,
              location: joLocation,
              pianoDetails: joPianoDetails,
              approvedScope: joApprovedScope,
              serviceDate: joServiceDate,
              arrivalWindow: joArrivalWindow,
              leadTechnician: joLeadTech,
              associates: joAssociates,
              preServiceChecklist: joPreCheck,
              findingDescription: joFindingDesc || undefined,
              customerDecision: joFindingDesc ? joCustomerDecision : undefined,
              findingWrittenApprovalRef: joFindingDesc ? joFindingApprovalRef : undefined,
              notApprovedPendingItems: joPendingItems || undefined,
              initialInspectionFindings: joInspectionNotes || undefined,
              partsUsed: joPartsUsed || undefined,
              photosCount: joPhotosCount,
              finalTestingChecklist: joFinalCheck,
            }
            : item
        )
      );
      showToast(`💾 Job Order ${editingJobOrder.id} updated successfully!`);
    } else {
      const newJoId = `JO-2026-${String(jobOrders.length + 1).padStart(3, "0")}`;
      const newJoObj: JobOrder = {
        id: newJoId,
        date: new Date().toISOString().split("T")[0],
        linkedQuotationNo: joQuotationNo,
        appointmentNo: joAppointmentNo,
        linkedCaseId: joCaseId,
        customerName: joCustomerName,
        location: joLocation,
        pianoDetails: joPianoDetails,
        approvedScope: joApprovedScope,
        serviceDate: joServiceDate,
        arrivalWindow: joArrivalWindow,
        leadTechnician: joLeadTech,
        associates: joAssociates,
        preServiceChecklist: joPreCheck,
        status: "In Progress",
        findingDescription: joFindingDesc || undefined,
        customerDecision: joFindingDesc ? joCustomerDecision : undefined,
        findingWrittenApprovalRef: joFindingDesc ? joFindingApprovalRef : undefined,
        notApprovedPendingItems: joPendingItems || undefined,
        initialInspectionFindings: joInspectionNotes || undefined,
        partsUsed: joPartsUsed || undefined,
        photosCount: joPhotosCount,
        finalTestingChecklist: joFinalCheck,
        recordMode: "ACTUAL",
        createdDate: new Date().toISOString().split("T")[0],
      };
      setJobOrders([newJoObj, ...jobOrders]);
      showToast(`✨ Job Order ${newJoId} issued successfully!`);
    }
    setShowJobOrderModal(false);
  };

  const handleStartJob = (jo: JobOrder) => {
    setJobOrders(jobOrders.map((j) => (j.id === jo.id ? { ...j, status: "In Progress" } : j)));
    showToast(`🚀 Job Order ${jo.id} started! Lead: ${jo.leadTechnician}`);
  };

  const handleAddParts = (jo: JobOrder) => {
    const partsInput = prompt(`Add Parts & Materials Used for ${jo.id}:`, jo.partsUsed || "1 Set Renner Action Felts, Center Pin Wire #20");
    if (!partsInput) return;
    setJobOrders(jobOrders.map((j) => (j.id === jo.id ? { ...j, partsUsed: partsInput } : j)));
    showToast(`📦 Parts logged for Job Order ${jo.id}!`);
  };

  const handleAddPhotos = (jo: JobOrder) => {
    const newCount = (jo.photosCount || 0) + 2;
    setJobOrders(jobOrders.map((j) => (j.id === jo.id ? { ...j, photosCount: newCount } : j)));
    showToast(`📷 Inspection photos attached to Job Order ${jo.id} (Total: ${newCount})!`);
  };

  const handleRecordFinding = (jo: JobOrder) => {
    const desc = prompt(`Record Additional On-Site Finding for ${jo.id}:`, jo.findingDescription || "Discovered cracked bridge pin");
    if (!desc) return;
    const ref = prompt("Written Approval Reference (e.g. Viber photo chat #VB-9912):", "Viber chat photo confirmation") || "On-site sign-off";
    setJobOrders(
      jobOrders.map((j) =>
        j.id === jo.id
          ? {
            ...j,
            findingDescription: desc,
            customerDecision: "Pending",
            findingWrittenApprovalRef: ref,
            status: "Additional Finding Pending",
          }
          : j
      )
    );
    showToast(`⚠️ Additional Finding logged for ${jo.id} (Status: Additional Finding Pending)!`);
  };

  const handleCompleteJob = (jo: JobOrder) => {
    setJobOrders(jobOrders.map((j) => (j.id === jo.id ? { ...j, status: "Completed" } : j)));
    setCases(cases.map((c) => (c.id === jo.linkedCaseId ? { ...c, status: "For Billing" } : c)));
    showToast(`✅ Job Order ${jo.id} Completed successfully! Case updated to 'For Billing'.`);
  };

  // --- SERVICE REPORTS MODULE STATE & HANDLERS ---
  const [serviceReportFilter, setServiceReportFilter] = useState<"All" | "Draft" | "Pending Signature" | "Signed by Customer" | "Sent to Customer">("All");
  const [serviceReportSearch, setServiceReportSearch] = useState<string>("");
  const [showServiceReportModal, setShowServiceReportModal] = useState<boolean>(false);
  const [editingServiceReport, setEditingServiceReport] = useState<ServiceReport | null>(null);
  const [selectedServiceReportDetail, setSelectedServiceReportDetail] = useState<ServiceReport | null>(null);

  // Service Report Form State
  const [srJobOrderNo, setSrJobOrderNo] = useState<string>("");
  const [srQuotationNo, setSrQuotationNo] = useState<string>("");
  const [srServiceDate, setSrServiceDate] = useState<string>("2026-08-05");
  const [srCustomerName, setSrCustomerName] = useState<string>("");
  const [srLocation, setSrLocation] = useState<string>("");
  const [srPianoDetails, setSrPianoDetails] = useState<string>("");
  const [srCustomerConcern, setSrCustomerConcern] = useState<string>("");
  const [srInitialFindings, setSrInitialFindings] = useState<string>("");
  const [srApprovedScope, setSrApprovedScope] = useState<string>("");
  const [srWorkPerformed, setSrWorkPerformed] = useState<string>("");
  const [srResultsLimitations, setSrResultsLimitations] = useState<string>("");
  const [srLeadTech, setSrLeadTech] = useState<string>("Robert Herrero");
  const [srAssociates, setSrAssociates] = useState<string>("Jun (Tech Asst)");
  const [srAcknowledgment, setSrAcknowledgment] = useState<string>("");
  const [srPartsUsed, setSrPartsUsed] = useState<string>("");
  const [srNextServiceDate, setSrNextServiceDate] = useState<string>("2027-02-05");
  const [srFollowUpRequired, setSrFollowUpRequired] = useState<"Yes" | "No">("Yes");
  const [srPhotosCount, setSrPhotosCount] = useState<number>(0);
  const [srNotes, setSrNotes] = useState<string>("");

  const openCreateServiceReportModal = (linkedJo?: JobOrder) => {
    setEditingServiceReport(null);
    if (linkedJo) {
      setSrJobOrderNo(linkedJo.id);
      setSrQuotationNo(linkedJo.linkedQuotationNo);
      setSrServiceDate(linkedJo.serviceDate);
      setSrCustomerName(linkedJo.customerName);
      setSrLocation(linkedJo.location);
      setSrPianoDetails(linkedJo.pianoDetails);
      setSrApprovedScope(linkedJo.approvedScope);
      setSrLeadTech(linkedJo.leadTechnician);
      setSrAssociates(linkedJo.associates);
      setSrInitialFindings(linkedJo.initialInspectionFindings || "Pitch flat by 18 cents; whippen friction");
      setSrPartsUsed(linkedJo.partsUsed || "1 Set Renner Action Felts, Center Pin Wire #20");
    } else {
      setSrJobOrderNo("JO-2026-001");
      setSrQuotationNo("QT-2026-001");
      setSrServiceDate("2026-08-05");
      setSrCustomerName("Atty. Fernando Alonso (0917-555-0192)");
      setSrLocation("142 Matina Aplaya, Davao City");
      setSrPianoDetails("Yamaha U3 Upright S/N: YM-582910");
      setSrApprovedScope("Full Action Regulation & Concert Pitch Tuning A440");
      setSrLeadTech("Robert Herrero");
      setSrAssociates("Jun (Tech Asst)");
      setSrInitialFindings("Pitch flat by 18 cents; friction in whippen center pins.");
      setSrPartsUsed("1 Set Renner Action Felts, Center Pin Wire #20");
    }
    setSrCustomerConcern("Keys felt sluggish & pitch was flat");
    setSrWorkPerformed("Tuned 88 keys to concert pitch A440; lubricated center pins, regulated key height.");
    setSrResultsLimitations("Pitch fully stabilized to A440; recommended installing Dampp-Chaser humidity control rod.");
    setSrAcknowledgment(`Signed by ${linkedJo?.customerName || "Customer"} on ${new Date().toISOString().split("T")[0]}`);
    setSrNextServiceDate("2027-02-05");
    setSrFollowUpRequired("Yes");
    setSrPhotosCount(4);
    setSrNotes("6-month tuning check-in reminder requested.");
    setShowServiceReportModal(true);
  };

  const openEditServiceReportModal = (sr: ServiceReport) => {
    setEditingServiceReport(sr);
    setSrJobOrderNo(sr.jobOrderNo);
    setSrQuotationNo(sr.quotationNo);
    setSrServiceDate(sr.serviceDate);
    setSrCustomerName(sr.customerName);
    setSrLocation(sr.location);
    setSrPianoDetails(sr.pianoDetails);
    setSrCustomerConcern(sr.customerReportedConcern);
    setSrInitialFindings(sr.initialInspectionFindings);
    setSrApprovedScope(sr.approvedServiceScope);
    setSrWorkPerformed(sr.workActuallyPerformed);
    setSrResultsLimitations(sr.serviceResultsLimitations);
    setSrLeadTech(sr.leadTechnician);
    setSrAssociates(sr.associates);
    setSrAcknowledgment(sr.customerAcknowledgment);
    setSrPartsUsed(sr.partsUsed || "");
    setSrNextServiceDate(sr.recommendedNextServiceDate || "2027-02-05");
    setSrFollowUpRequired(sr.followUpRequired || "Yes");
    setSrPhotosCount(sr.photosCount || 0);
    setSrNotes(sr.notes || "");
    setShowServiceReportModal(true);
  };

  const handleSaveServiceReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServiceReport) {
      setServiceReports(
        serviceReports.map((item) =>
          item.id === editingServiceReport.id
            ? {
              ...item,
              jobOrderNo: srJobOrderNo,
              quotationNo: srQuotationNo,
              serviceDate: srServiceDate,
              customerName: srCustomerName,
              location: srLocation,
              pianoDetails: srPianoDetails,
              customerReportedConcern: srCustomerConcern,
              initialInspectionFindings: srInitialFindings,
              approvedServiceScope: srApprovedScope,
              workActuallyPerformed: srWorkPerformed,
              serviceResultsLimitations: srResultsLimitations,
              leadTechnician: srLeadTech,
              associates: srAssociates,
              customerAcknowledgment: srAcknowledgment,
              partsUsed: srPartsUsed || undefined,
              recommendedNextServiceDate: srNextServiceDate,
              followUpRequired: srFollowUpRequired,
              photosCount: srPhotosCount,
              notes: srNotes,
            }
            : item
        )
      );
      showToast(`💾 Service Report ${editingServiceReport.id} updated successfully!`);
    } else {
      const newSrId = `SR-2026-${String(serviceReports.length + 1).padStart(3, "0")}`;
      const newSrObj: ServiceReport = {
        id: newSrId,
        jobOrderNo: srJobOrderNo,
        quotationNo: srQuotationNo,
        serviceDate: srServiceDate,
        customerName: srCustomerName,
        location: srLocation,
        pianoDetails: srPianoDetails,
        customerReportedConcern: srCustomerConcern,
        initialInspectionFindings: srInitialFindings,
        approvedServiceScope: srApprovedScope,
        workActuallyPerformed: srWorkPerformed,
        serviceResultsLimitations: srResultsLimitations,
        leadTechnician: srLeadTech,
        associates: srAssociates,
        customerAcknowledgment: srAcknowledgment,
        status: "Draft",
        partsUsed: srPartsUsed || undefined,
        recommendedNextServiceDate: srNextServiceDate,
        followUpRequired: srFollowUpRequired,
        photosCount: srPhotosCount,
        notes: srNotes,
        recordMode: "ACTUAL",
        createdDate: new Date().toISOString().split("T")[0],
      };
      setServiceReports([newSrObj, ...serviceReports]);
      showToast(`✨ Service Report ${newSrId} created successfully!`);
    }
    setShowServiceReportModal(false);
  };

  const handleAddFindingsAction = (sr: ServiceReport) => {
    const findingsInput = prompt(`Update Initial Inspection Findings & Results for ${sr.id}:`, sr.initialInspectionFindings);
    if (!findingsInput) return;
    setServiceReports(serviceReports.map((s) => (s.id === sr.id ? { ...s, initialInspectionFindings: findingsInput } : s)));
    showToast(`📝 Inspection findings updated for ${sr.id}!`);
  };

  const handleAttachPhotosAction = (sr: ServiceReport) => {
    const newCount = (sr.photosCount || 0) + 2;
    setServiceReports(serviceReports.map((s) => (s.id === sr.id ? { ...s, photosCount: newCount } : s)));
    showToast(`📷 Photo documentation attached to ${sr.id} (Total: ${newCount})!`);
  };

  const handleSendReportToCustomer = (sr: ServiceReport) => {
    setServiceReports(serviceReports.map((s) => (s.id === sr.id ? { ...s, status: "Sent to Customer" } : s)));
    showToast(`📨 Service Report ${sr.id} sent to ${sr.customerName}!`);
  };

  // --- INVOICES MODULE STATE & HANDLERS ---
  const [invoiceFilter, setInvoiceFilter] = useState<"All" | "Draft" | "Sent" | "Partially Paid" | "Paid in Full" | "Overdue" | "Void">("All");
  const [invoiceSearch, setInvoiceSearch] = useState<string>("");
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<Invoice | null>(null);

  // Invoice Form State
  const [invDate, setInvDate] = useState<string>("2026-08-05");
  const [invServiceReportNo, setInvServiceReportNo] = useState<string>("SR-2026-001");
  const [invJobOrderNo, setInvJobOrderNo] = useState<string>("JO-2026-001");
  const [invQuotationNo, setInvQuotationNo] = useState<string>("QT-2026-001");
  const [invCaseId, setInvCaseId] = useState<string>("CASE-2026-001");
  const [invCustomerName, setInvCustomerName] = useState<string>("Atty. Fernando Alonso (0917-555-0192)");
  const [invBillingAddress, setInvBillingAddress] = useState<string>("142 Matina Aplaya, Davao City");
  const [invServiceDesc, setInvServiceDesc] = useState<string>("Full Action Regulation, Hammer Voicing & Concert Pitch Tuning A440");
  const [invAmount, setInvAmount] = useState<number>(18500);
  const [invDiscount, setInvDiscount] = useState<number>(0);
  const [invPaymentTerms, setInvPaymentTerms] = useState<string>("Net 7");
  const [invDueDate, setInvDueDate] = useState<string>("2026-08-12");
  const [invPreparedBy, setInvPreparedBy] = useState<string>("Robert Herrero");
  const [invPaymentMethodExpected, setInvPaymentMethodExpected] = useState<string>("GCash");
  const [invInternalNotes, setInvInternalNotes] = useState<string>("");

  // Conditional Exception without Service Report
  const [invExceptionWithoutReport, setInvExceptionWithoutReport] = useState<boolean>(false);
  const [invExceptionApprovedBy, setInvExceptionApprovedBy] = useState<string>("Robert Herrero (Owner)");
  const [invExceptionReason, setInvExceptionReason] = useState<string>("");

  const openCreateInvoiceModal = (linkedSr?: ServiceReport) => {
    setEditingInvoice(null);
    setInvExceptionWithoutReport(false);
    setInvExceptionReason("");
    setInvDiscount(0);
    setInvPaymentTerms("Net 7");
    setInvDueDate("2026-08-12");
    setInvPreparedBy("Robert Herrero");

    if (linkedSr) {
      setInvServiceReportNo(linkedSr.id);
      setInvJobOrderNo(linkedSr.jobOrderNo);
      setInvQuotationNo(linkedSr.quotationNo);
      setInvCaseId("CASE-2026-001");
      setInvCustomerName(linkedSr.customerName);
      setInvBillingAddress(linkedSr.location);
      setInvServiceDesc(linkedSr.approvedServiceScope);
      setInvAmount(18500);
    } else {
      setInvServiceReportNo("SR-2026-001");
      setInvJobOrderNo("JO-2026-001");
      setInvQuotationNo("QT-2026-001");
      setInvCaseId("CASE-2026-001");
      setInvCustomerName("Atty. Fernando Alonso (0917-555-0192)");
      setInvBillingAddress("142 Matina Aplaya, Davao City");
      setInvServiceDesc("Full Action Regulation, Hammer Voicing & Concert Pitch Tuning A440");
      setInvAmount(18500);
    }
    setShowInvoiceModal(true);
  };

  const openEditInvoiceModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvDate(inv.invoiceDate);
    setInvServiceReportNo(inv.serviceReportNo);
    setInvJobOrderNo(inv.jobOrderNo);
    setInvQuotationNo(inv.quotationNo);
    setInvCaseId(inv.caseId);
    setInvCustomerName(inv.customerName);
    setInvBillingAddress(inv.billingAddress);
    setInvServiceDesc(inv.serviceDescription);
    setInvAmount(inv.invoiceAmount);
    setInvDiscount(inv.discount || 0);
    setInvPaymentTerms(inv.paymentTerms);
    setInvDueDate(inv.dueDate);
    setInvPreparedBy(inv.preparedBy);
    setInvPaymentMethodExpected(inv.paymentMethodExpected || "GCash");
    setInvInternalNotes(inv.internalNotes || "");
    setInvExceptionWithoutReport(!!inv.exceptionWithoutReport);
    setInvExceptionApprovedBy(inv.exceptionApprovedBy || "Robert Herrero (Owner)");
    setInvExceptionReason(inv.exceptionReason || "");
    setShowInvoiceModal(true);
  };

  const handleSaveInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // RULE: Exception validation
    if (invExceptionWithoutReport && (!invExceptionApprovedBy || !invExceptionReason)) {
      alert("⚠️ Owner Exception requires both 'Exception Approved By' and 'Exception Reason'!");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    if (editingInvoice) {
      setInvoices(
        invoices.map((item) => {
          if (item.id !== editingInvoice.id) return item;

          const currentPaid = item.amountPaid;
          const netTotal = Math.max(0, invAmount - (invDiscount || 0));
          const newBal = Math.max(0, netTotal - currentPaid);

          // System calculated status rules
          let newStatus: InvoiceStatus = item.status;
          if (item.status !== "Void") {
            if (newBal === 0) {
              newStatus = "Paid in Full";
            } else if (currentPaid > 0) {
              newStatus = "Partially Paid";
            } else if (invDueDate < todayStr) {
              newStatus = "Overdue";
            } else {
              newStatus = "Sent";
            }
          }

          return {
            ...item,
            invoiceDate: invDate,
            serviceReportNo: invExceptionWithoutReport ? "N/A (Owner Exception)" : invServiceReportNo,
            jobOrderNo: invJobOrderNo,
            quotationNo: invQuotationNo,
            caseId: invCaseId,
            customerName: invCustomerName,
            billingAddress: invBillingAddress,
            serviceDescription: invServiceDesc,
            invoiceAmount: invAmount,
            discount: invDiscount,
            balance: newBal,
            paymentTerms: invPaymentTerms,
            dueDate: invDueDate,
            status: newStatus,
            preparedBy: invPreparedBy,
            paymentMethodExpected: invPaymentMethodExpected,
            internalNotes: invInternalNotes,
            exceptionWithoutReport: invExceptionWithoutReport,
            exceptionApprovedBy: invExceptionWithoutReport ? invExceptionApprovedBy : undefined,
            exceptionReason: invExceptionWithoutReport ? invExceptionReason : undefined,
          };
        })
      );
      showToast(`💾 Invoice ${editingInvoice.id} updated successfully!`);
    } else {
      const newInvId = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;
      const netTotal = Math.max(0, invAmount - (invDiscount || 0));
      const initialStatus: InvoiceStatus = invDueDate < todayStr ? "Overdue" : "Sent";

      const newInvObj: Invoice = {
        id: newInvId,
        invoiceDate: invDate,
        serviceReportNo: invExceptionWithoutReport ? "N/A (Owner Exception)" : invServiceReportNo,
        jobOrderNo: invJobOrderNo,
        quotationNo: invQuotationNo,
        caseId: invCaseId,
        customerName: invCustomerName,
        billingAddress: invBillingAddress,
        serviceDescription: invServiceDesc,
        invoiceAmount: invAmount,
        discount: invDiscount,
        amountPaid: 0,
        balance: netTotal,
        paymentTerms: invPaymentTerms,
        dueDate: invDueDate,
        status: initialStatus,
        preparedBy: invPreparedBy,
        paymentMethodExpected: invPaymentMethodExpected,
        internalNotes: invInternalNotes,
        exceptionWithoutReport: invExceptionWithoutReport,
        exceptionApprovedBy: invExceptionWithoutReport ? invExceptionApprovedBy : undefined,
        exceptionReason: invExceptionWithoutReport ? invExceptionReason : undefined,
        pdfGenerated: true,
        sentDate: todayStr,
        recordMode: "ACTUAL",
        createdDate: todayStr,
      };

      setInvoices([newInvObj, ...invoices]);
      showToast(`✨ Invoice ${newInvId} issued for ₱${netTotal.toLocaleString()}!`);
    }
    setShowInvoiceModal(false);
  };

  // INVOICE ACTIONS
  const handleSendInvoiceToCustomer = (inv: Invoice) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setInvoices(invoices.map((i) => (i.id === inv.id ? { ...i, status: i.status === "Draft" ? "Sent" : i.status, sentDate: todayStr, pdfGenerated: true } : i)));
    showToast(`📨 Invoice ${inv.id} sent to ${inv.customerName}!`);
  };

  const openCreatePaymentModalForInvoice = (inv: Invoice) => {
    const payAmtStr = prompt(`Record Payment for Invoice ${inv.id} (Current Balance: ₱${inv.balance.toLocaleString()}):`, String(inv.balance));
    if (!payAmtStr) return;
    const payAmt = Number(payAmtStr);
    if (isNaN(payAmt) || payAmt <= 0) {
      alert("Invalid payment amount.");
      return;
    }

    const payMethod = prompt("Payment Method (GCash, Cash, Bank Transfer, Check):", inv.paymentMethodExpected || "GCash") || "GCash";
    const refNo = prompt("Reference / Transaction No:", `REF-${Date.now().toString().slice(-6)}`) || `REF-${Date.now().toString().slice(-6)}`;

    // System calculate new amountPaid & balance
    const newPaid = inv.amountPaid + payAmt;
    const netTotal = Math.max(0, inv.invoiceAmount - (inv.discount || 0));
    const newBal = Math.max(0, netTotal - newPaid);
    const newStatus: InvoiceStatus = newBal === 0 ? "Paid in Full" : "Partially Paid";

    // Update invoice balance
    setInvoices(
      invoices.map((i) =>
        i.id === inv.id
          ? {
            ...i,
            amountPaid: newPaid,
            balance: newBal,
            status: newStatus,
          }
          : i
      )
    );

    // Record payment entry
    const newPayId = `PAY-2026-${String(payments.length + 1).padStart(3, "0")}`;
    const newPayAckNo = `ACK-2026-${String(payments.length + 1).padStart(3, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newPaymentObj: Payment = {
      id: newPayId,
      paymentAckNo: newPayAckNo,
      invoiceNo: inv.id,
      jobOrderNo: inv.jobOrderNo,
      caseId: inv.caseId,
      customerName: inv.customerName,
      paymentDateTime: `${todayStr} 10:00`,
      paymentType: newBal === 0 ? "Full" : "Partial",
      paymentMethod: (["Cash", "GCash", "Bank Transfer", "Check"].includes(payMethod) ? payMethod : "GCash") as any,
      referenceNo: refNo,
      amountReceivedToday: payAmt,
      invoiceTotal: netTotal,
      previousTotalPaid: inv.amountPaid,
      newTotalPaid: newPaid,
      remainingBalance: newBal,
      status: "Verified",
      receivedBy: inv.preparedBy,
      verifiedBy: inv.preparedBy,
      recordMode: "ACTUAL",
      createdDate: todayStr,
    };

    setPayments([newPaymentObj, ...payments]);
    showToast(`💰 Payment of ₱${payAmt.toLocaleString()} recorded for ${inv.id}! New Balance: ₱${newBal.toLocaleString()}`);
  };

  const handleRecordPaymentForInvoice = (inv: Invoice) => {
    openCreatePaymentModalForInvoice(inv);
  };

  const handleVoidInvoiceAction = (inv: Invoice) => {
    const reason = prompt(`Specify Void Reason for Invoice ${inv.id}:`, "Invoice issued with incorrect scope/pricing");
    if (!reason) return;
    setInvoices(invoices.map((i) => (i.id === inv.id ? { ...i, status: "Void", voidReason: reason } : i)));
    showToast(`⛔ Invoice ${inv.id} has been VOIDED.`);
  };

  // --- PAYMENTS MODULE STATE & HANDLERS ---
  const [paymentFilter, setPaymentFilter] = useState<"All" | "Pending Verification" | "Verified" | "Acknowledgment Generated" | "Refunded" | "Voided">("All");
  const [paymentSearch, setPaymentSearch] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<Payment | null>(null);

  // Payment Form State
  const [payInvoiceNo, setPayInvoiceNo] = useState<string>("INV-2026-001");
  const [payJobOrderNo, setPayJobOrderNo] = useState<string>("JO-2026-001");
  const [payCaseId, setPayCaseId] = useState<string>("CASE-2026-001");
  const [payCustomerName, setPayCustomerName] = useState<string>("Atty. Fernando Alonso");
  const [payDateTime, setPayDateTime] = useState<string>("2026-08-05 14:30");
  const [payType, setPayType] = useState<PaymentType>("Full");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("GCash");
  const [payRefNo, setPayRefNo] = useState<string>("GC-994810294");
  const [payAmountReceived, setPayAmountReceived] = useState<number>(18500);
  const [payReceivedBy, setPayReceivedBy] = useState<string>("Jun (Tech Asst)");
  const [payVerifiedBy, setPayVerifiedBy] = useState<string>("Robert Herrero (Owner)");
  const [payCustomerConfirmation, setPayCustomerConfirmation] = useState<string>("GCash App Receipt Screenshot verified");
  const [payNotes, setPayNotes] = useState<string>("");

  const openCreatePaymentModal = (linkedInv?: Invoice) => {
    setEditingPayment(null);
    if (linkedInv) {
      setPayInvoiceNo(linkedInv.id);
      setPayJobOrderNo(linkedInv.jobOrderNo);
      setPayCaseId(linkedInv.caseId);
      setPayCustomerName(linkedInv.customerName);
      setPayAmountReceived(linkedInv.balance);
      setPayType(linkedInv.balance === Math.max(0, linkedInv.invoiceAmount - (linkedInv.discount || 0)) ? "Full" : "Partial");
      setPayMethod((["Cash", "GCash", "Bank Transfer", "Check"].includes(linkedInv.paymentMethodExpected || "") ? linkedInv.paymentMethodExpected : "GCash") as any);
    } else {
      setPayInvoiceNo("INV-2026-001");
      setPayJobOrderNo("JO-2026-001");
      setPayCaseId("CASE-2026-001");
      setPayCustomerName("Atty. Fernando Alonso");
      setPayAmountReceived(18500);
      setPayType("Full");
      setPayMethod("GCash");
    }
    const todayStr = new Date().toISOString().split("T")[0];
    setPayDateTime(`${todayStr} 14:30`);
    setPayRefNo(`REF-${Date.now().toString().slice(-6)}`);
    setPayReceivedBy("Jun (Tech Asst)");
    setPayVerifiedBy("Robert Herrero (Owner)");
    setPayCustomerConfirmation("GCash Screenshot verified");
    setPayNotes("");
    setShowPaymentModal(true);
  };

  const openEditPaymentModal = (p: Payment) => {
    setEditingPayment(p);
    setPayInvoiceNo(p.invoiceNo);
    setPayJobOrderNo(p.jobOrderNo);
    setPayCaseId(p.caseId);
    setPayCustomerName(p.customerName);
    setPayDateTime(p.paymentDateTime);
    setPayType(p.paymentType);
    setPayMethod(p.paymentMethod);
    setPayRefNo(p.referenceNo);
    setPayAmountReceived(p.amountReceivedToday);
    setPayReceivedBy(p.receivedBy);
    setPayVerifiedBy(p.verifiedBy);
    setPayCustomerConfirmation(p.customerConfirmation || "");
    setPayNotes(p.notes || "");
    setShowPaymentModal(true);
  };

  const handleSavePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetInvoice = invoices.find((i) => i.id === payInvoiceNo);
    const invoiceTotalAmt = targetInvoice ? Math.max(0, targetInvoice.invoiceAmount - (targetInvoice.discount || 0)) : payAmountReceived;
    const prevPaid = targetInvoice ? targetInvoice.amountPaid : 0;
    const newPaid = prevPaid + payAmountReceived;
    const remBal = Math.max(0, invoiceTotalAmt - newPaid);

    // Rule: Received By & Verified By handling
    let finalVerifiedBy = payVerifiedBy;
    if (payReceivedBy.trim().toLowerCase() === payVerifiedBy.trim().toLowerCase()) {
      finalVerifiedBy = `${payVerifiedBy} (Owner Override)`;
    }

    if (editingPayment) {
      setPayments(
        payments.map((item) =>
          item.id === editingPayment.id
            ? {
              ...item,
              invoiceNo: payInvoiceNo,
              jobOrderNo: payJobOrderNo,
              caseId: payCaseId,
              customerName: payCustomerName,
              paymentDateTime: payDateTime,
              paymentType: payType,
              paymentMethod: payMethod,
              referenceNo: payRefNo || "N/A",
              amountReceivedToday: payAmountReceived,
              newTotalPaid: prevPaid + payAmountReceived,
              remainingBalance: Math.max(0, item.invoiceTotal - (prevPaid + payAmountReceived)),
              receivedBy: payReceivedBy,
              verifiedBy: finalVerifiedBy,
              customerConfirmation: payCustomerConfirmation,
              notes: payNotes,
            }
            : item
        )
      );
      showToast(`💾 Payment record ${editingPayment.id} updated successfully!`);
    } else {
      const newPayId = `PAY-2026-${String(payments.length + 1).padStart(3, "0")}`;
      const newAckNo = `ACK-2026-${String(payments.length + 1).padStart(3, "0")}`;
      const todayStr = new Date().toISOString().split("T")[0];

      const newPayObj: Payment = {
        id: newPayId,
        paymentAckNo: newAckNo,
        invoiceNo: payInvoiceNo,
        jobOrderNo: payJobOrderNo,
        caseId: payCaseId,
        customerName: payCustomerName,
        paymentDateTime: payDateTime,
        paymentType: payType,
        paymentMethod: payMethod,
        referenceNo: payRefNo || "N/A",
        amountReceivedToday: payAmountReceived,
        invoiceTotal: invoiceTotalAmt,
        previousTotalPaid: prevPaid,
        newTotalPaid: newPaid,
        remainingBalance: remBal,
        status: "Verified",
        receivedBy: payReceivedBy,
        verifiedBy: finalVerifiedBy,
        customerConfirmation: payCustomerConfirmation,
        notes: payNotes,
        recordMode: "ACTUAL",
        createdDate: todayStr,
      };

      setPayments([newPayObj, ...payments]);

      // System-calculate & update linked Invoice
      if (targetInvoice) {
        setInvoices(
          invoices.map((inv) =>
            inv.id === targetInvoice.id
              ? {
                ...inv,
                amountPaid: newPaid,
                balance: remBal,
                status: remBal === 0 ? "Paid in Full" : "Partially Paid",
              }
              : inv
          )
        );
      }

      showToast(`✨ Payment ${newPayId} recorded! New Balance: ₱${remBal.toLocaleString()}`);
    }
    setShowPaymentModal(false);
  };

  // PAYMENT ACTIONS
  const handleGenerateAckAction = (p: Payment) => {
    // RULE: Verification required before Acknowledgment can be generated
    if (p.status === "Pending Verification") {
      alert("⚠️ Verification required by Owner/Manager before Payment Acknowledgment can be generated!");
      return;
    }
    setPayments(payments.map((item) => (item.id === p.id ? { ...item, status: "Acknowledgment Generated" } : item)));
    setPrintableDoc({ type: "Receipt", data: p });
    showToast(`📜 Payment Acknowledgment ${p.paymentAckNo} generated successfully!`);
  };

  const handleMarkPaidInFullAction = (p: Payment) => {
    const targetInvoice = invoices.find((i) => i.id === p.invoiceNo);
    if (!targetInvoice) return;

    if (targetInvoice.balance === 0) {
      showToast(`ℹ️ Invoice ${targetInvoice.id} is already Paid in Full!`);
      return;
    }

    const netTotal = Math.max(0, targetInvoice.invoiceAmount - (targetInvoice.discount || 0));
    setInvoices(invoices.map((i) => (i.id === targetInvoice.id ? { ...i, amountPaid: netTotal, balance: 0, status: "Paid in Full" } : i)));
    setPayments(payments.map((item) => (item.id === p.id ? { ...item, newTotalPaid: netTotal, remainingBalance: 0, status: "Verified" } : item)));
    showToast(`🎉 Invoice ${targetInvoice.id} marked PAID IN FULL! Balance settled.`);
  };

  const handleRefundPaymentAction = (p: Payment) => {
    const reason = prompt(`Specify Refund Reason for Payment ${p.id}:`, "Overpayment / Scope reduction refund");
    if (!reason) return;

    // Recalculate linked invoice balance
    const targetInvoice = invoices.find((i) => i.id === p.invoiceNo);
    if (targetInvoice) {
      const adjustedPaid = Math.max(0, targetInvoice.amountPaid - p.amountReceivedToday);
      const netTotal = Math.max(0, targetInvoice.invoiceAmount - (targetInvoice.discount || 0));
      const adjustedBal = Math.max(0, netTotal - adjustedPaid);
      setInvoices(invoices.map((i) => (i.id === targetInvoice.id ? { ...i, amountPaid: adjustedPaid, balance: adjustedBal, status: adjustedBal === 0 ? "Paid in Full" : "Partially Paid" } : i)));
    }

    setPayments(payments.map((item) => (item.id === p.id ? { ...item, status: "Refunded", refundReason: reason, remainingBalance: item.invoiceTotal - item.previousTotalPaid } : item)));
    showToast(`💸 Payment ${p.id} REFUNDED. Reason: ${reason}`);
  };

  const handleVoidPaymentAction = (p: Payment) => {
    const reason = prompt(`Specify Void Reason for Payment ${p.id}:`, "Bounced check / Duplicate entry cancellation");
    if (!reason) return;

    // Recalculate linked invoice balance
    const targetInvoice = invoices.find((i) => i.id === p.invoiceNo);
    if (targetInvoice) {
      const adjustedPaid = Math.max(0, targetInvoice.amountPaid - p.amountReceivedToday);
      const netTotal = Math.max(0, targetInvoice.invoiceAmount - (targetInvoice.discount || 0));
      const adjustedBal = Math.max(0, netTotal - adjustedPaid);
      setInvoices(invoices.map((i) => (i.id === targetInvoice.id ? { ...i, amountPaid: adjustedPaid, balance: adjustedBal, status: adjustedBal === 0 ? "Paid in Full" : "Partially Paid" } : i)));
    }

    setPayments(payments.map((item) => (item.id === p.id ? { ...item, status: "Voided", voidReason: reason, remainingBalance: item.invoiceTotal - item.previousTotalPaid } : item)));
    showToast(`⛔ Payment ${p.id} VOIDED. Reason: ${reason}`);
  };

  // --- FOLLOW-UP MODULE STATE & HANDLERS ---
  const [followUpFilter, setFollowUpFilter] = useState<"All" | "Pending" | "Completed" | "Rescheduled" | "Cancelled">("All");
  const [followUpTypeFilter, setFollowUpTypeFilter] = useState<string>("All");
  const [followUpSearch, setFollowUpSearch] = useState<string>("");
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [selectedFollowUpDetail, setSelectedFollowUpDetail] = useState<FollowUp | null>(null);

  // Follow-Up Form State
  const [folCaseId, setFolCaseId] = useState<string>("CASE-2026-001");
  const [folCustomerName, setFolCustomerName] = useState<string>("Atty. Fernando Alonso");
  const [folPianoDetails, setFolPianoDetails] = useState<string>("Yamaha U3 Upright S/N: YM-582910");
  const [folType, setFolType] = useState<FollowUpType>("Routine Check-In");
  const [folTargetDate, setFolTargetDate] = useState<string>("2026-08-05");
  const [folAssignedTo, setFolAssignedTo] = useState<string>("Robert Herrero");
  const [folStatus, setFolStatus] = useState<FollowUpStatus>("Pending");
  const [folContactMethod, setFolContactMethod] = useState<"Call" | "Message">("Call");
  const [folNotes, setFolNotes] = useState<string>("");

  // Warranty Comeback Conditional State
  const [folJobOrderNo, setFolJobOrderNo] = useState<string>("JO-2026-001");
  const [folServiceReportNo, setFolServiceReportNo] = useState<string>("SR-2026-001");
  const [folIssueDesc, setFolIssueDesc] = useState<string>("Damper resonance after extended playing");
  const [folCoveredByWarranty, setFolCoveredByWarranty] = useState<"Yes" | "No">("Yes");
  const [folNewChargesRequired, setFolNewChargesRequired] = useState<"Yes" | "No">("No");

  const openCreateFollowUpModal = (type?: FollowUpType) => {
    setEditingFollowUp(null);
    setFolCaseId("CASE-2026-001");
    setFolCustomerName("Atty. Fernando Alonso");
    setFolPianoDetails("Yamaha U3 Upright S/N: YM-582910");
    setFolType(type || "Routine Check-In");
    const todayStr = new Date().toISOString().split("T")[0];
    setFolTargetDate(todayStr);
    setFolAssignedTo("Robert Herrero");
    setFolStatus("Pending");
    setFolContactMethod("Call");
    setFolNotes("");
    setFolJobOrderNo("JO-2026-001");
    setFolServiceReportNo("SR-2026-001");
    setFolIssueDesc("Damper resonance after extended playing");
    setFolCoveredByWarranty("Yes");
    setFolNewChargesRequired("No");
    setShowFollowUpModal(true);
  };

  const openEditFollowUpModal = (fol: FollowUp) => {
    setEditingFollowUp(fol);
    setFolCaseId(fol.caseId);
    setFolCustomerName(fol.customerName);
    setFolPianoDetails(fol.pianoDetails);
    setFolType(fol.followUpType);
    setFolTargetDate(fol.targetDate);
    setFolAssignedTo(fol.assignedTo);
    setFolStatus(fol.status);
    setFolContactMethod(fol.contactMethod || "Call");
    setFolNotes(fol.notes || "");
    setFolJobOrderNo(fol.linkedOriginalJobOrderNo || "JO-2026-001");
    setFolServiceReportNo(fol.linkedOriginalServiceReportNo || "SR-2026-001");
    setFolIssueDesc(fol.issueDescription || "");
    setFolCoveredByWarranty(fol.coveredByWarranty || "Yes");
    setFolNewChargesRequired(fol.newChargesRequired || "No");
    setShowFollowUpModal(true);
  };

  const handleSaveFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFollowUp) {
      setFollowUps(
        followUps.map((item) =>
          item.id === editingFollowUp.id
            ? {
              ...item,
              caseId: folCaseId,
              customerName: folCustomerName,
              pianoDetails: folPianoDetails,
              followUpType: folType,
              targetDate: folTargetDate,
              assignedTo: folAssignedTo,
              status: folStatus,
              contactMethod: folContactMethod,
              notes: folNotes,
              linkedOriginalJobOrderNo: folType === "Warranty Comeback" ? folJobOrderNo : undefined,
              linkedOriginalServiceReportNo: folType === "Warranty Comeback" ? folServiceReportNo : undefined,
              issueDescription: folType === "Warranty Comeback" ? folIssueDesc : undefined,
              coveredByWarranty: folType === "Warranty Comeback" ? folCoveredByWarranty : undefined,
              newChargesRequired: folType === "Warranty Comeback" ? folNewChargesRequired : undefined,
            }
            : item
        )
      );
      showToast(`💾 Follow-Up record ${editingFollowUp.id} updated!`);
    } else {
      const newFolId = `FOL-2026-${String(followUps.length + 1).padStart(3, "0")}`;
      const todayStr = new Date().toISOString().split("T")[0];

      const newFolObj: FollowUp = {
        id: newFolId,
        caseId: folCaseId,
        customerName: folCustomerName,
        pianoDetails: folPianoDetails,
        followUpType: folType,
        targetDate: folTargetDate,
        assignedTo: folAssignedTo,
        status: folStatus,
        contactMethod: folContactMethod,
        notes: folNotes,
        linkedOriginalJobOrderNo: folType === "Warranty Comeback" ? folJobOrderNo : undefined,
        linkedOriginalServiceReportNo: folType === "Warranty Comeback" ? folServiceReportNo : undefined,
        issueDescription: folType === "Warranty Comeback" ? folIssueDesc : undefined,
        coveredByWarranty: folType === "Warranty Comeback" ? folCoveredByWarranty : undefined,
        newChargesRequired: folType === "Warranty Comeback" ? folNewChargesRequired : undefined,
        recordMode: "ACTUAL",
        createdDate: todayStr,
      };

      setFollowUps([newFolObj, ...followUps]);
      showToast(`✨ Follow-Up ${newFolId} scheduled for ${folTargetDate}!`);
    }
    setShowFollowUpModal(false);
  };

  // RULE: Warranty Comeback -> Trigger New Quotation if new charges required!
  const handleTriggerNewQuotationForWarranty = (fol: FollowUp) => {
    alert(`⚡ Triggering NEW QUOTATION path for Warranty Comeback (${fol.id}) as new charges are required.`);
    openCreateQuotationModal();
  };

  // RULE: Future Service -> Trigger NEW CASE (never reuse old case as same job!)
  const handleTriggerNewCaseForFutureService = (fol: FollowUp) => {
    const newCaseId = `CASE-2026-${String(cases.length + 1).padStart(3, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newCaseObj: CustomerCase = {
      id: newCaseId,
      customerName: fol.customerName,
      serviceType: fol.followUpType === "Warranty Comeback" ? "Warranty Service" : "Maintenance / Tuning",
      dateConfirmed: todayStr,
      confirmedBy: fol.assignedTo,
      linkedCustomerId: "CUST-001",
      linkedPianoIds: ["PIANO-001"],
      linkedQuotationNo: "QT-2026-001",
      approvedScopeOfWork: fol.notes || `Service for ${fol.pianoDetails}`,
      approvedAmount: 0,
      status: "Open",
      recordMode: "ACTUAL",
      createdDate: todayStr,
      lastUpdatedDate: todayStr,
    };

    setCases([newCaseObj, ...cases]);
    showToast(`🚀 New Case ${newCaseId} created for ${fol.customerName}! (Originating Case: ${fol.caseId})`);
  };

  // --- DOCUMENTS MODULE STATE & HANDLERS ---
  const [docFilter, setDocFilter] = useState<"All" | "Generated" | "Sent" | "Archived">("All");
  const [docTypeFilter, setDocTypeFilter] = useState<string>("All");
  const [docRecordTypeFilter, setDocRecordTypeFilter] = useState<"All" | "ACTUAL" | "TEST">("All");
  // --- EXPENSES MODULE STATE & HANDLERS ---
  const [expCategoryFilter, setExpCategoryFilter] = useState<"All" | ExpenseCategory>("All");
  const [expRecordTypeFilter, setExpRecordTypeFilter] = useState<"All" | RecordMode>("All");
  const [expSearch, setExpSearch] = useState<string>("");
  const [showExpModal, setShowExpModal] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [selectedExpDetail, setSelectedExpDetail] = useState<Expense | null>(null);
  const [showProfitModal, setShowProfitModal] = useState<boolean>(false);

  // Expense Form State
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Parts");
  const [expDescription, setExpDescription] = useState<string>("Yamaha Hammer Dampers Replacement Batch #2");
  const [expAmount, setExpAmount] = useState<number>(3500);
  const [expPaidTo, setExpPaidTo] = useState<string>("PianoParts Supply Asia");
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [expLinkedJobOrderNo, setExpLinkedJobOrderNo] = useState<string>("JO-2026-001");
  const [expLinkedCaseId, setExpLinkedCaseId] = useState<string>("CASE-2026-001");
  const [expReceiptRefNo, setExpReceiptRefNo] = useState<string>("OR-991823");
  const [expRecordedBy, setExpRecordedBy] = useState<string>("Robert Herrero (Owner)");
  const [expRecordType, setExpRecordType] = useState<RecordMode>("ACTUAL");
  const [expNotes, setExpNotes] = useState<string>("");

  const openCreateExpenseModal = (jobOrderNo?: string, caseId?: string) => {
    setEditingExp(null);
    setExpCategory("Parts");
    setExpDescription("Yamaha Hammer Dampers Replacement Batch #2");
    setExpAmount(3500);
    setExpPaidTo("PianoParts Supply Asia");
    setExpDate(new Date().toISOString().split("T")[0]);
    setExpLinkedJobOrderNo(jobOrderNo || "JO-2026-001");
    setExpLinkedCaseId(caseId || "CASE-2026-001");
    setExpReceiptRefNo("OR-991823");
    setExpRecordedBy("Robert Herrero (Owner)");
    setExpRecordType("ACTUAL");
    setExpNotes("");
    setShowExpModal(true);
  };

  const openEditExpenseModal = (exp: Expense) => {
    setEditingExp(exp);
    setExpCategory(exp.category);
    setExpDescription(exp.description);
    setExpAmount(exp.amount);
    setExpPaidTo(exp.paidTo);
    setExpDate(exp.date);
    setExpLinkedJobOrderNo(exp.linkedJobOrderNo || "JO-2026-001");
    setExpLinkedCaseId(exp.linkedCaseId || "CASE-2026-001");
    setExpReceiptRefNo(exp.receiptRefNo || "");
    setExpRecordedBy(exp.recordedBy);
    setExpRecordType(exp.recordMode);
    setExpNotes(exp.notes || "");
    setShowExpModal(true);
  };

  const handleSaveExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExp) {
      setExpenses(
        expenses.map((item) =>
          item.id === editingExp.id
            ? {
                ...item,
                category: expCategory,
                description: expDescription,
                amount: expAmount,
                paidTo: expPaidTo,
                date: expDate,
                linkedJobOrderNo: expLinkedJobOrderNo,
                linkedCaseId: expLinkedCaseId,
                receiptRefNo: expReceiptRefNo,
                recordedBy: expRecordedBy,
                recordMode: expRecordType,
                notes: expNotes,
              }
            : item
        )
      );
      showToast(`💾 Expense ${editingExp.id} updated! Amount: ₱${expAmount.toLocaleString()}`);
    } else {
      const newExpId = `EXP-2026-${String(expenses.length + 1).padStart(3, "0")}`;

      const newExpObj: Expense = {
        id: newExpId,
        category: expCategory,
        description: expDescription,
        amount: expAmount,
        paidTo: expPaidTo,
        date: expDate,
        linkedJobOrderNo: expLinkedJobOrderNo,
        linkedCaseId: expLinkedCaseId,
        receiptRefNo: expReceiptRefNo,
        recordedBy: expRecordedBy,
        recordMode: expRecordType,
        notes: expNotes,
      };

      setExpenses([newExpObj, ...expenses]);
      showToast(`✨ Expense ${newExpId} (₱${expAmount.toLocaleString()}) recorded for Job ${expLinkedJobOrderNo}!`);
    }
    setShowExpModal(false);
  };

  const [docSearch, setDocSearch] = useState<string>("");
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<RHPSDocument | null>(null);
  const [selectedDocDetail, setSelectedDocDetail] = useState<RHPSDocument | null>(null);

  // Document Form State
  const [docType, setDocType] = useState<DocumentType>("Quotation");
  const [docRecordType, setDocRecordType] = useState<RecordMode>("ACTUAL");
  const [docSourceNo, setDocSourceNo] = useState<string>("QT-2026-001");
  const [docCaseId, setDocCaseId] = useState<string>("CASE-2026-001");
  const [docGeneratedBy, setDocGeneratedBy] = useState<string>("Robert Herrero");
  const [docModule, setDocModule] = useState<GeneratingModule>("Service & Quotations");
  const [docOwnershipRole, setDocOwnershipRole] = useState<string>("Lead Technician / Owner");
  const [docStatus, setDocStatus] = useState<DocumentStatus>("Generated");
  const [docSentTo, setDocSentTo] = useState<string>("Client Email / Viber");
  const [docNotes, setDocNotes] = useState<string>("");

  const openCreateDocModal = (type?: DocumentType) => {
    setEditingDoc(null);
    setDocType(type || "Quotation");
    setDocRecordType("ACTUAL");
    setDocSourceNo("QT-2026-001");
    setDocCaseId("CASE-2026-001");
    setDocGeneratedBy("Robert Herrero");
    setDocModule("Service & Quotations");
    setDocOwnershipRole("Lead Technician / Owner");
    setDocStatus("Generated");
    setDocSentTo("Client Email / Viber");
    setDocNotes("");
    setShowDocModal(true);
  };

  const openEditDocModal = (d: RHPSDocument) => {
    setEditingDoc(d);
    setDocType(d.documentType);
    setDocRecordType(d.recordType);
    setDocSourceNo(d.linkedSourceRecordNo);
    setDocCaseId(d.linkedCaseId);
    setDocGeneratedBy(d.generatedBy);
    setDocModule(d.generatingModule);
    setDocOwnershipRole(d.documentOwnershipRole);
    setDocStatus(d.status);
    setDocSentTo(d.sentTo || "");
    setDocNotes(d.notes || "");
    setShowDocModal(true);
  };

  const handleSaveDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDoc) {
      setDocuments(
        documents.map((item) =>
          item.id === editingDoc.id
            ? {
              ...item,
              documentType: docType,
              recordType: docRecordType,
              linkedSourceRecordNo: docSourceNo,
              linkedCaseId: docCaseId,
              generatedBy: docGeneratedBy,
              generatingModule: docModule,
              documentOwnershipRole: docOwnershipRole,
              status: docStatus,
              sentTo: docSentTo,
              notes: docNotes,
            }
            : item
        )
      );
      showToast(`💾 Document ${editingDoc.id} updated successfully!`);
    } else {
      // RULE: Auto-assigned Document No. from Manage Numbering
      const newDocId = `DOC-2026-${String(documents.length + 1).padStart(3, "0")}`;
      const todayStr = new Date().toISOString().split("T")[0];

      const newDocObj: RHPSDocument = {
        id: newDocId,
        documentType: docType,
        recordType: docRecordType,
        linkedSourceRecordNo: docSourceNo,
        linkedCaseId: docCaseId,
        dateGenerated: todayStr,
        generatedBy: docGeneratedBy,
        generatingModule: docModule,
        documentOwnershipRole: docOwnershipRole,
        status: docStatus,
        sentTo: docSentTo,
        notes: docNotes,
      };

      setDocuments([newDocObj, ...documents]);
      showToast(`✨ Document ${newDocId} (${docType} - ${docRecordType}) created!`);
    }
    setShowDocModal(false);
  };

  // --- TRADE-IN & PIANO SALES MODULE STATE & HANDLERS ---
  const [tradeFilter, setTradeFilter] = useState<"All" | TradeInStatus>("All");
  const [tradeSearch, setTradeSearch] = useState<string>("");
  const [showTradeModal, setShowTradeModal] = useState<boolean>(false);
  const [editingTrade, setEditingTrade] = useState<TradeInSale | null>(null);
  const [selectedTradeDetail, setSelectedTradeDetail] = useState<TradeInSale | null>(null);

  // Form State
  const [trdCustomerName, setTrdCustomerName] = useState<string>("Dr. Gabriel Cruz");
  const [trdContactNumber, setTrdContactNumber] = useState<string>("0918-992-1823");
  const [trdOfferedBrandModel, setTrdOfferedBrandModel] = useState<string>("Kawai K-15 Upright");
  const [trdOfferedSerialNo, setTrdOfferedSerialNo] = useState<string>("KW-391820");
  const [trdOfferedCondition, setTrdOfferedCondition] = useState<string>("Pre-owned good condition; minor cabinet scratches");
  const [trdAppraisalValuation, setTrdAppraisalValuation] = useState<number>(45000);
  const [trdTargetInventoryUnitId, setTrdTargetInventoryUnitId] = useState<string>("RHPS-INV-001");
  const [trdTargetBrandModel, setTrdTargetBrandModel] = useState<string>("Yamaha U1 Professional Upright (Refurbished)");
  const [trdTargetGrossPrice, setTrdTargetGrossPrice] = useState<number>(165000);
  const [trdAppraisedBy, setTrdAppraisedBy] = useState<string>("Robert Herrero (Owner)");
  const [trdApprovedByOwner, setTrdApprovedByOwner] = useState<string>("Robert Herrero (Owner Sign-Off)");
  const [trdStatus, setTrdStatus] = useState<TradeInStatus>("Opportunity Added");
  const [trdNotes, setTrdNotes] = useState<string>("");

  const openCreateTradeModal = () => {
    setEditingTrade(null);
    setTrdCustomerName("Dr. Gabriel Cruz");
    setTrdContactNumber("0918-992-1823");
    setTrdOfferedBrandModel("Kawai K-15 Upright");
    setTrdOfferedSerialNo("KW-391820");
    setTrdOfferedCondition("Pre-owned good condition; minor cabinet scratches");
    setTrdAppraisalValuation(45000);
    setTrdTargetInventoryUnitId("RHPS-INV-001");
    setTrdTargetBrandModel("Yamaha U1 Professional Upright (Refurbished)");
    setTrdTargetGrossPrice(165000);
    setTrdAppraisedBy("Robert Herrero (Owner)");
    setTrdApprovedByOwner("Robert Herrero (Owner Sign-Off)");
    setTrdStatus("Opportunity Added");
    setTrdNotes("");
    setShowTradeModal(true);
  };

  const openEditTradeModal = (t: TradeInSale) => {
    setEditingTrade(t);
    setTrdCustomerName(t.customerName);
    setTrdContactNumber(t.contactNumber);
    setTrdOfferedBrandModel(t.offeredPianoBrandModel);
    setTrdOfferedSerialNo(t.offeredPianoSerialNo);
    setTrdOfferedCondition(t.offeredPianoCondition);
    setTrdAppraisalValuation(t.appraisalValuation);
    setTrdTargetInventoryUnitId(t.targetInventoryUnitId || "RHPS-INV-001");
    setTrdTargetBrandModel(t.targetPianoBrandModel || "");
    setTrdTargetGrossPrice(t.targetGrossPrice);
    setTrdAppraisedBy(t.appraisedBy);
    setTrdApprovedByOwner(t.approvedByOwner);
    setTrdStatus(t.status);
    setTrdNotes(t.notes || "");
    setShowTradeModal(true);
  };

  const handleSaveTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const netBal = Math.max(0, trdTargetGrossPrice - trdAppraisalValuation);

    if (editingTrade) {
      setTradeIns(
        tradeIns.map((item) =>
          item.id === editingTrade.id
            ? {
                ...item,
                customerName: trdCustomerName,
                contactNumber: trdContactNumber,
                offeredPianoBrandModel: trdOfferedBrandModel,
                offeredPianoSerialNo: trdOfferedSerialNo,
                offeredPianoCondition: trdOfferedCondition,
                appraisalValuation: trdAppraisalValuation,
                targetInventoryUnitId: trdTargetInventoryUnitId,
                targetPianoBrandModel: trdTargetBrandModel,
                targetGrossPrice: trdTargetGrossPrice,
                netPayableBalance: netBal,
                appraisedBy: trdAppraisedBy,
                approvedByOwner: trdApprovedByOwner,
                status: trdStatus,
                notes: trdNotes,
              }
            : item
        )
      );
      showToast(`💾 Trade-In deal ${editingTrade.id} updated! Net Due: ₱${netBal.toLocaleString()}`);
    } else {
      const newTradeId = `TRD-2026-${String(tradeIns.length + 1).padStart(3, "0")}`;
      const todayStr = new Date().toISOString().split("T")[0];

      const newTradeObj: TradeInSale = {
        id: newTradeId,
        customerName: trdCustomerName,
        contactNumber: trdContactNumber,
        offeredPianoBrandModel: trdOfferedBrandModel,
        offeredPianoSerialNo: trdOfferedSerialNo,
        offeredPianoCondition: trdOfferedCondition,
        appraisalValuation: trdAppraisalValuation,
        targetInventoryUnitId: trdTargetInventoryUnitId,
        targetPianoBrandModel: trdTargetBrandModel,
        targetGrossPrice: trdTargetGrossPrice,
        netPayableBalance: netBal,
        appraisedBy: trdAppraisedBy,
        approvedByOwner: trdApprovedByOwner,
        status: trdStatus,
        recordMode: "ACTUAL",
        createdDate: todayStr,
        notes: trdNotes,
      };

      setTradeIns([newTradeObj, ...tradeIns]);
      showToast(`✨ Trade-In Deal ${newTradeId} logged successfully!`);
    }
    setShowTradeModal(false);
  };

  // Quick Modal States for Trade Actions
  const [targetTradeForAction, setTargetTradeForAction] = useState<TradeInSale | null>(null);
  const [showRegisterBuyerModal, setShowRegisterBuyerModal] = useState<boolean>(false);
  const [buyerInputName, setBuyerInputName] = useState<string>("");
  const [buyerInputContact, setBuyerInputContact] = useState<string>("");

  const [showCloseLostModal, setShowCloseLostModal] = useState<boolean>(false);
  const [lostReasonInput, setLostReasonInput] = useState<string>("");

  const handleOpenRegisterBuyer = (t: TradeInSale) => {
    setTargetTradeForAction(t);
    setBuyerInputName(t.buyerName || t.customerName);
    setBuyerInputContact(t.buyerContact || t.contactNumber);
    setShowRegisterBuyerModal(true);
  };

  const handleSaveRegisterBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTradeForAction) return;

    setTradeIns(
      tradeIns.map((item) =>
        item.id === targetTradeForAction.id
          ? {
              ...item,
              buyerName: buyerInputName,
              buyerContact: buyerInputContact,
              status: "Buyer Registered",
            }
          : item
      )
    );
    showToast(`👤 Buyer ${buyerInputName} successfully registered for Trade Deal ${targetTradeForAction.id}!`);
    setShowRegisterBuyerModal(false);
  };

  const handleCloseWonAction = (t: TradeInSale) => {
    setTradeIns(
      tradeIns.map((item) =>
        item.id === t.id
          ? {
              ...item,
              status: "Closed Won",
            }
          : item
      )
    );

    // Auto-add traded unit to Store Inventory if credit > 0
    if (t.appraisalValuation > 0) {
      const autoInvId = `RHPS-INV-${String(inventory.length + 1).padStart(3, "0")}`;
      const newInvUnit: InventoryUnit = {
        id: autoInvId,
        brand: t.offeredPianoBrandModel.split(" ")[0] || "Traded Unit",
        model: t.offeredPianoBrandModel,
        serialNumber: t.offeredPianoSerialNo,
        condition: "Pre-Owned Excellent",
        price: t.appraisalValuation * 1.35,
        status: "Under Repair",
        recordMode: "ACTUAL",
      };
      setInventory([newInvUnit, ...inventory]);
      showToast(`🏆 Trade-In Deal ${t.id} CLOSED WON! Traded piano auto-added to inventory (${autoInvId}). Net Due: ₱${t.netPayableBalance.toLocaleString()}`);
    } else {
      showToast(`🏆 Trade-In Deal ${t.id} CLOSED WON! Net Payable: ₱${t.netPayableBalance.toLocaleString()}`);
    }
  };

  const handleOpenCloseLost = (t: TradeInSale) => {
    setTargetTradeForAction(t);
    setLostReasonInput("");
    setShowCloseLostModal(true);
  };

  const handleSaveCloseLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTradeForAction) return;

    setTradeIns(
      tradeIns.map((item) =>
        item.id === targetTradeForAction.id
          ? {
              ...item,
              status: "Closed Lost",
              closeLostReason: lostReasonInput || "No reason specified",
            }
          : item
      )
    );
    showToast(`🔴 Trade-In Deal ${targetTradeForAction.id} marked as CLOSED LOST.`);
    setShowCloseLostModal(false);
  };

  // --- INVENTORY MODULE STATE & HANDLERS ---
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<"ALL" | "Shop Inventory" | "Personal Inventory">("Shop Inventory");
  const [invCategory, setInvCategory] = useState<InventoryCategory>("Shop Inventory");

  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [editingInventory, setEditingInventory] = useState<InventoryUnit | null>(null);
  const [inventoryActionTarget, setInventoryActionTarget] = useState<InventoryUnit | null>(null);
  const [showReserveModal, setShowReserveModal] = useState<boolean>(false);
  const [showReleaseReserveModal, setShowReleaseReserveModal] = useState<boolean>(false);
  const [showMarkSoldModal, setShowMarkSoldModal] = useState<boolean>(false);
  const [showAdjustPriceModal, setShowAdjustPriceModal] = useState<boolean>(false);

  const [invBrand, setInvBrand] = useState<string>("");
  const [invModel, setInvModel] = useState<string>("");
  const [invSerialNo, setInvSerialNo] = useState<string>("");
  const [invCondition, setInvCondition] = useState<InventoryUnit["condition"]>("Refurbished");
  const [invPrice, setInvPrice] = useState<number>(0);
  const [invStatus, setInvStatus] = useState<InventoryUnit["status"]>("In Stock");
  const [invRecordMode, setInvRecordMode] = useState<RecordMode>("ACTUAL");
  const [invNotes, setInvNotes] = useState<string>("");
  const [invPhotoInput, setInvPhotoInput] = useState<string>("");
  const [invPhotos, setInvPhotos] = useState<string[]>([]);

  const shopUnitsCount = useMemo(
    () => inventory.filter((i) => (i.inventoryCategory || "Shop Inventory") === "Shop Inventory").length,
    [inventory]
  );
  const personalUnitsCount = useMemo(
    () => inventory.filter((i) => (i.inventoryCategory || "Shop Inventory") === "Personal Inventory").length,
    [inventory]
  );

  const filteredInventory = useMemo(() => {
    return inventory.filter((inv) => {
      const cat = inv.inventoryCategory || "Shop Inventory";
      if (inventoryCategoryFilter === "Shop Inventory") return cat === "Shop Inventory";
      if (inventoryCategoryFilter === "Personal Inventory") return cat === "Personal Inventory";
      return true;
    });
  }, [inventory, inventoryCategoryFilter]);

  const [reserveByInput, setReserveByInput] = useState<string>("");
  const [reserveUntilInput, setReserveUntilInput] = useState<string>("");
  const [reserveNotesInput, setReserveNotesInput] = useState<string>("");

  const [markSoldToInput, setMarkSoldToInput] = useState<string>("");
  const [markSoldDateInput, setMarkSoldDateInput] = useState<string>(new Date().toISOString().split("T")[0]);
  const [markSoldNotesInput, setMarkSoldNotesInput] = useState<string>("");

  const [adjustPriceInput, setAdjustPriceInput] = useState<number>(0);
  const [adjustPriceReasonInput, setAdjustPriceReasonInput] = useState<string>("");

  const openCreateInventoryModal = (defaultCategory?: InventoryCategory) => {
    setEditingInventory(null);
    setInvBrand("");
    setInvModel("");
    setInvSerialNo("");
    setInvCondition("Refurbished");
    setInvPrice(0);
    setInvStatus("In Stock");
    setInvCategory(defaultCategory || (inventoryCategoryFilter === "Personal Inventory" ? "Personal Inventory" : "Shop Inventory"));
    setInvRecordMode("ACTUAL");
    setInvNotes("");
    setInvPhotos([]);
    setInvPhotoInput("");
    setShowInventoryModal(true);
  };

  const openEditInventoryModal = (inv: InventoryUnit) => {
    setEditingInventory(inv);
    setInvBrand(inv.brand);
    setInvModel(inv.model);
    setInvSerialNo(inv.serialNumber);
    setInvCondition(inv.condition);
    setInvPrice(inv.price);
    setInvStatus(inv.status);
    setInvCategory(inv.inventoryCategory || "Shop Inventory");
    setInvRecordMode(inv.recordMode);
    setInvNotes(inv.notes || "");
    setInvPhotos(inv.photos || []);
    setInvPhotoInput("");
    setShowInventoryModal(true);
  };

  const handleAddPhotoToDraft = () => {
    const clean = invPhotoInput.trim();
    if (!clean) return;
    setInvPhotos((prev) => [clean, ...prev]);
    setInvPhotoInput("");
  };

  const handleInventoryPhotoFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readTasks = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => reject(new Error("Failed to read image file."));
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readTasks)
      .then((encodedPhotos) => {
        const validPhotos = encodedPhotos.filter((p) => p);
        if (validPhotos.length > 0) {
          setInvPhotos((prev) => [...validPhotos, ...prev]);
          showToast(`📷 ${validPhotos.length} photo(s) uploaded.`);
        }
      })
      .catch(() => {
        showToast("⚠️ Unable to read one or more selected photos.");
      });

    e.target.value = "";
  };

  const handleRemovePhotoFromDraft = (photo: string) => {
    setInvPhotos((prev) => prev.filter((p) => p !== photo));
  };

  const handleSaveInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invBrand.trim() || !invModel.trim() || !invSerialNo.trim()) {
      showToast("⚠️ Brand, model, and serial number are required.");
      return;
    }

    if (invPrice <= 0) {
      showToast("⚠️ Please set a valid inventory price.");
      return;
    }

    const normalizedSerial = invSerialNo.trim();
    const duplicateSerial = inventory.some((unit) => {
      if (editingInventory && unit.id === editingInventory.id) return false;
      return unit.serialNumber.trim().toLowerCase() === normalizedSerial.toLowerCase();
    });

    if (duplicateSerial) {
      showToast("⚠️ Serial number already exists in inventory.");
      return;
    }

    if (editingInventory) {
      setInventory(
        inventory.map((item) =>
          item.id === editingInventory.id
            ? {
                ...item,
                brand: invBrand.trim(),
                model: invModel.trim(),
                serialNumber: normalizedSerial,
                condition: invCondition,
                price: invPrice,
                status: invStatus,
                inventoryCategory: invCategory,
                recordMode: invRecordMode,
                notes: invNotes.trim() || undefined,
                photos: invPhotos.length ? invPhotos : undefined,
              }
            : item
        )
      );
      showToast(`💾 Inventory unit ${editingInventory.id} updated.`);
    } else {
      const newInvId = `RHPS-INV-${String(inventory.length + 1).padStart(3, "0")}`;
      const newInvObj: InventoryUnit = {
        id: newInvId,
        brand: invBrand.trim(),
        model: invModel.trim(),
        serialNumber: normalizedSerial,
        condition: invCondition,
        price: invPrice,
        status: invStatus,
        inventoryCategory: invCategory,
        recordMode: invRecordMode,
        notes: invNotes.trim() || undefined,
        photos: invPhotos.length ? invPhotos : undefined,
      };
      setInventory([newInvObj, ...inventory]);
      showToast(`✨ Inventory unit ${newInvId} added.`);
    }

    setShowInventoryModal(false);
  };

  const openReserveInventoryModal = (inv: InventoryUnit) => {
    setInventoryActionTarget(inv);
    setReserveByInput(inv.reservedBy || "");
    setReserveUntilInput(inv.reservedUntil || new Date().toISOString().split("T")[0]);
    setReserveNotesInput("");
    setShowReserveModal(true);
  };

  const handleReserveInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryActionTarget) return;

    if (!reserveByInput.trim()) {
      showToast("⚠️ Reserved by is required.");
      return;
    }

    setInventory(
      inventory.map((item) =>
        item.id === inventoryActionTarget.id
          ? {
              ...item,
              status: "Reserved",
              reservedBy: reserveByInput.trim(),
              reservedUntil: reserveUntilInput || undefined,
              notes: reserveNotesInput.trim() ? `${item.notes ? `${item.notes} | ` : ""}Reserved: ${reserveNotesInput.trim()}` : item.notes,
            }
          : item
      )
    );
    showToast(`🔒 ${inventoryActionTarget.id} reserved for ${reserveByInput.trim()}.`);
    setShowReserveModal(false);
  };

  const openReleaseReservationModal = (inv: InventoryUnit) => {
    setInventoryActionTarget(inv);
    setShowReleaseReserveModal(true);
  };

  const handleReleaseReservation = () => {
    if (!inventoryActionTarget) return;
    setInventory(
      inventory.map((item) =>
        item.id === inventoryActionTarget.id
          ? {
              ...item,
              status: "In Stock",
              reservedBy: undefined,
              reservedUntil: undefined,
            }
          : item
      )
    );
    showToast(`🔓 Reservation released for ${inventoryActionTarget.id}.`);
    setShowReleaseReserveModal(false);
  };

  const openMarkSoldModal = (inv: InventoryUnit) => {
    setInventoryActionTarget(inv);
    setMarkSoldToInput(inv.soldTo || "");
    setMarkSoldDateInput(inv.soldDate || new Date().toISOString().split("T")[0]);
    setMarkSoldNotesInput("");
    setShowMarkSoldModal(true);
  };

  const handleMarkSoldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryActionTarget) return;

    if (!markSoldToInput.trim()) {
      showToast("⚠️ Buyer name is required to mark an item sold.");
      return;
    }

    setInventory(
      inventory.map((item) =>
        item.id === inventoryActionTarget.id
          ? {
              ...item,
              status: "Sold",
              soldTo: markSoldToInput.trim(),
              soldDate: markSoldDateInput || undefined,
              reservedBy: undefined,
              reservedUntil: undefined,
              notes: markSoldNotesInput.trim() ? `${item.notes ? `${item.notes} | ` : ""}Sold: ${markSoldNotesInput.trim()}` : item.notes,
            }
          : item
      )
    );
    showToast(`✅ ${inventoryActionTarget.id} marked as SOLD.`);
    setShowMarkSoldModal(false);
  };

  const openAdjustPriceModal = (inv: InventoryUnit) => {
    setInventoryActionTarget(inv);
    setAdjustPriceInput(inv.price);
    setAdjustPriceReasonInput("");
    setShowAdjustPriceModal(true);
  };

  const handleAdjustPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryActionTarget) return;

    if (adjustPriceInput <= 0) {
      showToast("⚠️ Please provide a valid new price.");
      return;
    }

    setInventory(
      inventory.map((item) =>
        item.id === inventoryActionTarget.id
          ? {
              ...item,
              price: adjustPriceInput,
              notes: adjustPriceReasonInput.trim() ? `${item.notes ? `${item.notes} | ` : ""}Price Adjusted: ${adjustPriceReasonInput.trim()}` : item.notes,
            }
          : item
      )
    );

    showToast(`💰 Price adjusted for ${inventoryActionTarget.id} to ₱${adjustPriceInput.toLocaleString()}.`);
    setShowAdjustPriceModal(false);
  };

  // Customer Modal Form State
  const [custName, setCustName] = useState<string>("");
  const [custContact, setCustContact] = useState<string>("");
  const [custAltContact, setCustAltContact] = useState<string>("");
  const [custAddress, setCustAddress] = useState<string>("");
  const [custType, setCustType] = useState<"New" | "Old" | "Repeat">("New");
  const [custEmail, setCustEmail] = useState<string>("");
  const [custFbName, setCustFbName] = useState<string>("");
  const [custFbLink, setCustFbLink] = useState<string>("");
  const [custGmapsLink, setCustGmapsLink] = useState<string>("");
  const [custReminderDate, setCustReminderDate] = useState<string>("");
  const [custReminderNotes, setCustReminderNotes] = useState<string>("");
  const [custCityArea, setCustCityArea] = useState<string>("");
  const [custLandmark, setCustLandmark] = useState<string>("");
  const [custNotes, setCustNotes] = useState<string>("");

  // Dashboard Action Filter State ("Open", "View All", "Resolve", "Follow Up")
  const [dashboardFilter, setDashboardFilter] = useState<"Open" | "View All" | "Resolve" | "Follow Up">("Open");

  const [toastMessage, setToastMessage] = useState<string>("");
  const [printableDoc, setPrintableDoc] = useState<{ type: string; data: any } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const AI_STORAGE_KEY = "rhps_ai_chat_history";
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const modalChatBoxRef = useRef<HTMLDivElement | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const WELCOME_MSG = {
    role: "assistant" as const,
    content: `## Welcome to RHPS Master AI, Robert!

I am your dedicated AI assistant for **R. Herrero Pianos & Services** — private and exclusively built for your piano business in Davao.

| Action | Example |
|---|---|
| 📋 Draft Quotation | "Draft quotation for Yamaha U3 regulation" |
| 📲 SMS Reminder | "Write 6-month reminder for Atty. Alonso" |
| 🔧 Technical Diagnosis | "How to fix sticky keys in Davao humidity?" |
| 📊 Business Summary | "Summarize my active jobs and revenue" |
| 📄 Service Report | "Draft service report for Kawai grand" |`,
  };

  const loadHistory = (): { role: "user" | "assistant"; content: string }[] => {
    try {
      const saved = localStorage.getItem(AI_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return [WELCOME_MSG];
  };

  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(loadHistory);

  // Auto-save to localStorage whenever messages change
  useEffect(() => {
    try {
      // Keep last 60 messages
      const trimmed = aiMessages.slice(-60);
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(trimmed));
    } catch { }
  }, [aiMessages]);

  // Auto-scroll chat box to bottom (ONLY inside the container, never the page)
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  // --- CUSTOMER MANAGEMENT MODULE HANDLERS ---
  const openAddCustomerModal = () => {
    setEditingCustomer(null);
    setCustName("");
    setCustContact("");
    setCustAltContact("");
    setCustAddress("");
    setCustType("New");
    setCustEmail("");
    setCustFbName("");
    setCustFbLink("");
    setCustGmapsLink("");
    setCustReminderDate("");
    setCustReminderNotes("");
    setCustCityArea("Davao City");
    setCustLandmark("");
    setCustNotes("");
    setShowCustomerModal(true);
  };

  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomer(c);
    setCustName(c.name);
    setCustContact(c.contactNumber);
    setCustAltContact(c.alternateContactNumber || "");
    setCustAddress(c.completeAddress);
    setCustType(c.customerType);
    setCustEmail(c.email || "");
    setCustFbName(c.facebookName || "");
    setCustFbLink(c.facebookLink || "");
    setCustGmapsLink(c.gmapsLink || "");
    setCustReminderDate(c.reminderDate || "");
    setCustReminderNotes(c.reminderNotes || "");
    setCustCityArea(c.cityArea || "Davao City");
    setCustLandmark(c.landmark || "");
    setCustNotes(c.notes || "");
    setShowCustomerModal(true);
  };

  const handleSaveCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custContact.trim() || !custAddress.trim()) {
      showToast("⚠️ Please fill in all required customer fields.");
      return;
    }

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const targetId = editingCustomer ? editingCustomer.id : `CUST-${String(customers.length + 1).padStart(3, "0")}`;

    if (editingCustomer) {
      const updated = customers.map((c) => {
        if (c.id === editingCustomer.id) {
          return {
            ...c,
            name: custName.trim(),
            contactNumber: custContact.trim(),
            alternateContactNumber: custAltContact.trim() || undefined,
            completeAddress: custAddress.trim(),
            customerType: custType,
            email: custEmail.trim() || undefined,
            facebookName: custFbName.trim() || undefined,
            facebookLink: custFbLink.trim() || undefined,
            gmapsLink: custGmapsLink.trim() || undefined,
            reminderDate: custReminderDate || undefined,
            reminderNotes: custReminderNotes.trim() || undefined,
            cityArea: custCityArea.trim() || undefined,
            landmark: custLandmark.trim() || undefined,
            notes: custNotes.trim() || undefined,
            lastUpdatedDate: formattedDate,
          };
        }
        return c;
      });
      setCustomers(updated);
    } else {
      const newRecord: Customer = {
        id: targetId,
        name: custName.trim(),
        contactNumber: custContact.trim(),
        alternateContactNumber: custAltContact.trim() || undefined,
        completeAddress: custAddress.trim(),
        customerType: custType,
        linkedPianoIds: [],
        createdDate: formattedDate,
        lastUpdatedDate: formattedDate,
        email: custEmail.trim() || undefined,
        facebookName: custFbName.trim() || undefined,
        facebookLink: custFbLink.trim() || undefined,
        gmapsLink: custGmapsLink.trim() || undefined,
        reminderDate: custReminderDate || undefined,
        reminderNotes: custReminderNotes.trim() || undefined,
        cityArea: custCityArea.trim() || undefined,
        landmark: custLandmark.trim() || undefined,
        notes: custNotes.trim() || undefined,
        pianos: [],
      };
      setCustomers([newRecord, ...customers]);
    }

    // Auto-create Follow-Up reminder if set
    if (custReminderDate) {
      const newFuId = `FU-2026-${String(followUps.length + 1).padStart(3, "0")}`;
      const autoFollowUp: FollowUp = {
        id: newFuId,
        caseId: `CASE-${targetId}`,
        customerName: custName.trim(),
        pianoDetails: "Customer Piano",
        followUpType: "Routine Check-In",
        targetDate: custReminderDate,
        assignedTo: activeUser || "Robert Herrero",
        status: "Pending",
        recordMode: "ACTUAL",
        createdDate: formattedDate,
        notes: custReminderNotes.trim() ? `[Customer Reminder] ${custReminderNotes.trim()}` : `Follow-up reminder for ${custName.trim()}`,
      };
      setFollowUps((prev) => [autoFollowUp, ...prev]);
      showToast(`✨ Customer ${targetId} saved & Follow-Up Reminder ${newFuId} added!`);
    } else {
      showToast(editingCustomer ? `👤 Customer ${editingCustomer.id} updated successfully!` : `🎉 New Customer ${targetId} registered successfully!`);
    }

    setShowCustomerModal(false);
  };

  // --- BACKUP & RESTORE MODULE HANDLERS ---
  const handleCreateBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNum = backups.length + 1;
    const bakId = `BAK-2026-${String(nextNum).padStart(3, "0")}`;
    const calculatedSize = newBackupScope === "Full System" ? "4.9 MB" : "3.3 MB";
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    const newRecord: BackupRecord = {
      id: bakId,
      dateTimeCreated: formattedDate,
      backupType: newBackupType,
      backupScope: newBackupScope,
      fileSize: calculatedSize,
      storageLocation: newStorageLocation,
      triggeredBy: `${activeUser} (Owner)`,
      status: "Completed",
      retentionPeriodDate: `${now.getFullYear() + 1}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      notes: newBackupNotes || "Manual backup created via RHPS System Operations.",
    };

    setBackups([newRecord, ...backups]);
    setShowCreateBackupModal(false);
    setNewBackupNotes("");
    showToast(`💾 Backup ${bakId} (${newBackupScope}) created successfully!`);
  };

  const handleExecuteRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestoreModal) return;
    if (!restoreConfirmed) {
      showToast("⚠️ Explicit confirmation required: Please check 'Yes, I confirm system restore'.");
      return;
    }
    if (!restoreReason.trim()) {
      showToast("⚠️ Reason for restore is required.");
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    const snapRef = `SNAP-PRE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-01`;

    const updated = backups.map((b) => {
      if (b.id === showRestoreModal.id) {
        return {
          ...b,
          restoreDateTime: formattedDate,
          restoredBy: `${activeUser} (Owner)`,
          restoreConfirmation: true,
          reasonForRestore: restoreReason,
          preRestoreSnapshotRef: snapRef,
        };
      }
      return b;
    });

    setBackups(updated);
    const restoredId = showRestoreModal.id;
    setShowRestoreModal(null);
    setRestoreReason("");
    setRestoreConfirmed(false);
    showToast(`✅ System restored from ${restoredId}! Pre-restore snapshot ${snapRef} created.`);
  };

  const handleTestRestoreClick = (bak: BackupRecord) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    const updated = backups.map((b) => {
      if (b.id === bak.id) {
        return {
          ...b,
          lastTestRestoreDate: formattedDate,
          testRestoreResult: "Pass" as const,
        };
      }
      return b;
    });

    setBackups(updated);
    showToast(`🧪 Test restore for ${bak.id} PASSED successfully!`);
  };

  // Build live context snapshot for context-awareness
  const buildContextSnapshot = () => {
    const activeJobs = jobOrders.filter((j) => j.status !== "Completed" && j.status !== "Cancelled");
    const overdueFollowUps = followUps.filter((f) => f.status === "Pending");
    const verifiedRevenue = payments
      .filter((p) => p.status === "Verified")
      .reduce((sum, p) => sum + p.amountReceivedToday, 0)
      .toLocaleString("en-PH", { style: "currency", currency: "PHP" });
    const topCustomers = customers.slice(0, 5).map((c) => `${c.name} (${c.cityArea || "Davao"})`).join(", ");
    return `
--- LIVE RHPS OPERATIONS CONTEXT (as of now) ---
Active Job Orders: ${activeJobs.length} active jobs
${activeJobs.slice(0, 5).map((j) => `• ${j.customerName} – ${j.approvedScope} – Status: ${j.status}`).join("\n")}

Pending Follow-Ups: ${overdueFollowUps.length} follow-ups pending
${overdueFollowUps.slice(0, 5).map((f) => `• ${f.customerName} – ${f.followUpType} – Target: ${f.targetDate}`).join("\n")}

Verified Revenue (Paid): ${verifiedRevenue}
Total Customers: ${customers.length}
Top Customers: ${topCustomers}

Total Quotations: ${quotations.length}
Total Invoices: ${invoices.length}
---`;
  };

  // Smart follow-up chip suggestions based on last AI response
  const getSmartChips = (lastMsg: string): string[] => {
    const chips: string[] = [];
    if (/quotation|quote|repair scope|estimate/i.test(lastMsg))
      chips.push("Generate PDF Quotation", "Copy to Quotations tab");
    if (/reminder|sms|follow.?up|tuning/i.test(lastMsg))
      chips.push("Draft 6-Month Reminder for next client", "Show all pending follow-ups");
    if (/invoice|billing|payment/i.test(lastMsg))
      chips.push("Generate Invoice", "Show unpaid invoices");
    if (/job order|active job/i.test(lastMsg))
      chips.push("Show all active jobs", "Mark job as completed");
    chips.push("Business Summary", "Draft Service Report");
    return chips.slice(0, 5);
  };

  // Voice input (Web Speech API)
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("🎤 Voice input not supported on this browser. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-PH";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiInput(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      showToast("🎤 Could not capture voice. Please try again.");
    };
    recognition.start();
  };

  const sendAiMessage = async (customPrompt?: string) => {
    const query = customPrompt || aiInput;
    if (!query.trim() || aiLoading) return;

    const userMsg = { role: "user" as const, content: query };
    const updatedMessages = [...aiMessages, userMsg];
    setAiMessages(updatedMessages);
    if (!customPrompt) setAiInput("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          history: aiMessages,
          workspaceContext: buildContextSnapshot(),
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setAiMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setAiMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I could not process your request right now." }]);
      }
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI Assistant server." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const [scrubX, setScrubX] = useState<number>(300);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);

  const updateScrubFromPos = (clientX: number) => {
    if (!graphContainerRef.current) return;
    const rect = graphContainerRef.current.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 300;
    setScrubX(Math.max(0, Math.min(300, relativeX)));
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMove = (e: MouseEvent) => {
      updateScrubFromPos(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateScrubFromPos(e.touches[0].clientX);
    };

    const handleUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isScrubbing]);

  const getScrubData = (x: number) => {
    const normX = Math.max(0, Math.min(300, x));
    const t = normX / 300;
    const y = 42 * Math.pow(1 - t, 2) + 2 * (1 - t) * t * 24 + 10 * Math.pow(t, 2);

    let month = "Aug YTD";
    let val = "₱18,500";
    if (normX < 75) {
      month = "May";
      val = `₱${Math.round(14000 + (normX / 75) * 1200).toLocaleString()}`;
    } else if (normX < 175) {
      month = "Jun";
      val = `₱${Math.round(15200 + ((normX - 75) / 100) * 1300).toLocaleString()}`;
    } else if (normX < 250) {
      month = "Jul";
      val = `₱${Math.round(16500 + ((normX - 175) / 75) * 1000).toLocaleString()}`;
    } else {
      month = "Aug YTD";
      val = "₱18,500";
    }

    return { normX, y, month, val };
  };

  const currentScrub = getScrubData(scrubX);

  // Piano Operations Financial Calculations
  const actualPayments = useMemo(() => payments.filter((p) => p.status === "Verified"), [payments]);
  const actualExpenses = useMemo(() => expenses.filter((e) => e.recordMode === "ACTUAL"), [expenses]);

  const totalRevenue = useMemo(() => actualPayments.reduce((acc, p) => acc + p.amountReceivedToday, 0), [actualPayments]);
  const totalExpenseAmount = useMemo(() => actualExpenses.reduce((acc, e) => acc + e.amount, 0), [actualExpenses]);
  const netProfit = totalRevenue - totalExpenseAmount;

  // CLEAN GROUPED SIDEBAR NAVIGATION (NO NUMBERS)
  type NavItem = {
    id: string;
    label: string;
    icon: string;
    badge?: number;
    isComingSoon?: boolean;
  };

  const handoffNavGroups: { title: string; items: NavItem[] }[] = [
    {
      title: "FOCUS",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "⌂" },
        { id: "crm_leads", label: "CRM Leads", icon: "✦", badge: leads.length },
        { id: "customers", label: "Customers", icon: "👤" },
      ],
    },
    {
      title: "PRIMARY WORKFLOW",
      items: [
        { id: "estimates", label: "Estimates", icon: "📋" },
        { id: "quotations", label: "Quotations", icon: "🏷" },
        { id: "schedule", label: "Schedule", icon: "📅" },
        { id: "job_orders", label: "Job Orders", icon: "⚙" },
        { id: "service_reports", label: "Service Reports", icon: "📝" },
        { id: "invoices", label: "Invoices", icon: "🧾" },
        { id: "payments", label: "Payments", icon: "💳" },
        { id: "expenses", label: "Expenses", icon: "📉" },
        { id: "follow_ups", label: "Follow-Ups", icon: "↗", badge: followUps.length },
      ],
    },
    {
      title: "SERVICES & INVENTORY",
      items: [
        { id: "repairs", label: "Repairs", icon: "🔧" },
        { id: "trade_in", label: "Trade-In / Sales", icon: "🤝" },
        { id: "inventory", label: "Inventory", icon: "🎹" },
        { id: "documents", label: "Documents", icon: "📁" },
      ],
    },
    {
      title: "SYSTEM & WEBSITE",
      items: [
        { id: "public_website", label: "Public Website", icon: "🌐" },
        { id: "website_editor", label: "Website Editor", icon: "✏️" },
        { id: "backup", label: "Backup", icon: "💾" },
        { id: "settings", label: "Settings", icon: "⚙️" },
        { id: "ai_assistant", label: "RHPS Master AI", icon: "🤖" },
      ],
    },
  ];

  return (
    <div className={`rhps-container font-size-${fontSize.toLowerCase().replace(" ", "-")}`}>
      {/* SUB-HEADER BAR */}
      <div className="rhps-sub-header">
        <div className="rhps-brand-info">
          <span className="rhps-icon">🎹</span>
          <div>
            <h2>RHPS OS (R. Herrero Pianos & Services)</h2>
            <p>Active Session: <strong>{activeUser}</strong> • Private Piano Operations OS</p>
          </div>
        </div>

        <div className="rhps-safeguard-bar" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {activeTab === "inventory" && (
            <div style={{ display: "flex", background: "#334155", padding: "4px", borderRadius: "999px", gap: 4, marginRight: 8 }}>
              <button
                type="button"
                onClick={() => setInventoryCategoryFilter("Personal Inventory")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: inventoryCategoryFilter === "Personal Inventory" ? "#ffffff" : "transparent",
                  color: inventoryCategoryFilter === "Personal Inventory" ? "#0f172a" : "#cbd5e1",
                  boxShadow: inventoryCategoryFilter === "Personal Inventory" ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                }}
              >
                👤 Personal Inventory ({personalUnitsCount})
              </button>
              <button
                type="button"
                onClick={() => setInventoryCategoryFilter("Shop Inventory")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: inventoryCategoryFilter === "Shop Inventory" ? "#ffffff" : "transparent",
                  color: inventoryCategoryFilter === "Shop Inventory" ? "#0f172a" : "#cbd5e1",
                  boxShadow: inventoryCategoryFilter === "Shop Inventory" ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                }}
              >
                🏪 Shop Inventory ({shopUnitsCount})
              </button>
            </div>
          )}
          {isRegistered && <span className="registered-badge">VAT Registered</span>}
          {onLockWorkspace && (
            <button className="secondary-sm" onClick={onLockWorkspace} style={{ marginLeft: 8 }}>
              🔒 Lock / Switch Account
            </button>
          )}
        </div>
      </div>

      <div className="rhps-body">
        {/* CLEAN GROUPED SIDEBAR */}
        <aside className="rhps-sidebar" style={{ width: 250 }}>
          <nav>
            {handoffNavGroups.map((group) => (
              <div key={group.title} className="rhps-nav-group" style={{ marginBottom: 16 }}>
                <p className="rhps-group-title" style={{ fontSize: 10.5, letterSpacing: "0.06em", color: "#64748b", fontWeight: 800, margin: "12px 12px 6px" }}>
                  {group.title}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={activeTab === item.id ? "active" : ""}
                    onClick={() => {
                      setActiveTab(item.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, padding: "8px 12px", marginBottom: 2 }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge ? <span className="wf-count active">{item.badge}</span> : null}
                    {item.isComingSoon ? <span style={{ fontSize: 9, background: "#fef08a", color: "#854d0e", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>SOON</span> : null}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="rhps-content" ref={mainContentRef}>
          {toastMessage && <div className="rhps-toast">{toastMessage}</div>}

          {/* 1. RHPS OWNER DASHBOARD (EXACT REFERENCE SCREENSHOT UI/UX) */}
          {activeTab === "dashboard" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* TOP HEADER */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>RHPS Owner Dashboard</h1>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0 0 0" }}>
                    2026-08-02 · Pag-open nimo, kabalo dayon ka asa ka padulong.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {/* ⚡ QUICK ACTIONS BOX WITH BLACK BORDER LINES */}
                  <div style={{ backgroundColor: "#ffffff", border: "2px solid #000000", borderRadius: "10px", padding: "0.6rem 0.9rem", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 900, color: "#0f172a", marginBottom: 6, display: "flex", alignItems: "center", gap: 4, letterSpacing: "0.5px" }}>
                      <span>⚡</span> QUICK ACTIONS
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <button onClick={openCreateLeadModal} style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #000000", borderRadius: 6, padding: "0.45rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ New Customer</button>
                      <button onClick={() => setActiveTab("schedule")} style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #000000", borderRadius: 6, padding: "0.45rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ New Schedule</button>
                      <button onClick={openCreateRepairModal} style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #000000", borderRadius: 6, padding: "0.45rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ General Repair</button>
                      <button onClick={() => setActiveTab("trade_in")} style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #000000", borderRadius: 6, padding: "0.45rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ Trade-In / Sale</button>
                      <button onClick={() => setActiveTab("quotations")} style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #000000", borderRadius: 6, padding: "0.45rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ Quotation</button>
                      <button onClick={() => setActiveTab("payments")} style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #000000", borderRadius: 6, padding: "0.45rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ Payment</button>
                      <button onClick={() => setActiveTab("inventory")} style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #000000", borderRadius: 6, padding: "0.45rem 0.85rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ Inventory</button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={() => setActiveTab("crm_leads")}
                      style={{ background: "#0f172a", color: "#ffffff", border: "2px solid #000000", borderRadius: "18px", padding: "0.45rem 1.1rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      CRM Leads
                    </button>
                    <button
                      onClick={() => onLockWorkspace && onLockWorkspace()}
                      style={{ background: "#f59e0b", color: "#ffffff", border: "2px solid #000000", borderRadius: "18px", padding: "0.45rem 1.1rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Public Website
                    </button>
                  </div>
                </div>
              </div>

              {/* ⚠️ ALERTS (Action Required) RED CONTAINER */}
              <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "14px", padding: "1rem 1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                  <strong style={{ color: "#dc2626", fontSize: "0.95rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span>⚠️</span> ALERTS (Action Required)
                  </strong>
                  <span
                    onClick={() => { setActiveTab("follow_ups"); showToast("🔔 Navigating to Follow-Ups & Alerts"); }}
                    style={{ fontSize: "0.8rem", color: "#dc2626", fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}
                  >
                    View All Alerts &gt;
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <div
                    onClick={() => { setActiveTab("schedule"); showToast("📅 Navigating to Schedule for Juan Dela Cruz"); }}
                    style={{ backgroundColor: "#ffffff", border: "1px solid #ffe4e6", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>📅</span>
                    <div>
                      <strong style={{ fontSize: "0.82rem", display: "block", color: "#0f172a" }}>Juan rescheduled to Aug 12</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Today 10:30 AM</span>
                      <span style={{ display: "inline-block", marginTop: 4, background: "#fee2e2", color: "#991b1b", fontSize: "0.65rem", fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>Rescheduled</span>
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab("schedule"); showToast("📅 Navigating to Schedule for Maria Santos"); }}
                    style={{ backgroundColor: "#ffffff", border: "1px solid #ffe4e6", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>❌</span>
                    <div>
                      <strong style={{ fontSize: "0.82rem", display: "block", color: "#0f172a" }}>Maria cancelled today's booking</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Today 2:00 PM</span>
                      <span style={{ display: "inline-block", marginTop: 4, background: "#ffffff", color: "#dc2626", border: "1px solid #fca5a5", fontSize: "0.65rem", fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>Cancelled</span>
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab("repairs"); showToast("🔧 Navigating to Repairs for Pedro Reyes"); }}
                    style={{ backgroundColor: "#ffffff", border: "1px solid #ffe4e6", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>❓</span>
                    <div>
                      <strong style={{ fontSize: "0.82rem", display: "block", color: "#0f172a" }}>Pedro waiting for approval</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>General Repair</span>
                      <span style={{ display: "inline-block", marginTop: 4, background: "#fef3c7", color: "#92400e", fontSize: "0.65rem", fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>Pending Approval</span>
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab("trips"); showToast("🚐 Navigating to Upcoming Trips"); }}
                    style={{ backgroundColor: "#ffffff", border: "1px solid #ffe4e6", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>🚐</span>
                    <div>
                      <strong style={{ fontSize: "0.82rem", display: "block", color: "#0f172a" }}>Butuan trip incomplete</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Aug 6 - Aug 7</span>
                      <span style={{ display: "inline-block", marginTop: 4, background: "#fef08a", color: "#854d0e", fontSize: "0.65rem", fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>2 not confirmed</span>
                    </div>
                  </div>

                  <div
                    onClick={() => { setActiveTab("inventory"); showToast("🎹 Navigating to Inventory for Yamaha U3"); }}
                    style={{ backgroundColor: "#ffffff", border: "1px solid #ffe4e6", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>🎹</span>
                    <div>
                      <strong style={{ fontSize: "0.82rem", display: "block", color: "#0f172a" }}>Yamaha U3 reserved</strong>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>For ABC School</span>
                      <span style={{ display: "inline-block", marginTop: 4, background: "#ffedd5", color: "#c2410c", fontSize: "0.65rem", fontWeight: 800, padding: "1px 6px", borderRadius: 4 }}>Reserved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP 4 KPI METRICS GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <div onClick={() => { setActiveTab("crm_leads"); showToast("👥 Navigating to CRM Leads"); }} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>New Website Leads</span>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>3</div>
                    <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>2 new today</span>
                  </div>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#eff6ff", color: "#2563eb", fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>👥</div>
                </div>

                <div onClick={() => { setActiveTab("schedule"); showToast("📅 Navigating to Schedule"); }} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Today's Appointments</span>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>3</div>
                    <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>2 confirmed</span>
                  </div>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#f0fdf4", color: "#16a34a", fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>📅</div>
                </div>

                <div onClick={() => { setActiveTab("schedule"); showToast("🕒 Navigating to Pending Schedules"); }} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Pending Confirmation</span>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>1</div>
                    <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 600 }}>Needs confirmation</span>
                  </div>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#fffbeb", color: "#d97706", fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>🕒</div>
                </div>

                <div onClick={() => { setActiveTab("inventory"); showToast("🎹 Navigating to Piano Inventory"); }} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Available Pianos</span>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>7</div>
                    <span style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600 }}>Total available</span>
                  </div>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#f3e8ff", color: "#7c3aed", fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>🎹</div>
                </div>
              </div>

              {/* MIDDLE TWO-COLUMN SCHEDULE CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* TODAY'S SCHEDULE */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>📅 TODAY'S SCHEDULE</strong>
                    <span onClick={() => setActiveTab("schedule")} style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}>View Calendar</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <strong>09:00 AM ●</strong> <span style={{ marginLeft: 6 }}>Juan Dela Cruz</span>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>Piano Tuning · Talomo, Davao City</span>
                      </div>
                      <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>Confirmed</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div>
                        <strong>10:30 AM ●</strong> <span style={{ marginLeft: 6 }}>ABC School</span>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>Inspection · Matina, Davao City</span>
                      </div>
                      <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>Pending</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", padding: "0.5rem 0" }}>
                      <div>
                        <strong>02:00 PM ●</strong> <span style={{ marginLeft: 6 }}>Hotel Marco</span>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>Piano Check · Roxas Ave., Davao City</span>
                      </div>
                      <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>Confirmed</span>
                    </div>
                  </div>
                  <small style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: 8, display: "block" }}>3 appointments today</small>
                </div>

                {/* UPCOMING SCHEDULE */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>📅 UPCOMING SCHEDULE</strong>
                    <span onClick={() => setActiveTab("schedule")} style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}>View All Schedule</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: "0.78rem" }}>
                    <div>
                      <strong style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase" }}>Tomorrow</strong>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div>● Aug 3 - 9:00 AM<br /><span style={{ color: "#334155", fontWeight: 600 }}>Maria Santos</span></div>
                        <div>● Aug 3 - 1:00 PM<br /><span style={{ color: "#334155", fontWeight: 600 }}>Pedro Reyes</span></div>
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase" }}>This Week</strong>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div>● Aug 5 - 10:00 AM<br /><span style={{ color: "#334155", fontWeight: 600 }}>Davao Doctors Hospital</span></div>
                        <div>● Aug 6 - 8:00 AM<br /><span style={{ color: "#334155", fontWeight: 600 }}>Butuan Trip (2)</span></div>
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase" }}>Next Week</strong>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div>● Aug 11 - 2:00 PM<br /><span style={{ color: "#334155", fontWeight: 600 }}>Amor Residence</span></div>
                        <div>● Aug 12 - 10:30 AM<br /><span style={{ color: "#334155", fontWeight: 600 }}>Juan Dela Cruz</span> <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.62rem", padding: "1px 4px", borderRadius: 3 }}>Rescheduled</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE TWO-COLUMN TABLE CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* ONGOING GENERAL REPAIRS */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>🔧 ONGOING GENERAL REPAIRS</strong>
                    <span onClick={() => setActiveTab("repairs")} style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}>View All Repairs</span>
                  </div>

                  <table style={{ width: "100%", fontSize: "0.78rem", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "4px 0" }}>Customer</th>
                        <th>Piano</th>
                        <th>Current Stage</th>
                        <th>Next Action</th>
                        <th style={{ textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 0", fontWeight: 700 }}>Pedro Reyes</td>
                        <td>Yamaha U3</td>
                        <td>Waiting Parts</td>
                        <td>Replace hammers</td>
                        <td style={{ textAlign: "right" }}><span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Waiting Parts</span></td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 0", fontWeight: 700 }}>Maria Santos</td>
                        <td>Kawai KU-2</td>
                        <td>Disassembly</td>
                        <td>Clean & Inspect</td>
                        <td style={{ textAlign: "right" }}><span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>In Progress</span></td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 0", fontWeight: 700 }}>ABC School</td>
                        <td>Yamaha U1</td>
                        <td>Reassembly</td>
                        <td>Regulate action</td>
                        <td style={{ textAlign: "right" }}><span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>In Progress</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", fontWeight: 700 }}>Hotel Marco</td>
                        <td>Pearl River GP</td>
                        <td>Testing</td>
                        <td>Tonal voicing</td>
                        <td style={{ textAlign: "right" }}><span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Return Visit</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TRADE-IN / NEW PIANO OPPORTUNITIES */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>📋 TRADE-IN / NEW PIANO OPPORTUNITIES</strong>
                    <span onClick={() => setActiveTab("trade_in")} style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}>View All Opportunities</span>
                  </div>

                  <table style={{ width: "100%", fontSize: "0.78rem", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "4px 0" }}>Customer</th>
                        <th>Current Piano / Need</th>
                        <th>Interest</th>
                        <th>Next Step</th>
                        <th style={{ textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 0", fontWeight: 700 }}>Juan Dela Cruz</td>
                        <td>Old Kimball Upright</td>
                        <td>Trade-In</td>
                        <td>Evaluate trade-in value</td>
                        <td style={{ textAlign: "right" }}><span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>For Follow-up</span></td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 0", fontWeight: 700 }}>Maria Santos</td>
                        <td>Needs Upright Piano</td>
                        <td>Buy New</td>
                        <td>Show Yamaha U3</td>
                        <td style={{ textAlign: "right" }}><span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Active</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "6px 0", fontWeight: 700 }}>Pedro Reyes</td>
                        <td>Too costly to repair</td>
                        <td>Buy New</td>
                        <td>Send options & price</td>
                        <td style={{ textAlign: "right" }}><span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOTTOM 5 MINI-WIDGET CARDS GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {/* WIDGET 1: LEADS */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6 }}>
                    <strong style={{ color: "#0f172a" }}>👥 LATEST WEBSITE LEADS</strong>
                    <span onClick={() => setActiveTab("crm_leads")} style={{ color: "#2563eb", cursor: "pointer" }}>View All</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div>1. Alex Garcia <span style={{ color: "#94a3b8" }}>Aug 2 - 8:45 AM</span> <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>New</span></div>
                    <div>2. Jenny Lim <span style={{ color: "#94a3b8" }}>Aug 2 - 10:20 AM</span> <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>New</span></div>
                    <div>3. Mark Anthony <span style={{ color: "#94a3b8" }}>Aug 2 - 11:05 AM</span> <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>Contacted</span></div>
                  </div>
                </div>

                {/* WIDGET 2: QUOTATIONS */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6 }}>
                    <strong style={{ color: "#0f172a" }}>📑 PENDING QUOTATIONS</strong>
                    <span onClick={() => setActiveTab("quotations")} style={{ color: "#2563eb", cursor: "pointer" }}>View All</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div>● ABC School <span style={{ color: "#94a3b8" }}>Aug 1</span> <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>Draft</span></div>
                    <div>● Maria Santos <span style={{ color: "#94a3b8" }}>Jul 31</span> <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>Waiting Approval</span></div>
                    <div>● Pedro Reyes <span style={{ color: "#94a3b8" }}>Jul 30</span> <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>Waiting Approval</span></div>
                  </div>
                </div>

                {/* WIDGET 3: PAYMENTS TO COLLECT */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6 }}>
                    <strong style={{ color: "#0f172a" }}>💰 PAYMENTS TO COLLECT</strong>
                    <span onClick={() => setActiveTab("payments")} style={{ color: "#2563eb", cursor: "pointer" }}>View All</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div>● Hotel Marco <strong>₱12,000</strong> <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>Overdue</span></div>
                    <div>● ABC School <strong>₱8,500</strong> <span style={{ background: "#fef08a", color: "#854d0e", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>Due Today</span></div>
                    <div>● Maria Santos <strong>₱5,000</strong> <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>Due This Week</span></div>
                  </div>
                </div>

                {/* WIDGET 4: TRIPS */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6 }}>
                    <strong style={{ color: "#0f172a" }}>🚐 UPCOMING TRIPS</strong>
                    <span onClick={() => setActiveTab("trips")} style={{ color: "#2563eb", cursor: "pointer" }}>View All</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div>● Butuan Trip <span style={{ color: "#94a3b8" }}>Aug 6 - Aug 7</span> <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>2 Pending</span></div>
                    <div>● Tagum Trip <span style={{ color: "#94a3b8" }}>Aug 13</span> <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>1 Pending</span></div>
                    <div>● Digos Trip <span style={{ color: "#94a3b8" }}>Aug 20</span> <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.6rem", padding: "1px 4px", borderRadius: 3 }}>TBD</span></div>
                  </div>
                </div>

                {/* WIDGET 5: INVENTORY SUMMARY */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6 }}>
                    <strong style={{ color: "#0f172a" }}>🎹 INVENTORY SUMMARY</strong>
                    <span onClick={() => setActiveTab("inventory")} style={{ color: "#2563eb", cursor: "pointer" }}>View Inventory</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", marginTop: 8 }}>
                    <div>
                      <strong style={{ fontSize: "1.2rem", color: "#16a34a", display: "block" }}>7</strong>
                      <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Available</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: "1.2rem", color: "#d97706", display: "block" }}>3</strong>
                      <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Reserved</span>
                    </div>
                    <div>
                      <strong style={{ fontSize: "1.2rem", color: "#2563eb", display: "block" }}>5</strong>
                      <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Sold</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTIONS ROW (FOLLOW UPS) */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                  <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>🔔 FOLLOW UPS</strong>
                  <span onClick={() => setActiveTab("follow_ups")} style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}>View All</span>
                </div>
                <div style={{ fontSize: "0.78rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                  <div style={{ padding: "0.6rem 0.8rem", background: "#fff1f2", borderRadius: 8, border: "1px solid #fecdd3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#991b1b", display: "block" }}>Due Today</strong>
                      <span style={{ color: "#334155" }}>● Follow up: Juan Dela Cruz (Reschedule confirmation)</span>
                    </div>
                    <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: "0.62rem", padding: "2px 8px", borderRadius: 4, fontWeight: 800 }}>High</span>
                  </div>
                  <div style={{ padding: "0.6rem 0.8rem", background: "#fffbeb", borderRadius: 8, border: "1px solid #fef3c7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#92400e", display: "block" }}>Due This Week</strong>
                      <span style={{ color: "#334155" }}>● Follow up: Pedro Reyes (Quotation approval)</span>
                    </div>
                    <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.62rem", padding: "2px 8px", borderRadius: 4, fontWeight: 800 }}>Medium</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CRM LEADS */}
          {activeTab === "crm_leads" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0 }}>CRM Leads</h2>
                  <p className="subtitle" style={{ margin: "4px 0 0" }}>
                    Capture new leads with all required contact, inquiry, scheduling, and follow-up details.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={openCreateLeadModal}
                >
                  ＋ Add Lead
                </button>
              </div>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Date Created</th>
                    <th>Lead Source</th>
                    <th>Customer Name</th>
                    <th>Contact Number</th>
                    <th>Location / City</th>
                    <th>Inquiry Type</th>
                    <th>Piano Type</th>
                    <th>Main Concern</th>
                    <th>Preferred Schedule</th>
                    <th>Status</th>
                    <th>Next Action</th>
                    <th>Assigned Owner</th>
                    <th>Follow-Up</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        No inventory units found under <strong>{inventoryCategoryFilter}</strong>.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((inv) => {
                      const isPersonal = (inv.inventoryCategory || "Shop Inventory") === "Personal Inventory";
                      return (
                        <tr key={inv.id}>
                          <td><strong>{inv.id}</strong></td>
                          <td>
                            {isPersonal ? (
                              <span style={{ background: "#f3e8ff", color: "#7e22ce", border: "1px solid #d8b4fe", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                👤 Personal
                              </span>
                            ) : (
                              <span style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                🏪 Shop
                              </span>
                            )}
                          </td>
                          <td>
                            <div><strong>{inv.brand} {inv.model}</strong></div>
                            {inv.notes && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{inv.notes}</div>}
                          </td>
                          <td>{inv.serialNumber}</td>
                          <td>{inv.condition}</td>
                          <td>₱{inv.price.toLocaleString()}</td>
                          <td>{inv.status}</td>
                          <td style={{ fontSize: 12 }}>
                            {inv.reservedBy ? (
                              <>
                                <div><strong>{inv.reservedBy}</strong></div>
                                <div style={{ color: "#64748b" }}>Until: {inv.reservedUntil || "N/A"}</div>
                              </>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>None</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {inv.soldTo ? (
                              <>
                                <div><strong>{inv.soldTo}</strong></div>
                                <div style={{ color: "#64748b" }}>Date: {inv.soldDate || "N/A"}</div>
                              </>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>Not Sold</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12 }}>{inv.photos?.length || 0} photo(s)</td>
                          <td>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                              <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => openEditInventoryModal(inv)}>
                                ✏️ Edit Details
                              </button>
                              <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => openEditInventoryModal(inv)}>
                                📷 Upload Photos
                              </button>
                              {inv.status !== "Reserved" && inv.status !== "Sold" && (
                                <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#dbeafe", border: "1px solid #93c5fd", color: "#1d4ed8" }} onClick={() => openReserveInventoryModal(inv)}>
                                  🔒 Reserve
                                </button>
                              )}
                              {inv.status === "Reserved" && (
                                <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }} onClick={() => openReleaseReservationModal(inv)}>
                                  🔓 Release Reservation
                                </button>
                              )}
                              {inv.status !== "Sold" && (
                                <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }} onClick={() => openMarkSoldModal(inv)}>
                                  ✅ Mark Sold
                                </button>
                              )}
                              <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#ede9fe", border: "1px solid #c4b5fd", color: "#5b21b6" }} onClick={() => openAdjustPriceModal(inv)}>
                                💰 Adjust Price
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. CUSTOMER MANAGEMENT MODULE */}
          {activeTab === "customers" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>👥 Customer Directory & Linked Pianos</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Manage customer accounts, contact channels, addresses, and linked piano instruments.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={openAddCustomerModal}
                >
                  ＋ Add New Customer
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Customers</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{customers.length} Accounts</div>
                  <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>🟢 Active Davao Directory</span>
                </div>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Repeat Clients</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#2563eb", margin: "4px 0" }}>
                    {customers.filter((c) => c.customerType === "Repeat").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Loyal Piano Owners</span>
                </div>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>New Clients</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {customers.filter((c) => c.customerType === "New").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Registered This Year</span>
                </div>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Linked Pianos</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#7c3aed", margin: "4px 0" }}>
                    {customers.reduce((sum, c) => sum + (c.pianos?.length || c.linkedPianoIds?.length || 0), 0)} Pianos
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Registered Instruments</span>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, background: "#e1e2e4", padding: 4, borderRadius: 10 }}>
                  {(["All", "New", "Old"] as const).map((tab) => (
                    <button
                      key={tab}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background: customerFilter === tab ? "#0f172a" : "transparent",
                        color: customerFilter === tab ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setCustomerFilter(tab)}
                    >
                      {tab === "All" ? "All Customers" : `${tab} Customers`}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Search customer name, contact, address, or FB name..."
                  className="input-field"
                  style={{ maxWidth: 320, padding: "8px 14px", fontSize: 13 }}
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>

              {/* CUSTOMER DIRECTORY TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0, borderRadius: 0, border: "none" }}>
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Full Name</th>
                      <th>Contact Channels</th>
                      <th>City / Complete Address</th>
                      <th>Type</th>
                      <th>Linked Piano(s)</th>
                      <th>Dates (Created / Updated)</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter((c) => {
                        if (customerFilter === "New" && c.customerType !== "New") return false;
                        if (customerFilter === "Old" && (c.customerType !== "Old" && c.customerType !== "Repeat")) return false;
                        if (customerSearch) {
                          const q = customerSearch.toLowerCase();
                          return (
                            c.name.toLowerCase().includes(q) ||
                            c.contactNumber.includes(q) ||
                            c.completeAddress.toLowerCase().includes(q) ||
                            (c.facebookName && c.facebookName.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      })
                      .map((c) => (
                        <tr key={c.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedCustomerDetail(c)}
                            >
                              {c.id}
                            </button>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13.5, color: "#0f172a", display: "block" }}>{c.name}</strong>
                            {c.facebookName && (
                              <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>
                                {c.facebookLink ? (
                                  <a href={c.facebookLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                                    🌐 FB: {c.facebookName}
                                  </a>
                                ) : (
                                  <span>👤 FB: {c.facebookName}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            <div>📞 <strong>{c.contactNumber}</strong></div>
                            {c.alternateContactNumber && (
                              <div style={{ fontSize: 11, color: "#64748b" }}>Alt: {c.alternateContactNumber}</div>
                            )}
                            {c.email && (
                              <div style={{ fontSize: 11, color: "#059669" }}>✉️ {c.email}</div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>{c.cityArea || "Davao City"}</div>
                            <div style={{ fontSize: 11.5, color: "#64748b" }}>{c.completeAddress}</div>
                            {c.gmapsLink ? (
                              <div style={{ marginTop: 2 }}>
                                <a href={c.gmapsLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontSize: "0.72rem", fontWeight: 700, textDecoration: "underline" }}>
                                  📍 GMaps Pin
                                </a>
                              </div>
                            ) : c.landmark ? (
                              <div style={{ fontSize: 10.5, color: "#d97706", fontStyle: "italic" }}>📍 {c.landmark}</div>
                            ) : null}
                          </td>
                          <td>
                            <span
                              style={{
                                background: c.customerType === "Old" || c.customerType === "Repeat" ? "#dbeafe" : "#dcfce7",
                                color: c.customerType === "Old" || c.customerType === "Repeat" ? "#1e40af" : "#15803d",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {c.customerType === "Old" || c.customerType === "Repeat" ? "Old Customer" : "New Customer"}
                            </span>
                          </td>
                          <td>
                            {c.pianos && c.pianos.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {c.pianos.map((p) => (
                                  <span key={p.id} style={{ fontSize: 11, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontWeight: 700, color: "#334155" }}>
                                    🎹 {p.brand} {p.model} ({p.pianoType})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                {c.linkedPianoIds.length} Linked (P-101)
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Created: <strong>{c.createdDate}</strong></div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Updated: <strong>{c.lastUpdatedDate}</strong></div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 8px" }}
                                onClick={() => setSelectedCustomerDetail(c)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 8px" }}
                                onClick={() => openEditCustomerModal(c)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. ESTIMATES MODULE */}
          {activeTab === "estimates" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>📐 Estimates & Preliminary Cost Assessments</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Manage preliminary estimates linked to leads, Remote vs On-Site basis, validity dates, and 1-click conversion to formal quotations.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateEstimateModal()}
                >
                  ＋ Create New Estimate
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Estimates</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{estimates.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📑 Active Preliminary Assessments</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Approved & Ready</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {estimates.filter((e) => e.status === "Approved").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>⚡ Ready to Convert to Quotation</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sent / Awaiting Client</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    {estimates.filter((e) => e.status === "Sent to Customer").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>📲 Client Reviewing Proposal</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Estimated Amount</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>
                    ₱{Math.round(estimates.reduce((acc, e) => acc + e.estimatedAmount, 0) / (estimates.length || 1)).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Based on registered estimates</span>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Draft", "Sent to Customer", "Approved", "Declined", "Revision Requested", "Converted to Quotation"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: estimateFilter === st ? "#0f172a" : "#ffffff",
                        color: estimateFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setEstimateFilter(st)}
                    >
                      {st === "All" ? "All Estimates" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Estimate No, Customer, Piano..."
                    value={estimateSearch}
                    onChange={(e) => setEstimateSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* ESTIMATES TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Estimate No. & Date</th>
                      <th>Linked Lead</th>
                      <th>Customer & Location</th>
                      <th>Piano Instrument</th>
                      <th>Scope & Concern</th>
                      <th>Basis & Validity</th>
                      <th>Estimated Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Estimate Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates
                      .filter((e) => {
                        if (estimateFilter !== "All" && e.status !== estimateFilter) return false;
                        if (estimateSearch) {
                          const q = estimateSearch.toLowerCase();
                          return (
                            e.id.toLowerCase().includes(q) ||
                            e.customerName.toLowerCase().includes(q) ||
                            e.pianoBrandTypeModelSerial.toLowerCase().includes(q) ||
                            e.leadId.toLowerCase().includes(q) ||
                            e.serviceLocation.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((est) => (
                        <tr key={est.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedEstimateDetail(est)}
                            >
                              {est.id}
                            </button>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Date: {est.date}</div>
                          </td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              🔗 {est.leadId}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{est.customerName}</strong>
                            <div style={{ fontSize: 11, color: "#64748b" }}>📞 {est.contactNumber}</div>
                            <div style={{ fontSize: 11, color: "#475569" }}>📍 {est.serviceLocation}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0f172a" }}>🎹 {est.pianoBrandTypeModelSerial}</strong>
                            {est.photosVideoReviewed === "Yes" && (
                              <div style={{ fontSize: 10.5, color: "#059669", fontWeight: 700 }}>📷 Photos/Video Reviewed</div>
                            )}
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{est.recommendedScope}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Concern: {est.mainConcern}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background: est.estimateBasis === "On-Site" ? "#dcfce7" : "#e0f2fe",
                                color: est.estimateBasis === "On-Site" ? "#15803d" : "#0369a1",
                                padding: "2px 8px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 800,
                                display: "inline-block",
                                marginBottom: 2,
                              }}
                            >
                              {est.estimateBasis === "On-Site" ? "📍 On-Site Inspection" : "📱 Remote Assessment"}
                            </span>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Valid until: <strong>{est.validityDate}</strong></div>
                          </td>
                          <td>
                            <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>₱{est.estimatedAmount.toLocaleString()}</div>
                            {est.estimatedAmountRange && (
                              <div style={{ fontSize: 11, color: "#64748b" }}>Range: {est.estimatedAmountRange}</div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  est.status === "Approved"
                                    ? "#dcfce7"
                                    : est.status === "Converted to Quotation"
                                      ? "#dbeafe"
                                      : est.status === "Sent to Customer"
                                        ? "#fef3c7"
                                        : est.status === "Declined"
                                          ? "#fee2e2"
                                          : est.status === "Revision Requested"
                                            ? "#ffedd5"
                                            : "#f1f5f9",
                                color:
                                  est.status === "Approved"
                                    ? "#15803d"
                                    : est.status === "Converted to Quotation"
                                      ? "#1e40af"
                                      : est.status === "Sent to Customer"
                                        ? "#92400e"
                                        : est.status === "Declined"
                                          ? "#991b1b"
                                          : est.status === "Revision Requested"
                                            ? "#c2410c"
                                            : "#475569",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {est.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {/* ACTION 1: SEND TO CUSTOMER */}
                              {(est.status === "Draft" || est.status === "Revision Requested") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontWeight: 700 }}
                                  onClick={() => {
                                    setEstimates(estimates.map((e) => e.id === est.id ? { ...e, status: "Sent to Customer" } : e));
                                    showToast(`📨 Estimate ${est.id} sent to ${est.customerName}!`);
                                  }}
                                >
                                  📲 Send
                                </button>
                              )}

                              {/* ACTION 2: APPROVE */}
                              {est.status === "Sent to Customer" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 700 }}
                                  onClick={() => {
                                    setEstimates(estimates.map((e) => e.id === est.id ? { ...e, status: "Approved" } : e));
                                    showToast(`✅ Estimate ${est.id} Approved by ${est.customerName}!`);
                                  }}
                                >
                                  ✓ Approve
                                </button>
                              )}

                              {/* ACTION 3: DECLINE */}
                              {est.status === "Sent to Customer" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontWeight: 700 }}
                                  onClick={() => {
                                    setEstimates(estimates.map((e) => e.id === est.id ? { ...e, status: "Declined" } : e));
                                    showToast(`❌ Estimate ${est.id} marked as Declined.`);
                                  }}
                                >
                                  ✕ Decline
                                </button>
                              )}

                              {/* ACTION 4: REQUEST REVISION */}
                              {(est.status === "Sent to Customer" || est.status === "Approved") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa", fontWeight: 700 }}
                                  onClick={() => {
                                    setEstimates(estimates.map((e) => e.id === est.id ? { ...e, status: "Revision Requested" } : e));
                                    showToast(`🔄 Revision requested for Estimate ${est.id}`);
                                  }}
                                >
                                  🔄 Revision
                                </button>
                              )}
                               {est.status !== "Converted to Quotation" && (
                                  <select
                                    className="secondary-sm"
                                    style={{ fontSize: 10.5, padding: "3px 8px", background: "#0f172a", color: "#ffffff", border: "none", fontWeight: 800, borderRadius: 6, cursor: "pointer" }}
                                    value=""
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "ESTIMATES") {
                                        setEstimates(estimates.map((eItem) => (eItem.id === est.id ? { ...eItem, status: "Draft" } : eItem)));
                                        showToast(`📐 ${est.id} kept in ESTIMATES status.`);
                                      } else if (val === "QUOTATION") {
                                        handleConvertToQuotation(est);
                                      } else if (val === "JOB ORDER") {
                                        handleConvertEstimateDirectToJobOrder(est);
                                      }
                                    }}
                                  >
                                    <option value="" disabled>⚡ CATEGORY...</option>
                                    <option value="ESTIMATES" style={{ background: "#ffffff", color: "#0f172a" }}>📐 ESTIMATES</option>
                                    <option value="QUOTATION" style={{ background: "#ffffff", color: "#0f172a" }}>📄 QUOTATION</option>
                                    <option value="JOB ORDER" style={{ background: "#ffffff", color: "#0f172a" }}>🛠️ JOB ORDER</option>
                                  </select>
                                )}

                              {/* INSPECT & EDIT */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => setSelectedEstimateDetail(est)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditEstimateModal(est)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. QUOTATIONS MODULE */}
          {activeTab === "quotations" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>📝 Formal Binding Quotations</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Formal service proposals linked to estimates. Strict Workflow: Approved Quotation → Convert to Customer Case → Schedule.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateQuotationModal()}
                >
                  ＋ Create New Quotation
                </button>
              </div>

              {/* KEY WORKFLOW NOTICE BANNER */}
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: 14, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "#1e40af" }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
                <div>
                  <strong style={{ display: "block", color: "#1e3a8a" }}>Operational Sequence Safeguard:</strong>
                  Approved Quotation ➔ <strong>Convert to Customer Case</strong> ➔ <strong>Schedule</strong> (Does NOT jump straight to Job Order).
                </div>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Quotations</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{quotations.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📄 Active Formal Proposals</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Approved & Awaiting Case</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {quotations.filter((q) => q.status === "Approved").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>⚡ Ready to Convert to Customer Case</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sent for Approval</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    {quotations.filter((q) => q.status === "Sent for Approval").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>📲 Client Reviewing Contract</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Quoted Value</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>
                    ₱{quotations.reduce((acc, q) => acc + q.approvedQuotedAmount, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Sum of active binding quotes</span>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Draft", "Sent for Approval", "Approved", "Declined", "Revision Needed", "Converted to Customer Case"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: quotationFilter === st ? "#0f172a" : "#ffffff",
                        color: quotationFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setQuotationFilter(st)}
                    >
                      {st === "All" ? "All Quotations" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Quotation No, Customer, Piano..."
                    value={quotationSearch}
                    onChange={(e) => setQuotationSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* QUOTATIONS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Quotation No. & Rev</th>
                      <th>Linked Estimate</th>
                      <th>Customer & Location</th>
                      <th>Piano Instrument</th>
                      <th>Proposed Scope of Work</th>
                      <th>Quoted Amount & Terms</th>
                      <th>Validity</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Quotation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations
                      .filter((q) => {
                        if (quotationFilter !== "All" && q.status !== quotationFilter) return false;
                        if (quotationSearch) {
                          const query = quotationSearch.toLowerCase();
                          return (
                            q.id.toLowerCase().includes(query) ||
                            q.customerName.toLowerCase().includes(query) ||
                            q.pianoBrandTypeModelSerial.toLowerCase().includes(query) ||
                            q.estimateId.toLowerCase().includes(query) ||
                            q.serviceLocation.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      })
                      .map((qt) => (
                        <tr key={qt.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedQuotationDetail(qt)}
                            >
                              {qt.id}
                            </button>
                            <span style={{ display: "inline-block", marginLeft: 6, background: "#f1f5f9", color: "#475569", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              {qt.revisionNo}
                            </span>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Date: {qt.date}</div>
                          </td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              🔗 {qt.estimateId}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{qt.customerName}</strong>
                            <div style={{ fontSize: 11, color: "#64748b" }}>📞 {qt.contactNumber}</div>
                            <div style={{ fontSize: 11, color: "#475569" }}>📍 {qt.serviceLocation}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0f172a" }}>🎹 {qt.pianoBrandTypeModelSerial}</strong>
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{qt.proposedScope}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>₱{qt.approvedQuotedAmount.toLocaleString()}</div>
                            <div style={{ fontSize: 10.5, color: "#2563eb", fontWeight: 700 }}>Dep: ₱{qt.depositRequired.toLocaleString()}</div>
                            <div style={{ fontSize: 10.5, color: "#64748b" }}>{qt.balanceTerms}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Valid until: <strong>{qt.validityDate}</strong></div>
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  qt.status === "Approved"
                                    ? "#dcfce7"
                                    : qt.status === "Converted to Customer Case"
                                      ? "#dbeafe"
                                      : qt.status === "Sent for Approval"
                                        ? "#fef3c7"
                                        : qt.status === "Declined"
                                          ? "#fee2e2"
                                          : qt.status === "Revision Needed"
                                            ? "#ffedd5"
                                            : "#f1f5f9",
                                color:
                                  qt.status === "Approved"
                                    ? "#15803d"
                                    : qt.status === "Converted to Customer Case"
                                      ? "#1e40af"
                                      : qt.status === "Sent for Approval"
                                        ? "#92400e"
                                        : qt.status === "Declined"
                                          ? "#991b1b"
                                          : qt.status === "Revision Needed"
                                            ? "#c2410c"
                                            : "#475569",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {qt.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {/* ACTION 1: SEND FOR APPROVAL */}
                              {(qt.status === "Draft" || qt.status === "Revision Needed") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontWeight: 700 }}
                                  onClick={() => {
                                    setQuotations(quotations.map((q) => q.id === qt.id ? { ...q, status: "Sent for Approval" } : q));
                                    showToast(`📨 Quotation ${qt.id} sent to ${qt.customerName} for approval!`);
                                  }}
                                >
                                  📲 Send for Approval
                                </button>
                              )}

                              {/* ACTION 2: APPROVE */}
                              {qt.status === "Sent for Approval" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 700 }}
                                  onClick={() => {
                                    setQuotations(quotations.map((q) => q.id === qt.id ? { ...q, status: "Approved" } : q));
                                    showToast(`✅ Quotation ${qt.id} Approved by ${qt.customerName}!`);
                                  }}
                                >
                                  ✓ Approve
                                </button>
                              )}

                              {/* ACTION 3: DECLINE */}
                              {qt.status === "Sent for Approval" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontWeight: 700 }}
                                  onClick={() => {
                                    setQuotations(quotations.map((q) => q.id === qt.id ? { ...q, status: "Declined" } : q));
                                    showToast(`❌ Quotation ${qt.id} marked as Declined.`);
                                  }}
                                >
                                  ✕ Decline
                                </button>
                              )}

                              {/* ACTION 4: REVISE (REV-01 -> REV-02) */}
                              {(qt.status === "Sent for Approval" || qt.status === "Approved") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa", fontWeight: 700 }}
                                  onClick={() => handleReviseQuotation(qt)}
                                >
                                  🔄 Revise ({qt.revisionNo})
                                </button>
                              )}

{/* ACTION 5: CONVERT DROPDOWN SELECTION */}
                               {qt.status !== "Converted to Customer Case" && (
                                  <select
                                    className="secondary-sm"
                                    style={{ fontSize: 10.5, padding: "3px 8px", background: "#0f172a", color: "#ffffff", border: "none", fontWeight: 800, borderRadius: 6, cursor: "pointer" }}
                                    value=""
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "ESTIMATES") {
                                        setQuotations(quotations.map((qItem) => (qItem.id === qt.id ? { ...qItem, status: "Draft" } : qItem)));
                                        showToast(`📐 ${qt.id} moved to ESTIMATES category.`);
                                      } else if (val === "QUOTATION") {
                                        setQuotations(quotations.map((qItem) => (qItem.id === qt.id ? { ...qItem, status: "Sent for Approval" } : qItem)));
                                        showToast(`📄 ${qt.id} kept in QUOTATION category.`);
                                      } else if (val === "JOB ORDER") {
                                        handleConvertQuotationDirectToJobOrder(qt);
                                      } else if (val === "CASE") {
                                        handleConvertToCustomerCase(qt);
                                      }
                                    }}
                                  >
                                    <option value="" disabled>⚡ CATEGORY...</option>
                                    <option value="ESTIMATES" style={{ background: "#ffffff", color: "#0f172a" }}>📐 ESTIMATES</option>
                                    <option value="QUOTATION" style={{ background: "#ffffff", color: "#0f172a" }}>📄 QUOTATION</option>
                                    <option value="JOB ORDER" style={{ background: "#ffffff", color: "#0f172a" }}>🛠️ JOB ORDER</option>
                                    <option value="CASE" style={{ background: "#ffffff", color: "#0f172a" }}>📂 CUSTOMER CASE</option>
                                  </select>
                               )}

                                                             {/* INSPECT & EDIT */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => setSelectedQuotationDetail(qt)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditQuotationModal(qt)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SCHEDULE & SERVICE APPOINTMENTS MODULE */}
          {activeTab === "schedule" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>📅 Schedule & Service Appointments</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Schedule on-site technical appointments for Customer Cases, assign lead technicians, manage rescheduling, and convert to Job Orders.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateScheduleModal()}
                >
                  ＋ Schedule New Appointment
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Appointments</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{schedules.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📅 Scheduled Field Visits</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confirmed & Ready</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {schedules.filter((s) => s.status === "Confirmed").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>⚡ Ready to Convert to Job Order</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Confirmation</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    {schedules.filter((s) => s.status === "Pending Confirmation").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>⏳ Awaiting Client Time Window Approval</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rescheduled Visits</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#c2410c", margin: "4px 0" }}>
                    {schedules.filter((s) => s.status === "Rescheduled").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#c2410c" }}>Adjusted target service dates</span>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Pending Confirmation", "Confirmed", "Rescheduled", "Cancelled", "Converted to Job Order"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: scheduleFilter === st ? "#0f172a" : "#ffffff",
                        color: scheduleFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setScheduleFilter(st)}
                    >
                      {st === "All" ? "All Appointments" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Appointment No, Customer, Location..."
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* SCHEDULE TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Appointment No</th>
                      <th>Linked Case</th>
                      <th>Customer & Service Location</th>
                      <th>Piano Instrument</th>
                      <th>Service Date & Window</th>
                      <th>Assigned Crew</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Schedule Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules
                      .filter((s) => {
                        if (scheduleFilter !== "All" && s.status !== scheduleFilter) return false;
                        if (scheduleSearch) {
                          const query = scheduleSearch.toLowerCase();
                          return (
                            s.id.toLowerCase().includes(query) ||
                            s.customerName.toLowerCase().includes(query) ||
                            s.pianoDetails.toLowerCase().includes(query) ||
                            s.caseId.toLowerCase().includes(query) ||
                            s.serviceLocation.toLowerCase().includes(query) ||
                            s.leadTechnician.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      })
                      .map((sch) => (
                        <tr key={sch.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedScheduleDetail(sch)}
                            >
                              {sch.id}
                            </button>
                            {sch.rescheduledFromDate && (
                              <div style={{ fontSize: 10, color: "#c2410c", fontStyle: "italic" }}>
                                Prev: {sch.rescheduledFromDate}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              🔗 {sch.caseId}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{sch.customerName}</strong>
                            <div style={{ fontSize: 11, color: "#475569" }}>📍 {sch.serviceLocation}</div>
                            {sch.accessParkingTravelNotes && (
                              <div style={{ fontSize: 10.5, color: "#d97706", fontStyle: "italic" }}>🚗 {sch.accessParkingTravelNotes}</div>
                            )}
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0f172a" }}>🎹 {sch.pianoDetails}</strong>
                          </td>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>📅 {sch.serviceDate}</div>
                            <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>⏰ {sch.arrivalWindow}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>🛠️ {sch.leadTechnician} (Lead)</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Assoc: {sch.associates}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  sch.status === "Confirmed"
                                    ? "#dcfce7"
                                    : sch.status === "Converted to Job Order"
                                      ? "#dbeafe"
                                      : sch.status === "Pending Confirmation"
                                        ? "#fef3c7"
                                        : sch.status === "Cancelled"
                                          ? "#fee2e2"
                                          : sch.status === "Rescheduled"
                                            ? "#ffedd5"
                                            : "#f1f5f9",
                                color:
                                  sch.status === "Confirmed"
                                    ? "#15803d"
                                    : sch.status === "Converted to Job Order"
                                      ? "#1e40af"
                                      : sch.status === "Pending Confirmation"
                                        ? "#92400e"
                                        : sch.status === "Cancelled"
                                          ? "#991b1b"
                                          : sch.status === "Rescheduled"
                                            ? "#c2410c"
                                            : "#475569",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {sch.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {/* ACTION 1: CONFIRM */}
                              {sch.status === "Pending Confirmation" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 700 }}
                                  onClick={() => {
                                    setSchedules(schedules.map((s) => s.id === sch.id ? { ...s, status: "Confirmed" } : s));
                                    showToast(`✅ Appointment ${sch.id} Confirmed with ${sch.customerName}!`);
                                  }}
                                >
                                  ✓ Confirm
                                </button>
                              )}

                              {/* ACTION 2: RESCHEDULE */}
                              {(sch.status === "Pending Confirmation" || sch.status === "Confirmed") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa", fontWeight: 700 }}
                                  onClick={() => handleRescheduleAction(sch)}
                                >
                                  🔄 Reschedule
                                </button>
                              )}

                              {/* ACTION 3: CANCEL */}
                              {(sch.status === "Pending Confirmation" || sch.status === "Confirmed" || sch.status === "Rescheduled") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontWeight: 700 }}
                                  onClick={() => handleCancelScheduleAction(sch)}
                                >
                                  ✕ Cancel
                                </button>
                              )}

                              {/* ACTION 4: CONVERT TO JOB ORDER */}
                              {sch.status !== "Cancelled" && (
                                 <select
                                   className="secondary-sm"
                                   style={{
                                     fontSize: 10.5,
                                     padding: "3px 8px",
                                     background: "#0f172a",
                                     color: "#ffffff",
                                     border: "none",
                                     fontWeight: 800,
                                     borderRadius: 6,
                                     cursor: "pointer",
                                   }}
                                   value=""
                                   onChange={(e) => {
                                     const val = e.target.value;
                                     if (val === "ESTIMATES") {
                                       openCreateEstimateModal();
                                       setEstCustomerName(sch.customerName);
                                       setEstServiceLocation(sch.serviceLocation);
                                       setEstPianoDetails(sch.pianoDetails);
                                       showToast(`📐 Populated Estimate form for ${sch.customerName}`);
                                     } else if (val === "QUOTATION") {
                                       openCreateQuotationModal();
                                       setQtCustomerName(sch.customerName);
                                       setQtServiceLocation(sch.serviceLocation);
                                       setQtPianoDetails(sch.pianoDetails);
                                       showToast(`📄 Populated Quotation form for ${sch.customerName}`);
                                     } else if (val === "JOB ORDER") {
                                       handleConvertToJobOrder(sch);
                                     }
                                   }}
                                 >
                                   <option value="" disabled>⚡ CATEGORY...</option>
                                   <option value="ESTIMATES" style={{ background: "#ffffff", color: "#0f172a" }}>📐 ESTIMATES</option>
                                   <option value="QUOTATION" style={{ background: "#ffffff", color: "#0f172a" }}>📄 QUOTATION</option>
                                   <option value="JOB ORDER" style={{ background: "#ffffff", color: "#0f172a" }}>🛠️ JOB ORDER</option>
                                 </select>
                               )}

                              {/* INSPECT & EDIT */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => setSelectedScheduleDetail(sch)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditScheduleModal(sch)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. JOB ORDERS MODULE */}
          {activeTab === "job_orders" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>🛠️ On-Site Technical Job Orders</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Execute on-site technical tasks, perform pre-service & final testing checklists, log additional findings, and manage parts & photos.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateJobOrderModal()}
                >
                  ＋ Issue New Job Order
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Job Orders</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{jobOrders.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>🛠️ On-Site Technical Orders</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>In Progress</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0284c7", margin: "4px 0" }}>
                    {jobOrders.filter((j) => j.status === "In Progress").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>⚡ Active Field Work</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Additional Findings</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#c2410c", margin: "4px 0" }}>
                    {jobOrders.filter((j) => j.status === "Additional Finding Pending").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#c2410c", fontWeight: 700 }}>⚠️ Pending Client Approval</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed JOs</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {jobOrders.filter((j) => j.status === "Completed").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669" }}>Ready for Billing / Service Report</span>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Assigned", "In Progress", "Additional Finding Pending", "Completed", "Cancelled"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: jobOrderFilter === st ? "#0f172a" : "#ffffff",
                        color: jobOrderFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setJobOrderFilter(st)}
                    >
                      {st === "All" ? "All Job Orders" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search JO No, Customer, Piano..."
                    value={jobOrderSearch}
                    onChange={(e) => setJobOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* JOB ORDERS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>JO No. & Date</th>
                      <th>Linked Quotation & Appt</th>
                      <th>Customer & Location</th>
                      <th>Piano Instrument</th>
                      <th>Approved Scope of Work</th>
                      <th>Technician Crew</th>
                      <th>Status & Findings</th>
                      <th style={{ textAlign: "right" }}>Job Order Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobOrders
                      .filter((j) => {
                        if (jobOrderFilter !== "All" && j.status !== jobOrderFilter) return false;
                        if (jobOrderSearch) {
                          const query = jobOrderSearch.toLowerCase();
                          return (
                            j.id.toLowerCase().includes(query) ||
                            j.customerName.toLowerCase().includes(query) ||
                            j.pianoDetails.toLowerCase().includes(query) ||
                            j.linkedQuotationNo.toLowerCase().includes(query) ||
                            j.appointmentNo.toLowerCase().includes(query) ||
                            j.location.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      })
                      .map((jo) => (
                        <tr key={jo.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedJobOrderDetail(jo)}
                            >
                              {jo.id}
                            </button>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Issued: {jo.date}</div>
                          </td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, display: "inline-block", marginBottom: 2 }}>
                              📄 {jo.linkedQuotationNo}
                            </span>
                            <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📅 {jo.appointmentNo}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{jo.customerName}</strong>
                            <div style={{ fontSize: 11, color: "#475569" }}>📍 {jo.location}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0f172a" }}>🎹 {jo.pianoDetails}</strong>
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{jo.approvedScope}</div>
                            {jo.partsUsed && (
                              <div style={{ fontSize: 10.5, color: "#059669", fontStyle: "italic", marginTop: 2 }}>
                                📦 Parts: {jo.partsUsed}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>🛠️ {jo.leadTechnician}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Assoc: {jo.associates}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  jo.status === "Completed"
                                    ? "#dcfce7"
                                    : jo.status === "In Progress"
                                      ? "#e0f2fe"
                                      : jo.status === "Additional Finding Pending"
                                        ? "#ffedd5"
                                        : jo.status === "Cancelled"
                                          ? "#fee2e2"
                                          : "#f1f5f9",
                                color:
                                  jo.status === "Completed"
                                    ? "#15803d"
                                    : jo.status === "In Progress"
                                      ? "#0369a1"
                                      : jo.status === "Additional Finding Pending"
                                        ? "#c2410c"
                                        : jo.status === "Cancelled"
                                          ? "#991b1b"
                                          : "#475569",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {jo.status}
                            </span>
                            {jo.findingDescription && (
                              <div style={{ fontSize: 10.5, color: "#c2410c", fontWeight: 700, marginTop: 4 }}>
                                ⚠️ Finding: {jo.findingDescription} (Dec: {jo.customerDecision || "Pending"})
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {/* ACTION 1: START JOB */}
                              {jo.status === "Assigned" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc", fontWeight: 700 }}
                                  onClick={() => handleStartJob(jo)}
                                >
                                  🚀 Start Job
                                </button>
                              )}

                              {/* ACTION 2: ADD PARTS */}
                              {(jo.status === "In Progress" || jo.status === "Additional Finding Pending") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: 700 }}
                                  onClick={() => handleAddParts(jo)}
                                >
                                  📦 Add Parts
                                </button>
                              )}

                              {/* ACTION 3: ADD PHOTOS */}
                              {(jo.status === "In Progress" || jo.status === "Additional Finding Pending") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#f5f3ff", color: "#6b21a8", border: "1px solid #ddd6fe", fontWeight: 700 }}
                                  onClick={() => handleAddPhotos(jo)}
                                >
                                  📷 Add Photos ({jo.photosCount || 0})
                                </button>
                              )}

                              {/* ACTION 4: RECORD FINDING */}
                              {(jo.status === "In Progress" || jo.status === "Additional Finding Pending") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa", fontWeight: 700 }}
                                  onClick={() => handleRecordFinding(jo)}
                                >
                                  ⚠️ Record Finding
                                </button>
                              )}

                              {/* ACTION 5: COMPLETE JOB */}
                              {(jo.status === "In Progress" || jo.status === "Additional Finding Pending") && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "4px 10px", background: "#0f172a", color: "#ffffff", border: "none", fontWeight: 800 }}
                                  onClick={() => handleCompleteJob(jo)}
                                >
                                  ✓ Complete Job
                                </button>
                              )}

                              {/* INSPECT & EDIT */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => setSelectedJobOrderDetail(jo)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditJobOrderModal(jo)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. SERVICE REPORTS MODULE */}
          {activeTab === "service_reports" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>📋 Technical Service Reports & Documentation</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Official technical report signed by lead technician and customer. Document concerns, work performed, limitations, and future service reminders.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateServiceReportModal()}
                >
                  ＋ Issue Service Report
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Service Reports</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{serviceReports.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📋 Field Documentation Records</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Signed by Customer</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {serviceReports.filter((s) => s.status === "Signed by Customer").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>✍️ Verified & Acknowledged</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Signature</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    {serviceReports.filter((s) => s.status === "Pending Signature").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>⏳ Awaiting Client Sign-Off</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Follow-Ups Scheduled</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0284c7", margin: "4px 0" }}>
                    {serviceReports.filter((s) => s.followUpRequired === "Yes").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#0284c7" }}>📅 6-Month Reminder Set</span>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Draft", "Pending Signature", "Signed by Customer", "Sent to Customer"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: serviceReportFilter === st ? "#0f172a" : "#ffffff",
                        color: serviceReportFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setServiceReportFilter(st)}
                    >
                      {st === "All" ? "All Reports" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Report No, Customer, Piano..."
                    value={serviceReportSearch}
                    onChange={(e) => setServiceReportSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* SERVICE REPORTS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Report No. & Date</th>
                      <th>Linked JO & Quote</th>
                      <th>Customer & Location</th>
                      <th>Piano Instrument</th>
                      <th>Work Actually Performed</th>
                      <th>Results & Next Target</th>
                      <th>Status & Sign-off</th>
                      <th style={{ textAlign: "right" }}>Report Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceReports
                      .filter((sr) => {
                        if (serviceReportFilter !== "All" && sr.status !== serviceReportFilter) return false;
                        if (serviceReportSearch) {
                          const query = serviceReportSearch.toLowerCase();
                          return (
                            sr.id.toLowerCase().includes(query) ||
                            sr.customerName.toLowerCase().includes(query) ||
                            sr.pianoDetails.toLowerCase().includes(query) ||
                            sr.jobOrderNo.toLowerCase().includes(query) ||
                            sr.quotationNo.toLowerCase().includes(query) ||
                            sr.workActuallyPerformed.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      })
                      .map((sr) => (
                        <tr key={sr.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedServiceReportDetail(sr)}
                            >
                              {sr.id}
                            </button>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Date: {sr.serviceDate}</div>
                          </td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, display: "inline-block", marginBottom: 2 }}>
                              🛠️ {sr.jobOrderNo}
                            </span>
                            <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📄 {sr.quotationNo}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{sr.customerName}</strong>
                            <div style={{ fontSize: 11, color: "#475569" }}>📍 {sr.location}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0f172a" }}>🎹 {sr.pianoDetails}</strong>
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{sr.workActuallyPerformed}</div>
                            {sr.partsUsed && (
                              <div style={{ fontSize: 10.5, color: "#059669", fontStyle: "italic", marginTop: 2 }}>
                                📦 Parts: {sr.partsUsed}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 11, color: "#334155" }}>{sr.serviceResultsLimitations}</div>
                            {sr.recommendedNextServiceDate && (
                              <div style={{ fontSize: 10.5, color: "#0284c7", fontWeight: 700, marginTop: 2 }}>
                                📅 Next Visit: {sr.recommendedNextServiceDate}
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  sr.status === "Signed by Customer"
                                    ? "#dcfce7"
                                    : sr.status === "Sent to Customer"
                                      ? "#dbeafe"
                                      : sr.status === "Pending Signature"
                                        ? "#fef3c7"
                                        : "#f1f5f9",
                                color:
                                  sr.status === "Signed by Customer"
                                    ? "#15803d"
                                    : sr.status === "Sent to Customer"
                                      ? "#1e40af"
                                      : sr.status === "Pending Signature"
                                        ? "#92400e"
                                        : "#475569",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {sr.status}
                            </span>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>✍️ {sr.customerAcknowledgment}</div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {/* ACTION 1: ADD FINDINGS */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px", background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", fontWeight: 700 }}
                                onClick={() => handleAddFindingsAction(sr)}
                              >
                                📝 Add Findings
                              </button>

                              {/* ACTION 2: ATTACH PHOTOS */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px", background: "#f5f3ff", color: "#6b21a8", border: "1px solid #ddd6fe", fontWeight: 700 }}
                                onClick={() => handleAttachPhotosAction(sr)}
                              >
                                📷 Attach Photos ({sr.photosCount || 0})
                              </button>

                              {/* ACTION 3: GENERATE PDF */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", fontWeight: 700 }}
                                onClick={() => setPrintableDoc({ type: "Service Report", data: sr })}
                              >
                                🖨️ Generate PDF
                              </button>

                              {/* ACTION 4: SEND TO CUSTOMER */}
                              {sr.status !== "Sent to Customer" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 700 }}
                                  onClick={() => handleSendReportToCustomer(sr)}
                                >
                                  📲 Send to Customer
                                </button>
                              )}

                              {/* INSPECT & EDIT */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => setSelectedServiceReportDetail(sr)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditServiceReportModal(sr)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. INVOICES MODULE */}
          {activeTab === "invoices" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>🧾 Invoices & Billing Management</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Issue invoices linked to Service Reports, Job Orders, Quotations, and Cases. System-calculated balances, overdue tracking, owner exceptions, and tax registration controls.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateInvoiceModal()}
                >
                  ＋ Create Invoice
                </button>
              </div>

              {/* REGISTERED BUSINESS TAX STATUS BANNER */}
              {isRegistered ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#166534" }}>
                  <div>
                    <strong>🏛️ Registered Business Active ({vatStatus}):</strong> TIN: {tin} | Official Tax Invoice Mode Enabled
                  </div>
                  <span style={{ background: "#166534", color: "#ffffff", padding: "2px 10px", borderRadius: 99, fontWeight: 700, fontSize: 11 }}>VAT / Tax Compliant</span>
                </div>
              ) : (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                  <div>
                    <strong>ℹ️ Non-Registered Mode:</strong> Tax / VAT / TIN fields are hidden & disabled until <strong>Registered = Yes</strong> in Settings.
                  </div>
                  <span style={{ background: "#cbd5e1", color: "#334155", padding: "2px 10px", borderRadius: 99, fontWeight: 700, fontSize: 11 }}>Standard Commercial Invoice</span>
                </div>
              )}

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Invoiced</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>
                    ₱{invoices.filter((i) => i.status !== "Void").reduce((acc, i) => acc + (i.invoiceAmount - (i.discount || 0)), 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>🧾 {invoices.length} Total Billing Documents</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paid in Full</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    ₱{invoices.filter((i) => i.status === "Paid in Full").reduce((acc, i) => acc + i.amountPaid, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>✅ {invoices.filter((i) => i.status === "Paid in Full").length} Fully Settled Invoices</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Outstanding Balance</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    ₱{invoices.filter((i) => i.status !== "Void").reduce((acc, i) => acc + i.balance, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>⏳ {invoices.filter((i) => i.balance > 0 && i.status !== "Void").length} Unpaid / Partial Balances</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overdue Invoices</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#dc2626", margin: "4px 0" }}>
                    ₱{invoices.filter((i) => i.status === "Overdue").reduce((acc, i) => acc + i.balance, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>⚠️ {invoices.filter((i) => i.status === "Overdue").length} Past Due Date</span>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Draft", "Sent", "Partially Paid", "Paid in Full", "Overdue", "Void"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: invoiceFilter === st ? "#0f172a" : "#ffffff",
                        color: invoiceFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setInvoiceFilter(st)}
                    >
                      {st === "All" ? "All Invoices" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Invoice No, Customer, SR..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* INVOICES TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Invoice No. & Date</th>
                      <th>Linked Documents</th>
                      <th>Customer & Address</th>
                      <th>Service Description</th>
                      <th>Invoice Amount & Paid</th>
                      <th>Current Balance</th>
                      <th>Due Date & Terms</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Invoice Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices
                      .filter((inv) => {
                        const todayStr = new Date().toISOString().split("T")[0];
                        // Dynamic calculation check for Overdue status
                        const effectiveStatus = (inv.status !== "Void" && inv.status !== "Paid in Full" && inv.balance > 0 && inv.dueDate < todayStr) ? "Overdue" : inv.status;

                        if (invoiceFilter !== "All" && effectiveStatus !== invoiceFilter) return false;
                        if (invoiceSearch) {
                          const query = invoiceSearch.toLowerCase();
                          return (
                            inv.id.toLowerCase().includes(query) ||
                            inv.customerName.toLowerCase().includes(query) ||
                            inv.serviceReportNo.toLowerCase().includes(query) ||
                            inv.jobOrderNo.toLowerCase().includes(query) ||
                            inv.quotationNo.toLowerCase().includes(query) ||
                            inv.caseId.toLowerCase().includes(query) ||
                            inv.serviceDescription.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      })
                      .map((inv) => {
                        const todayStr = new Date().toISOString().split("T")[0];
                        const isOverdue = inv.status !== "Void" && inv.status !== "Paid in Full" && inv.balance > 0 && inv.dueDate < todayStr;
                        const displayStatus: InvoiceStatus = isOverdue ? "Overdue" : inv.status;
                        const netTotal = Math.max(0, inv.invoiceAmount - (inv.discount || 0));

                        return (
                          <tr key={inv.id}>
                            <td>
                              <button
                                style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                                onClick={() => setSelectedInvoiceDetail(inv)}
                              >
                                {inv.id}
                              </button>
                              <div style={{ fontSize: 11, color: "#64748b" }}>Date: {inv.invoiceDate}</div>
                              {inv.exceptionWithoutReport && (
                                <span style={{ background: "#fffbebf5", color: "#92400e", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: 4, fontSize: 9.5, fontWeight: 800, display: "inline-block", marginTop: 2 }}>
                                  ⚠️ Owner Exception
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>📋 {inv.serviceReportNo}</div>
                              <div style={{ fontSize: 10.5, color: "#3730a3" }}>🛠️ {inv.jobOrderNo}</div>
                              <div style={{ fontSize: 10.5, color: "#2563eb" }}>📄 {inv.quotationNo}</div>
                            </td>
                            <td>
                              <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{inv.customerName}</strong>
                              <div style={{ fontSize: 11, color: "#475569" }}>📍 {inv.billingAddress}</div>
                            </td>
                            <td style={{ maxWidth: 200 }}>
                              <div style={{ fontSize: 12, color: "#0f172a" }}>{inv.serviceDescription}</div>
                            </td>
                            <td>
                              <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>₱{netTotal.toLocaleString()}</strong>
                              <div style={{ fontSize: 11, color: "#059669" }}>Paid: ₱{inv.amountPaid.toLocaleString()}</div>
                              {inv.discount && inv.discount > 0 ? (
                                <div style={{ fontSize: 10, color: "#dc2626" }}>Discount: -₱{inv.discount.toLocaleString()}</div>
                              ) : null}
                            </td>
                            <td>
                              <strong style={{ fontSize: 14, color: inv.balance > 0 ? "#c2410c" : "#059669" }}>
                                ₱{inv.balance.toLocaleString()}
                              </strong>
                              <div style={{ fontSize: 10, color: "#64748b" }}>System-calculated</div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? "#dc2626" : "#0f172a" }}>{inv.dueDate}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>Terms: {inv.paymentTerms}</div>
                            </td>
                            <td>
                              <span
                                style={{
                                  background:
                                    displayStatus === "Paid in Full"
                                      ? "#dcfce7"
                                      : displayStatus === "Partially Paid"
                                        ? "#e0f2fe"
                                        : displayStatus === "Overdue"
                                          ? "#fee2e2"
                                          : displayStatus === "Sent"
                                            ? "#dbeafe"
                                            : displayStatus === "Void"
                                              ? "#f1f5f9"
                                              : "#f1f5f9",
                                  color:
                                    displayStatus === "Paid in Full"
                                      ? "#15803d"
                                      : displayStatus === "Partially Paid"
                                        ? "#0369a1"
                                        : displayStatus === "Overdue"
                                          ? "#991b1b"
                                          : displayStatus === "Sent"
                                            ? "#1e40af"
                                            : displayStatus === "Void"
                                              ? "#64748b"
                                              : "#475569",
                                  padding: "3px 10px",
                                  borderRadius: 99,
                                  fontSize: 11,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {displayStatus}
                              </span>
                              {displayStatus === "Void" && inv.voidReason && (
                                <div style={{ fontSize: 10, color: "#dc2626", marginTop: 2 }}>Reason: {inv.voidReason}</div>
                              )}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                                {/* ACTION 1: SEND TO CUSTOMER */}
                                {inv.status !== "Void" && (
                                  <button
                                    className="secondary-sm"
                                    style={{ fontSize: 10.5, padding: "3px 8px", background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", fontWeight: 700 }}
                                    onClick={() => handleSendInvoiceToCustomer(inv)}
                                  >
                                    📲 Send to Customer
                                  </button>
                                )}

                                {/* ACTION 2: RECORD PAYMENT */}
                                {inv.status !== "Void" && inv.status !== "Paid in Full" && (
                                  <button
                                    className="secondary-sm"
                                    style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 800 }}
                                    onClick={() => handleRecordPaymentForInvoice(inv)}
                                  >
                                    💳 Record Payment
                                  </button>
                                )}

                                {/* ACTION 3: VOID INVOICE */}
                                {inv.status !== "Void" && (
                                  <button
                                    className="secondary-sm"
                                    style={{ fontSize: 10.5, padding: "3px 8px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", fontWeight: 700 }}
                                    onClick={() => handleVoidInvoiceAction(inv)}
                                  >
                                    ⛔ Void Invoice
                                  </button>
                                )}

                                {/* PDF PREVIEW & INSPECT */}
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px" }}
                                  onClick={() => setPrintableDoc({ type: "Invoice", data: inv })}
                                >
                                  🖨️ PDF
                                </button>
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px" }}
                                  onClick={() => setSelectedInvoiceDetail(inv)}
                                >
                                  👁 Inspect
                                </button>
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px" }}
                                  onClick={() => openEditInvoiceModal(inv)}
                                >
                                  ✏️ Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. PAYMENTS MODULE */}
          {activeTab === "payments" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>💳 Payments & Acknowledgment Verification</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Log customer payments, system-calculate invoice balances, verify received funds, issue official payment acknowledgments (`ACK-2026-XXX`), and record refunds/voids with mandatory reasons.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreatePaymentModal()}
                >
                  ＋ Record Payment
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Payments Received</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    ₱{payments.filter((p) => p.status !== "Voided" && p.status !== "Refunded").reduce((acc, p) => acc + p.amountReceivedToday, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>💰 Verified Collections</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Acknowledgments Issued</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0284c7", margin: "4px 0" }}>
                    {payments.filter((p) => p.status === "Acknowledgment Generated").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>📜 ACK Receipts Sent</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Verification</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    {payments.filter((p) => p.status === "Pending Verification").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>⏳ Requires Owner/Manager Sign-Off</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Refunds & Voids</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#dc2626", margin: "4px 0" }}>
                    {payments.filter((p) => p.status === "Refunded" || p.status === "Voided").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>⚠️ Reason Logged Entries</span>
                </div>
              </div>

              {/* SEARCH & STATUS FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Pending Verification", "Verified", "Acknowledgment Generated", "Refunded", "Voided"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: paymentFilter === st ? "#0f172a" : "#ffffff",
                        color: paymentFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setPaymentFilter(st)}
                    >
                      {st === "All" ? "All Payments" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Pay ID, ACK, Customer, Inv..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* PAYMENTS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Record No. & ACK</th>
                      <th>Linked Invoice & JO</th>
                      <th>Customer Name</th>
                      <th>Method & Ref No.</th>
                      <th>Amount Received</th>
                      <th>System Total & Balance</th>
                      <th>Received & Verified By</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Payment Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .filter((p) => {
                        if (paymentFilter !== "All" && p.status !== paymentFilter) return false;
                        if (paymentSearch) {
                          const query = paymentSearch.toLowerCase();
                          return (
                            p.id.toLowerCase().includes(query) ||
                            p.paymentAckNo.toLowerCase().includes(query) ||
                            p.customerName.toLowerCase().includes(query) ||
                            p.invoiceNo.toLowerCase().includes(query) ||
                            p.jobOrderNo.toLowerCase().includes(query) ||
                            p.referenceNo.toLowerCase().includes(query)
                          );
                        }
                        return true;
                      })
                      .map((p) => (
                        <tr key={p.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedPaymentDetail(p)}
                            >
                              {p.id}
                            </button>
                            <div style={{ fontSize: 10.5, color: "#0284c7", fontWeight: 700 }}>📜 {p.paymentAckNo}</div>
                            <div style={{ fontSize: 10, color: "#64748b" }}>{p.paymentDateTime}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12, color: "#2563eb", display: "block" }}>🧾 {p.invoiceNo}</strong>
                            <div style={{ fontSize: 11, color: "#3730a3" }}>🛠️ {p.jobOrderNo}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a" }}>{p.customerName}</strong>
                            <div style={{ fontSize: 10.5, color: "#475569" }}>Type: {p.paymentType}</div>
                          </td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                              {p.paymentMethod}
                            </span>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Ref: {p.referenceNo}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 14, color: "#059669" }}>₱{p.amountReceivedToday.toLocaleString()}</strong>
                          </td>
                          <td>
                            <div style={{ fontSize: 11, color: "#334155" }}>Inv Total: <strong>₱{p.invoiceTotal.toLocaleString()}</strong></div>
                            <div style={{ fontSize: 11, color: "#059669" }}>Total Paid: <strong>₱{p.newTotalPaid.toLocaleString()}</strong></div>
                            <div style={{ fontSize: 11.5, fontWeight: 800, color: p.remainingBalance > 0 ? "#c2410c" : "#059669" }}>
                              Bal: ₱{p.remainingBalance.toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 11, color: "#0f172a" }}>📥 {p.receivedBy}</div>
                            <div style={{ fontSize: 10.5, color: "#166534", fontWeight: 700 }}>✅ {p.verifiedBy}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  p.status === "Acknowledgment Generated"
                                    ? "#dcfce7"
                                    : p.status === "Verified"
                                      ? "#e0f2fe"
                                      : p.status === "Pending Verification"
                                        ? "#fef3c7"
                                        : "#fee2e2",
                                color:
                                  p.status === "Acknowledgment Generated"
                                    ? "#15803d"
                                    : p.status === "Verified"
                                      ? "#0369a1"
                                      : p.status === "Pending Verification"
                                        ? "#92400e"
                                        : "#991b1b",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.status}
                            </span>
                            {(p.refundReason || p.voidReason) && (
                              <div style={{ fontSize: 10, color: "#dc2626", marginTop: 2 }}>
                                Reason: {p.refundReason || p.voidReason}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {/* ACTION 1: GENERATE ACKNOWLEDGMENT */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", fontWeight: 700 }}
                                onClick={() => handleGenerateAckAction(p)}
                              >
                                📜 Generate ACK
                              </button>

                              {/* ACTION 2: VIEW BALANCE */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px", background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", fontWeight: 700 }}
                                onClick={() => setSelectedPaymentDetail(p)}
                              >
                                👁 View Balance
                              </button>

                              {/* ACTION 3: MARK PAID IN FULL */}
                              {p.remainingBalance > 0 && p.status !== "Voided" && p.status !== "Refunded" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 800 }}
                                  onClick={() => handleMarkPaidInFullAction(p)}
                                >
                                  ✅ Mark Paid in Full
                                </button>
                              )}

                              {/* ACTION 4: REFUND */}
                              {p.status !== "Refunded" && p.status !== "Voided" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}
                                  onClick={() => handleRefundPaymentAction(p)}
                                >
                                  💸 Refund
                                </button>
                              )}

                              {/* ACTION 5: VOID */}
                              {p.status !== "Voided" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#f1f5f9", color: "#475569" }}
                                  onClick={() => handleVoidPaymentAction(p)}
                                >
                                  ⛔ Void
                                </button>
                              )}

                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditPaymentModal(p)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. EXPENSES & PROFITABILITY MODULE */}
          {activeTab === "expenses" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>📉 Operating Expenses & Job Profitability</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Log operating expenses, link expenses to specific Job Orders / Cases, and analyze real-time job net profit & margins.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="primary"
                    style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, background: "#15803d", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => setShowProfitModal(true)}
                  >
                    📊 View Job Profitability
                  </button>
                  <button
                    className="primary"
                    style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => openCreateExpenseModal()}
                  >
                    ＋ Log New Expense
                  </button>
                </div>
              </div>

              {/* TEST RECORD SAFEGUARD BANNER */}
              <div style={{ background: "#fffbebf5", border: "1px solid #fde68a", padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#92400e" }}>
                <div>
                  <strong>🛡️ TEST EXPENSE SAFEGUARD ACTIVE:</strong> All expenses tagged with <strong>Record Type = TEST</strong> display a <code>TEST RECORD ONLY</code> badge and are <strong>strictly excluded from actual expense & profit calculations</strong>.
                </div>
                <span style={{ background: "#d97706", color: "#ffffff", padding: "2px 10px", borderRadius: 99, fontWeight: 800, fontSize: 11 }}>Safeguard Enforced</span>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Actual Revenue</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0" }}>₱{totalRevenue.toLocaleString()}</div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>💳 Verified Customer Payments</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Actual Expenses</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#dc2626", margin: "4px 0" }}>
                    ₱{expenses.filter((e) => e.recordMode === "ACTUAL").reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>📉 Operational Outflows</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Net Business Profit</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: netProfit >= 0 ? "#166534" : "#991b1b", margin: "4px 0" }}>
                    ₱{netProfit.toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: netProfit >= 0 ? "#166534" : "#991b1b", fontWeight: 700 }}>
                    {totalRevenue > 0 ? `📈 Profit Margin: ${((netProfit / totalRevenue) * 100).toFixed(1)}%` : "0% Margin"}
                  </span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Job-Linked Expenses</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0284c7", margin: "4px 0" }}>
                    ₱{expenses.filter((e) => e.recordMode === "ACTUAL" && e.linkedJobOrderNo).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>⚙️ Direct Job Costs</span>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Parts", "Transport / Fuel", "Tools", "Utilities", "Marketing", "Job Overhead", "Other"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: expCategoryFilter === cat ? "#0f172a" : "#ffffff",
                        color: expCategoryFilter === cat ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setExpCategoryFilter(cat)}
                    >
                      {cat === "All" ? "All Categories" : cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    className="input-field"
                    style={{ fontSize: 12, padding: "6px 10px", width: 130 }}
                    value={expRecordTypeFilter}
                    onChange={(e) => setExpRecordTypeFilter(e.target.value as any)}
                  >
                    <option value="All">All Modes</option>
                    <option value="ACTUAL">ACTUAL</option>
                    <option value="TEST">TEST ONLY</option>
                  </select>

                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px", width: 220 }}
                    placeholder="🔍 Search Exp ID, Vendor, Job No..."
                    value={expSearch}
                    onChange={(e) => setExpSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* EXPENSES TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Expense ID & Date</th>
                      <th>Category & Vendor</th>
                      <th>Description</th>
                      <th>Linked Job Order & Case</th>
                      <th>Amount (₱)</th>
                      <th>Record Type</th>
                      <th>Recorded By</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses
                      .filter((e) => {
                        if (expCategoryFilter !== "All" && e.category !== expCategoryFilter) return false;
                        if (expRecordTypeFilter !== "All" && e.recordMode !== expRecordTypeFilter) return false;
                        if (expSearch) {
                          const query = expSearch.toLowerCase();
                          return (
                            e.id.toLowerCase().includes(query) ||
                            e.description.toLowerCase().includes(query) ||
                            e.paidTo.toLowerCase().includes(query) ||
                            (e.linkedJobOrderNo && e.linkedJobOrderNo.toLowerCase().includes(query)) ||
                            (e.linkedCaseId && e.linkedCaseId.toLowerCase().includes(query))
                          );
                        }
                        return true;
                      })
                      .map((e) => (
                        <tr key={e.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedExpDetail(e)}
                            >
                              {e.id}
                            </button>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{e.date}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0f172a", display: "block" }}>{e.category}</strong>
                            <div style={{ fontSize: 11, color: "#475569" }}>Payee: {e.paidTo}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, color: "#334155" }}>{e.description}</div>
                            {e.receiptRefNo && <div style={{ fontSize: 10.5, color: "#64748b" }}>Ref: {e.receiptRefNo}</div>}
                          </td>
                          <td>
                            {e.linkedJobOrderNo ? (
                              <div style={{ background: "#e0f2fe", padding: "2px 8px", borderRadius: 6, display: "inline-block", fontSize: 11, color: "#0369a1", fontWeight: 800 }}>
                                ⚙️ {e.linkedJobOrderNo}
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>General Overhead</span>
                            )}
                            {e.linkedCaseId && <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Case: {e.linkedCaseId}</div>}
                          </td>
                          <td>
                            <strong style={{ fontSize: 14, color: "#dc2626" }}>₱{e.amount.toLocaleString()}</strong>
                          </td>
                          <td>
                            <span
                              style={{
                                background: e.recordMode === "TEST" ? "#fef3c7" : "#dcfce7",
                                color: e.recordMode === "TEST" ? "#92400e" : "#15803d",
                                padding: "2px 8px",
                                borderRadius: 99,
                                fontSize: 10.5,
                                fontWeight: 800,
                              }}
                            >
                              {e.recordMode === "TEST" ? "⚠️ TEST RECORD ONLY" : "ACTUAL"}
                            </span>
                          </td>
                          <td style={{ fontSize: 11, color: "#475569" }}>👤 {e.recordedBy}</td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                              <button className="secondary-sm" style={{ fontSize: 10.5, padding: "3px 8px" }} onClick={() => setSelectedExpDetail(e)}>
                                👁 Inspect
                              </button>
                              <button className="secondary-sm" style={{ fontSize: 10.5, padding: "3px 8px" }} onClick={() => openEditExpenseModal(e)}>
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 12. FOLLOW-UPS MODULE */}
          {activeTab === "follow_ups" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>📅 Follow-Ups & Service Reminders</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Schedule routine check-ins, 6-month tuning reminders, and warranty comebacks. Warranty comebacks link to original JO/SR without auto-billing; new charges trigger a new Quotation path.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateFollowUpModal()}
                >
                  ＋ Create Follow-Up
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Follow-Ups</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{followUps.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📋 Scheduled & Logged</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Warranty Comebacks</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#c2410c", margin: "4px 0" }}>
                    {followUps.filter((f) => f.followUpType === "Warranty Comeback").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#c2410c", fontWeight: 700 }}>🛠️ Post-Service Warranty Logs</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Action</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    {followUps.filter((f) => f.status === "Pending").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>⏳ Due Reminders</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed Check-Ins</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {followUps.filter((f) => f.status === "Completed").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>✅ Customer Confirmed</span>
                </div>
              </div>

              {/* SEARCH & TYPE FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Routine Check-In", "Next Service Reminder", "Warranty Comeback", "Other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: followUpTypeFilter === t ? "#0f172a" : "#ffffff",
                        color: followUpTypeFilter === t ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setFollowUpTypeFilter(t)}
                    >
                      {t === "All" ? "All Types" : t}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Follow-Up No, Customer, Case..."
                    value={followUpSearch}
                    onChange={(e) => setFollowUpSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* FOLLOW-UPS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Follow-Up No. & Date</th>
                      <th>Linked Case ID</th>
                      <th>Customer & Piano</th>
                      <th>Follow-Up Type</th>
                      <th>Warranty & Linkage</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Follow-Up Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {followUps
                      .filter((f) => {
                        if (followUpTypeFilter !== "All" && f.followUpType !== followUpTypeFilter) return false;
                        if (followUpFilter !== "All" && f.status !== followUpFilter) return false;
                        if (followUpSearch) {
                          const query = followUpSearch.toLowerCase();
                          return (
                            f.id.toLowerCase().includes(query) ||
                            f.customerName.toLowerCase().includes(query) ||
                            f.caseId.toLowerCase().includes(query) ||
                            f.pianoDetails.toLowerCase().includes(query) ||
                            (f.linkedOriginalJobOrderNo && f.linkedOriginalJobOrderNo.toLowerCase().includes(query)) ||
                            (f.linkedOriginalServiceReportNo && f.linkedOriginalServiceReportNo.toLowerCase().includes(query))
                          );
                        }
                        return true;
                      })
                      .map((f) => (
                        <tr key={f.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedFollowUpDetail(f)}
                            >
                              {f.id}
                            </button>
                            <div style={{ fontSize: 11, color: "#64748b" }}>Target: {f.targetDate}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12, color: "#3730a3" }}>📁 {f.caseId}</strong>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{f.customerName}</strong>
                            <div style={{ fontSize: 11, color: "#475569" }}>🎹 {f.pianoDetails}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  f.followUpType === "Warranty Comeback"
                                    ? "#ffedd5"
                                    : f.followUpType === "Next Service Reminder"
                                      ? "#e0f2fe"
                                      : "#f1f5f9",
                                color:
                                  f.followUpType === "Warranty Comeback"
                                    ? "#c2410c"
                                    : f.followUpType === "Next Service Reminder"
                                      ? "#0369a1"
                                      : "#475569",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {f.followUpType}
                            </span>
                          </td>
                          <td>
                            {f.followUpType === "Warranty Comeback" ? (
                              <div style={{ fontSize: 11 }}>
                                <div style={{ color: "#3730a3" }}>🛠️ Orig JO: {f.linkedOriginalJobOrderNo || "N/A"}</div>
                                <div style={{ color: "#0284c7" }}>📋 Orig SR: {f.linkedOriginalServiceReportNo || "N/A"}</div>
                                {f.newChargesRequired === "Yes" ? (
                                  <span style={{ background: "#fee2e2", color: "#991b1b", padding: "1px 6px", borderRadius: 4, fontSize: 9.5, fontWeight: 800 }}>
                                    ⚡ New Charges Required (Quotation Path Needed)
                                  </span>
                                ) : (
                                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: 4, fontSize: 9.5, fontWeight: 800 }}>
                                    ✅ Fully Covered under Warranty (No Auto Billing)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: "#64748b" }}>Standard Reminder</span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>👤 {f.assignedTo}</div>
                            {f.contactMethod && <div style={{ fontSize: 10.5, color: "#64748b" }}>Via: {f.contactMethod}</div>}
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  f.status === "Completed"
                                    ? "#dcfce7"
                                    : f.status === "Pending"
                                      ? "#fef3c7"
                                      : f.status === "Rescheduled"
                                        ? "#e0f2fe"
                                        : "#fee2e2",
                                color:
                                  f.status === "Completed"
                                    ? "#15803d"
                                    : f.status === "Pending"
                                      ? "#92400e"
                                      : f.status === "Rescheduled"
                                        ? "#0369a1"
                                        : "#991b1b",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {f.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {/* ACTION 1: TRIGGER NEW QUOTATION (ONLY IF NEW CHARGES REQUIRED) */}
                              {f.followUpType === "Warranty Comeback" && f.newChargesRequired === "Yes" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa", fontWeight: 800 }}
                                  onClick={() => handleTriggerNewQuotationForWarranty(f)}
                                >
                                  ⚡ Trigger Quotation
                                </button>
                              )}

                              {/* ACTION 2: OPEN NEW CASE FOR FUTURE SERVICE */}
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: 700 }}
                                onClick={() => handleTriggerNewCaseForFutureService(f)}
                              >
                                🚀 Open New Case
                              </button>

                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => setSelectedFollowUpDetail(f)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditFollowUpModal(f)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 13. REPAIRS MODULE */}
          {activeTab === "repairs" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>🔧 Major Shop Repairs Tracking</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Track pianos booked in for shop repairs. Log intake, update stages, set next actions, record job expenses, and convert to Service Reports when complete.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateRepairModal()}
                >
                  🔧 Add Repair
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
                {(["Intake & Inspection", "Parts Ordering", "In Repair", "Testing & Tuning", "Ready for Delivery", "Delivered & Closed"] as RepairStage[]).map((stage) => {
                  const count = repairs.filter((r) => r.stage === stage).length;
                  const stageColors: Record<RepairStage, { bg: string; text: string }> = {
                    "Intake & Inspection": { bg: "#e0f2fe", text: "#0369a1" },
                    "Parts Ordering": { bg: "#fef3c7", text: "#92400e" },
                    "In Repair": { bg: "#fff7ed", text: "#c2410c" },
                    "Testing & Tuning": { bg: "#ede9fe", text: "#5b21b6" },
                    "Ready for Delivery": { bg: "#dcfce7", text: "#15803d" },
                    "Delivered & Closed": { bg: "#f1f5f9", text: "#475569" },
                  };
                  return (
                    <div
                      key={stage}
                      className="purely-card-white"
                      style={{ padding: 16, cursor: "pointer", border: repairStageFilter === stage ? "2px solid #0f172a" : "1px solid #e2e8f0" }}
                      onClick={() => setRepairStageFilter(repairStageFilter === stage ? "All" : stage)}
                    >
                      <span style={{ fontSize: 10, fontWeight: 800, color: stageColors[stage].text, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stage}</span>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "2px 0" }}>{count}</div>
                      <div style={{ height: 4, borderRadius: 2, background: stageColors[stage].bg, marginTop: 4 }} />
                    </div>
                  );
                })}
              </div>

              {/* SEARCH & FILTER BAR */}
              <div className="purely-card-white" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #cbd5e1", cursor: "pointer", background: repairStageFilter === "All" ? "#0f172a" : "#ffffff", color: repairStageFilter === "All" ? "#ffffff" : "#475569" }}
                    onClick={() => setRepairStageFilter("All")}
                  >
                    All Repairs
                  </button>
                </div>
                <input
                  className="input-field"
                  style={{ fontSize: 12, padding: "8px 12px", width: 260 }}
                  placeholder="🔍 Search Repair ID, Customer, Piano..."
                  value={repairSearch}
                  onChange={(e) => setRepairSearch(e.target.value)}
                />
              </div>

              {/* REPAIRS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Repair ID & Intake</th>
                      <th>Customer & Contact</th>
                      <th>Piano & Serial No.</th>
                      <th>Issue & Next Action</th>
                      <th>Stage</th>
                      <th>Est. Completion</th>
                      <th>Repair Cost & Downpayment</th>
                      <th>Job Expenses</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs
                      .filter((r) => {
                        if (repairStageFilter !== "All" && r.stage !== repairStageFilter) return false;
                        if (repairSearch) {
                          const q = repairSearch.toLowerCase();
                          return (
                            r.id.toLowerCase().includes(q) ||
                            r.customerName.toLowerCase().includes(q) ||
                            r.pianoModel.toLowerCase().includes(q) ||
                            r.issueDescription.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((r) => {
                        const stageColors: Record<string, { bg: string; text: string }> = {
                          "Intake & Inspection": { bg: "#e0f2fe", text: "#0369a1" },
                          "Parts Ordering": { bg: "#fef3c7", text: "#92400e" },
                          "In Repair": { bg: "#fff7ed", text: "#c2410c" },
                          "Testing & Tuning": { bg: "#ede9fe", text: "#5b21b6" },
                          "Ready for Delivery": { bg: "#dcfce7", text: "#15803d" },
                          "Delivered & Closed": { bg: "#f1f5f9", text: "#475569" },
                        };
                        const sc = stageColors[r.stage] || { bg: "#f1f5f9", text: "#475569" };

                        const cost = r.repairCost || 0;
                        const paid = r.downpaymentPaid || 0;
                        const remBal = Math.max(0, cost - paid);
                        const payStatus = r.paymentStatus || (paid >= cost && cost > 0 ? "Paid in Full" : paid > 0 ? "Downpayment Paid" : "Unpaid");

                        const linkedExps = expenses.filter(
                          (e) =>
                            (e.linkedJobOrderNo && r.linkedJobOrderNo && e.linkedJobOrderNo === r.linkedJobOrderNo) ||
                            (e.linkedCaseId && r.linkedCaseId && e.linkedCaseId === r.linkedCaseId) ||
                            (e.notes && e.notes.includes(r.id))
                        );
                        const expTotal = linkedExps.reduce((sum, e) => sum + e.amount, 0);

                        return (
                          <tr key={r.id}>
                            <td>
                              <button
                                style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                                onClick={() => setSelectedRepairDetail(r)}
                              >
                                {r.id}
                              </button>
                              <div style={{ fontSize: 11, color: "#64748b" }}>Intake: {r.intakeDate}</div>
                              {r.convertedToServiceReportId && (
                                <div style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>📋 SR: {r.convertedToServiceReportId}</div>
                              )}
                            </td>
                            <td>
                              <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{r.customerName}</strong>
                              <div style={{ fontSize: 11, color: "#475569" }}>📞 {r.contactNumber}</div>
                            </td>
                            <td>
                              <strong style={{ fontSize: 12.5, color: "#334155", display: "block" }}>🎹 {r.pianoModel}</strong>
                              <div style={{ fontSize: 10.5, color: "#64748b" }}>S/N: {r.pianoSerialNo}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12, color: "#334155", marginBottom: 4 }}>{r.issueDescription.substring(0, 55)}{r.issueDescription.length > 55 ? "…" : ""}</div>
                              {r.nextAction && (
                                <div style={{ background: "#fefce8", padding: "2px 8px", borderRadius: 6, fontSize: 11, color: "#713f12", fontWeight: 700 }}>
                                  ➡️ {r.nextAction}
                                </div>
                              )}
                            </td>
                            <td>
                              <span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800, display: "inline-block" }}>
                                {r.stage}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: "#334155" }}>{r.estimatedCompletion}</td>
                            <td>
                              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0f172a" }}>
                                Cost: {cost ? `₱${cost.toLocaleString()}` : "TBD"}
                              </div>
                              <div style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>
                                Paid: ₱{paid.toLocaleString()}
                              </div>
                              {remBal > 0 && cost > 0 && (
                                <div style={{ fontSize: 10.5, color: "#c2410c", fontWeight: 700 }}>
                                  Bal: ₱{remBal.toLocaleString()}
                                </div>
                              )}
                              <span
                                style={{
                                  background: payStatus === "Paid in Full" ? "#dcfce7" : payStatus === "Downpayment Paid" ? "#e0f2fe" : "#fee2e2",
                                  color: payStatus === "Paid in Full" ? "#15803d" : payStatus === "Downpayment Paid" ? "#0369a1" : "#b91c1c",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  marginTop: 2,
                                  display: "inline-block",
                                }}
                              >
                                {payStatus}
                              </span>
                            </td>
                            <td>
                              <strong style={{ fontSize: 12.5, color: expTotal > 0 ? "#dc2626" : "#94a3b8" }}>
                                📉 ₱{expTotal.toLocaleString()}
                              </strong>
                              {linkedExps.length > 0 && (
                                <div style={{ fontSize: 10, color: "#64748b" }}>{linkedExps.length} expense record(s)</div>
                              )}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc" }}
                                  onClick={() => handleOpenUpdateStage(r)}
                                >
                                  🔄 Stage
                                </button>
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 800 }}
                                  onClick={() => handleOpenRecordDownpayment(r)}
                                >
                                  💳 Downpayment
                                </button>
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}
                                  onClick={() => {
                                    openCreateExpenseModal(r.linkedJobOrderNo, r.linkedCaseId);
                                  }}
                                >
                                  📉 Expense
                                </button>
                                {r.stage !== "Delivered & Closed" && !r.convertedToServiceReportId && (
                                  <button
                                    className="secondary-sm"
                                    style={{ fontSize: 10.5, padding: "3px 8px", background: "#f1f5f9", color: "#475569" }}
                                    onClick={() => {
                                      if (confirm(`Convert ${r.id} to a Service Report? This will mark the repair as Delivered & Closed.`)) {
                                        handleConvertRepairToServiceReport(r);
                                      }
                                    }}
                                  >
                                    📋 To SR
                                  </button>
                                )}
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px" }}
                                  onClick={() => openEditRepairModal(r)}
                                >
                                  ✏️ Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* 14. TRADE-IN & PIANO SALES MODULE */}
          {activeTab === "trade_in" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>🔄 Trade-In & Piano Sales Pipeline</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Manage sales opportunities, register buyers, appraise customer pianos, and track pipeline stages from <code>Opportunity Added</code> → <code>Buyer Registered</code> → <code>Closed Won</code> / <code>Closed Lost</code>.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => openCreateTradeModal()}
                >
                  ＋ Add Opportunity
                </button>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Opportunities</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{tradeIns.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>🎹 Active Trade & Sales Pipeline</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Closed Won Deals</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {tradeIns.filter((t) => t.status === "Closed Won").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>🏆 Successfully Completed Sales</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Registered Buyers</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0284c7", margin: "4px 0" }}>
                    {tradeIns.filter((t) => t.status === "Buyer Registered" || t.buyerName).length}
                  </div>
                  <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>👤 Reserved Target Pianos</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Net Sales Payable Balance</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#166534", margin: "4px 0" }}>
                    ₱{tradeIns.filter((t) => t.status !== "Closed Lost").reduce((acc, curr) => acc + (curr.netPayableBalance || 0), 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>💵 System Net Pipeline Value</span>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Opportunity Added", "In Appraisal", "Valuation Offered", "Buyer Registered", "Closed Won", "Closed Lost"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: tradeFilter === st ? "#0f172a" : "#ffffff",
                        color: tradeFilter === st ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setTradeFilter(st as any)}
                    >
                      {st === "All" ? "All Pipeline" : st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 280 }}>
                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    placeholder="🔍 Search Trade No, Customer, Buyer, Piano..."
                    value={tradeSearch}
                    onChange={(e) => setTradeSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* TRADE-IN TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Trade-In ID & Date</th>
                      <th>Customer & Registered Buyer</th>
                      <th>Traded-In Piano & Credit</th>
                      <th>Target Unit Purchased</th>
                      <th>Gross Price & Credit</th>
                      <th>Net Balance Payable</th>
                      <th>Status & Approval</th>
                      <th style={{ textAlign: "right" }}>Pipeline Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeIns
                      .filter((t) => {
                        if (tradeFilter !== "All" && t.status !== tradeFilter) return false;
                        if (tradeSearch) {
                          const query = tradeSearch.toLowerCase();
                          return (
                            t.id.toLowerCase().includes(query) ||
                            t.customerName.toLowerCase().includes(query) ||
                            (t.buyerName && t.buyerName.toLowerCase().includes(query)) ||
                            t.offeredPianoBrandModel.toLowerCase().includes(query) ||
                            (t.targetPianoBrandModel && t.targetPianoBrandModel.toLowerCase().includes(query)) ||
                            (t.linkedInvoiceNo && t.linkedInvoiceNo.toLowerCase().includes(query))
                          );
                        }
                        return true;
                      })
                      .map((t) => (
                        <tr key={t.id}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedTradeDetail(t)}
                            >
                              {t.id}
                            </button>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{t.createdDate}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{t.customerName}</strong>
                            <div style={{ fontSize: 11, color: "#475569" }}>📞 {t.contactNumber}</div>
                            {t.buyerName && (
                              <div style={{ marginTop: 4, background: "#f0f9ff", padding: "2px 6px", borderRadius: 4, fontSize: 11, color: "#0369a1", fontWeight: 700 }}>
                                👤 Registered Buyer: {t.buyerName} ({t.buyerContact})
                              </div>
                            )}
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#c2410c", display: "block" }}>🎹 {t.offeredPianoBrandModel}</strong>
                            <div style={{ fontSize: 10.5, color: "#64748b" }}>S/N: {t.offeredPianoSerialNo}</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#c2410c", marginTop: 2 }}>
                              Credit: ₱{t.appraisalValuation.toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0284c7", display: "block" }}>
                              🏪 {t.targetPianoBrandModel || "Custom Unit"}
                            </strong>
                            <div style={{ fontSize: 10.5, color: "#64748b" }}>Inv Ref: {t.targetInventoryUnitId || "N/A"}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, color: "#334155" }}>Gross: ₱{t.targetGrossPrice.toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: "#c2410c" }}>Credit: -₱{t.appraisalValuation.toLocaleString()}</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 14, color: t.status === "Closed Lost" ? "#64748b" : "#166534", display: "block", textDecoration: t.status === "Closed Lost" ? "line-through" : "none" }}>
                              ₱{t.netPayableBalance.toLocaleString()}
                            </strong>
                            <div style={{ fontSize: 10, color: "#64748b" }}>System Net Due</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  t.status === "Closed Won"
                                    ? "#dcfce7"
                                    : t.status === "Buyer Registered"
                                    ? "#e0f2fe"
                                    : t.status === "Closed Lost"
                                    ? "#fee2e2"
                                    : "#fef3c7",
                                color:
                                  t.status === "Closed Won"
                                    ? "#15803d"
                                    : t.status === "Buyer Registered"
                                    ? "#0369a1"
                                    : t.status === "Closed Lost"
                                    ? "#b91c1c"
                                    : "#92400e",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                                display: "inline-block",
                              }}
                            >
                              {t.status}
                            </span>
                            {t.closeLostReason && (
                              <div style={{ fontSize: 10, color: "#b91c1c", marginTop: 2 }}>Reason: {t.closeLostReason}</div>
                            )}
                            <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>Sign-Off: {t.approvedByOwner}</div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {t.status !== "Closed Won" && t.status !== "Closed Lost" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc" }}
                                  onClick={() => handleOpenRegisterBuyer(t)}
                                >
                                  👤 Register Buyer
                                </button>
                              )}

                              {t.status !== "Closed Won" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}
                                  onClick={() => handleCloseWonAction(t)}
                                >
                                  🟢 Close Won
                                </button>
                              )}

                              {t.status !== "Closed Lost" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}
                                  onClick={() => handleOpenCloseLost(t)}
                                >
                                  🔴 Close Lost
                                </button>
                              )}

                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditTradeModal(t)}
                              >
                                ✏️ Update Status
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 15. INVENTORY */}
          {activeTab === "inventory" && (
            <div className="rhps-view">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0 }}>
                    {inventoryCategoryFilter === "Personal Inventory"
                      ? "👤 Personal Inventory Units"
                      : inventoryCategoryFilter === "Shop Inventory"
                      ? "🏪 Store Inventory Units"
                      : "🌐 All Store & Personal Inventory Units"}
                  </h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
                    Manage inventory categorization between Store Inventory (Sales) and Personal Inventory (Owner/Private).
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ background: "#0f172a", color: "#ffffff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
                  onClick={() => openCreateInventoryModal()}
                >
                  ➕ Add Unit
                </button>
              </div>

              {/* INVENTORY CATEGORY TABS BAR */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16, background: "#f8fafc", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={{
                      borderRadius: 20,
                      padding: "7px 18px",
                      fontWeight: 700,
                      fontSize: 13,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: inventoryCategoryFilter === "Shop Inventory" ? "#0f172a" : "#ffffff",
                      color: inventoryCategoryFilter === "Shop Inventory" ? "#ffffff" : "#475569",
                      boxShadow: inventoryCategoryFilter === "Shop Inventory" ? "0 2px 6px rgba(15,23,42,0.25)" : "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                    onClick={() => setInventoryCategoryFilter("Shop Inventory")}
                  >
                    🏪 Shop Inventory ({shopUnitsCount})
                  </button>

                  <button
                    type="button"
                    style={{
                      borderRadius: 20,
                      padding: "7px 18px",
                      fontWeight: 700,
                      fontSize: 13,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: inventoryCategoryFilter === "Personal Inventory" ? "#0f172a" : "#ffffff",
                      color: inventoryCategoryFilter === "Personal Inventory" ? "#ffffff" : "#475569",
                      boxShadow: inventoryCategoryFilter === "Personal Inventory" ? "0 2px 6px rgba(15,23,42,0.25)" : "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                    onClick={() => setInventoryCategoryFilter("Personal Inventory")}
                  >
                    👤 Personal Inventory ({personalUnitsCount})
                  </button>

                  <button
                    type="button"
                    style={{
                      borderRadius: 20,
                      padding: "7px 18px",
                      fontWeight: 700,
                      fontSize: 13,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: inventoryCategoryFilter === "ALL" ? "#0f172a" : "#ffffff",
                      color: inventoryCategoryFilter === "ALL" ? "#ffffff" : "#475569",
                      boxShadow: inventoryCategoryFilter === "ALL" ? "0 2px 6px rgba(15,23,42,0.25)" : "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                    onClick={() => setInventoryCategoryFilter("ALL")}
                  >
                    🌐 All Units ({inventory.length})
                  </button>
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                  Showing <strong style={{ color: "#0f172a" }}>{filteredInventory.length}</strong> unit(s) • Total Valuation: <strong style={{ color: "#166534" }}>₱{filteredInventory.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</strong>
                </div>
              </div>

              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Inventory ID</th>
                    <th>Category</th>
                    <th>Brand & Model</th>
                    <th>Serial Number</th>
                    <th>Condition</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Reserved Info</th>
                    <th>Sold Info</th>
                    <th>Photos</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        No inventory units found under <strong>{inventoryCategoryFilter}</strong>.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((inv) => {
                      const isPersonal = (inv.inventoryCategory || "Shop Inventory") === "Personal Inventory";
                      return (
                        <tr key={inv.id}>
                          <td><strong>{inv.id}</strong></td>
                          <td>
                            {isPersonal ? (
                              <span style={{ background: "#f3e8ff", color: "#7e22ce", border: "1px solid #d8b4fe", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                👤 Personal
                              </span>
                            ) : (
                              <span style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                🏪 Shop
                              </span>
                            )}
                          </td>
                          <td>
                            <div><strong>{inv.brand} {inv.model}</strong></div>
                            {inv.notes && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{inv.notes}</div>}
                          </td>
                          <td>{inv.serialNumber}</td>
                          <td>{inv.condition}</td>
                          <td>₱{inv.price.toLocaleString()}</td>
                          <td>{inv.status}</td>
                          <td style={{ fontSize: 12 }}>
                            {inv.reservedBy ? (
                              <>
                                <div><strong>{inv.reservedBy}</strong></div>
                                <div style={{ color: "#64748b" }}>Until: {inv.reservedUntil || "N/A"}</div>
                              </>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>None</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {inv.soldTo ? (
                              <>
                                <div><strong>{inv.soldTo}</strong></div>
                                <div style={{ color: "#64748b" }}>Date: {inv.soldDate || "N/A"}</div>
                              </>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>Not Sold</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12 }}>{inv.photos?.length || 0} photo(s)</td>
                          <td>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                              <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => openEditInventoryModal(inv)}>
                                ✏️ Edit Details
                              </button>
                              <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => openEditInventoryModal(inv)}>
                                📷 Upload Photos
                              </button>
                              {inv.status !== "Reserved" && inv.status !== "Sold" && (
                                <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#dbeafe", border: "1px solid #93c5fd", color: "#1d4ed8" }} onClick={() => openReserveInventoryModal(inv)}>
                                  🔒 Reserve
                                </button>
                              )}
                              {inv.status === "Reserved" && (
                                <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }} onClick={() => openReleaseReservationModal(inv)}>
                                  🔓 Release Reservation
                                </button>
                              )}
                              {inv.status !== "Sold" && (
                                <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }} onClick={() => openMarkSoldModal(inv)}>
                                  ✅ Mark Sold
                                </button>
                              )}
                              <button className="secondary-sm" style={{ fontSize: 11, padding: "4px 8px", background: "#ede9fe", border: "1px solid #c4b5fd", color: "#5b21b6" }} onClick={() => openAdjustPriceModal(inv)}>
                                💰 Adjust Price
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 16. DOCUMENTS MODULE */}
          {activeTab === "documents" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>📁 Generated Documents & Official Records</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Centralized document repository. Auto-assigned document numbering, record mode tagging (`ACTUAL` vs `TEST RECORD ONLY`), and critical fail safeguards preventing test amounts from entering financial totals.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    className="primary"
                    style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => openCreateDocModal("Quotation")}
                  >
                    📝 Generate Quotation
                  </button>
                  <button
                    className="primary"
                    style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "#0284c7", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => openCreateDocModal("Estimate")}
                  >
                    📜 Generate Estimate
                  </button>
                  <button
                    className="primary"
                    style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "#d97706", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => openCreateDocModal("Job Order")}
                  >
                    🛠️ Generate Job Order
                  </button>
                  <button
                    className="primary"
                    style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "#4f46e5", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => openCreateDocModal("Service Report")}
                  >
                    📋 Generate Service Report
                  </button>
                  <button
                    className="primary"
                    style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "#059669", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => openCreateDocModal("Invoice")}
                  >
                    🧾 Generate Invoice
                  </button>
                  <button
                    className="primary"
                    style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, background: "#166534", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => openCreateDocModal("Payment Acknowledgment")}
                  >
                    💳 Generate Payment Ack
                  </button>
                </div>
              </div>

              {/* TEST RECORD SAFEGUARD BANNER */}
              <div style={{ background: "#fffbebf5", border: "1px solid #fde68a", padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#92400e" }}>
                <div>
                  <strong>🛡️ TEST RECORD SAFEGUARD ACTIVE:</strong> All records tagged with <strong>Record Type = TEST</strong> display a prominent <code>TEST RECORD ONLY</code> badge and are strictly excluded from actual income, expense, balance, or dashboard totals.
                </div>
                <span style={{ background: "#d97706", color: "#ffffff", padding: "2px 10px", borderRadius: 99, fontWeight: 800, fontSize: 11 }}>Critical Fail Rule Enforced</span>
              </div>

              {/* METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Documents</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{documents.length}</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📄 Total Repository Files</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actual Records</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#059669", margin: "4px 0" }}>
                    {documents.filter((d) => d.recordType === "ACTUAL").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>✅ Official Business Files</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Test Records</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#d97706", margin: "4px 0" }}>
                    {documents.filter((d) => d.recordType === "TEST").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>⚠️ Test Safeguard Mode</span>
                </div>

                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sent Documents</span>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0284c7", margin: "4px 0" }}>
                    {documents.filter((d) => d.status === "Sent").length}
                  </div>
                  <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>📲 Dispatched to Clients</span>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="purely-card-white" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["All", "Estimate", "Quotation", "Job Order", "Service Report", "Invoice", "Payment Acknowledgment"] as const).map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background: docTypeFilter === dt ? "#0f172a" : "#ffffff",
                        color: docTypeFilter === dt ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setDocTypeFilter(dt)}
                    >
                      {dt === "All" ? "All Types" : dt}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    className="input-field"
                    style={{ fontSize: 12, padding: "6px 10px", width: 130 }}
                    value={docRecordTypeFilter}
                    onChange={(e) => setDocRecordTypeFilter(e.target.value as any)}
                  >
                    <option value="All">All Modes</option>
                    <option value="ACTUAL">ACTUAL</option>
                    <option value="TEST">TEST ONLY</option>
                  </select>

                  <input
                    className="input-field"
                    style={{ fontSize: 12, padding: "8px 12px", width: 220 }}
                    placeholder="🔍 Search Doc No, Source, Case..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* DOCUMENTS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Document No. (Auto-Assigned)</th>
                      <th>Document Type</th>
                      <th>Record Type</th>
                      <th>Linked Source Record & Case</th>
                      <th>Date & Generated By</th>
                      <th>Generating Module</th>
                      <th>Ownership Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Document Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents
                      .filter((d) => {
                        if (docTypeFilter !== "All" && d.documentType !== docTypeFilter) return false;
                        if (docFilter !== "All" && d.status !== docFilter) return false;
                        if (docRecordTypeFilter !== "All" && d.recordType !== docRecordTypeFilter) return false;
                        if (docSearch) {
                          const query = docSearch.toLowerCase();
                          return (
                            d.id.toLowerCase().includes(query) ||
                            d.linkedSourceRecordNo.toLowerCase().includes(query) ||
                            d.linkedCaseId.toLowerCase().includes(query) ||
                            d.generatedBy.toLowerCase().includes(query) ||
                            (d.notes && d.notes.toLowerCase().includes(query))
                          );
                        }
                        return true;
                      })
                      .map((d) => (
                        <tr key={d.id} style={{ background: d.recordType === "TEST" ? "#fffbebf5" : undefined }}>
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedDocDetail(d)}
                            >
                              {d.id}
                            </button>
                            <div style={{ fontSize: 10, color: "#64748b" }}>Auto-Assigned</div>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12.5, color: "#0f172a" }}>{d.documentType}</strong>
                          </td>
                          <td>
                            {d.recordType === "TEST" ? (
                              <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 900 }}>
                                ⚠️ TEST RECORD ONLY
                              </span>
                            ) : (
                              <span style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>
                                ACTUAL RECORD
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📄 Source: {d.linkedSourceRecordNo}</div>
                            <div style={{ fontSize: 10.5, color: "#3730a3" }}>📁 Case: {d.linkedCaseId}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>📅 {d.dateGenerated}</div>
                            <div style={{ fontSize: 10.5, color: "#64748b" }}>By: {d.generatedBy}</div>
                          </td>
                          <td>
                            <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>
                              {d.generatingModule}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: 11, color: "#334155" }}>{d.documentOwnershipRole}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background:
                                  d.status === "Sent"
                                    ? "#dbeafe"
                                    : d.status === "Generated"
                                      ? "#dcfce7"
                                      : "#f1f5f9",
                                color:
                                  d.status === "Sent"
                                    ? "#1e40af"
                                    : d.status === "Generated"
                                      ? "#15803d"
                                      : "#64748b",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => setSelectedDocDetail(d)}
                              >
                                👁 Inspect
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 10.5, padding: "3px 8px" }}
                                onClick={() => openEditDocModal(d)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 17. PUBLIC WEBSITE */}
          {activeTab === "public_website" && (
            <div className="rhps-view">
              <h2>Public Website Preview</h2>
              <p>Preview of public website pages for R. Herrero Pianos & Services.</p>
            </div>
          )}

          {/* 18. WEBSITE EDITOR */}
          {activeTab === "website_editor" && (
            <div className="rhps-view">
              <h2>Website Editor</h2>
              <p>Edit section text, hero imagery, and service offerings for the public site.</p>
            </div>
          )}

          {/* 19. BACKUP MODULE */}
          {activeTab === "backup" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>💾 System Backup & Disaster Recovery</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Automated snapshots, owner-only restore protection, and backup integrity auditing.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="secondary-sm"
                    style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13 }}
                    onClick={() => {
                      const failedCount = backups.filter((b) => b.status === "Failed").length;
                      if (failedCount > 0) {
                        showToast(`⚠️ Alert: ${failedCount} backup(s) failed storage sync. Retry recommended.`);
                      } else {
                        showToast("🟢 All backup snapshots are healthy and verified.");
                      }
                    }}
                  >
                    🛡️ Security Audit
                  </button>
                  <button
                    className="primary"
                    style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => setShowCreateBackupModal(true)}
                  >
                    ＋ Create New Backup
                  </button>
                </div>
              </div>

              {/* FAILED BACKUP WARNING BANNER (Visibly Flagged Rules) */}
              {backups.some((b) => b.status === "Failed") && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#991b1b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>⚠️</span>
                    <div>
                      <strong style={{ fontSize: 14, display: "block" }}>Failed Backup Flagged: System Action Required</strong>
                      <span style={{ fontSize: 12, opacity: 0.9 }}>
                        {backups.find((b) => b.status === "Failed")?.id} failed during storage sync. Actual/Test record boundaries remain protected.
                      </span>
                    </div>
                  </div>
                  <button
                    className="secondary-sm"
                    style={{ background: "#ffffff", color: "#991b1b", border: "1px solid #fca5a5", fontWeight: 700 }}
                    onClick={() => setShowCreateBackupModal(true)}
                  >
                    🔄 Create Fresh Backup
                  </button>
                </div>
              )}

              {/* SUMMARY METRICS STRIP */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Snapshots</span>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>{backups.length} Records</div>
                  <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>🟢 Storage Health Normal</span>
                </div>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Created</span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "8px 0" }}>{backups[0]?.dateTimeCreated || "N/A"}</div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Scope: {backups[0]?.backupScope || "Full System"}</span>
                </div>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Restore Safeguard</span>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: "8px 0" }}>Owner-Only (Robert)</div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>📸 Auto Pre-Snapshot Active</span>
                </div>
                <div className="purely-card-white" style={{ padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Test Restore Result</span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#059669", margin: "6px 0" }}>
                    {backups.find((b) => b.testRestoreResult === "Pass") ? "✅ Pass (Audited)" : "Untested"}
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Boundaries Isolated</span>
                </div>
              </div>

              {/* FILTER TABS & SEARCH */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, background: "#e1e2e4", padding: 4, borderRadius: 10 }}>
                  {(["All", "Completed", "Failed", "Restored"] as const).map((tab) => (
                    <button
                      key={tab}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background: backupFilter === tab ? "#0f172a" : "transparent",
                        color: backupFilter === tab ? "#ffffff" : "#475569",
                      }}
                      onClick={() => setBackupFilter(tab)}
                    >
                      {tab === "Failed" && backups.some((b) => b.status === "Failed") ? "⚠️ Failed" : tab}
                    </button>
                  ))}
                </div>

                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                  Showing {backups.filter((b) => {
                    if (backupFilter === "Completed") return b.status === "Completed";
                    if (backupFilter === "Failed") return b.status === "Failed";
                    if (backupFilter === "Restored") return !!b.restoreDateTime;
                    return true;
                  }).length} snapshot log(s)
                </span>
              </div>

              {/* BACKUP RECORDS TABLE */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <table className="rhps-table" style={{ margin: 0, borderRadius: 0, border: "none" }}>
                  <thead>
                    <tr>
                      <th>Backup ID</th>
                      <th>Date / Time Created</th>
                      <th>Type</th>
                      <th>Scope</th>
                      <th>File Size</th>
                      <th>Triggered By</th>
                      <th>Status</th>
                      <th>Test Result</th>
                      <th style={{ textAlign: "right" }}>Owner Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups
                      .filter((b) => {
                        if (backupFilter === "Completed") return b.status === "Completed";
                        if (backupFilter === "Failed") return b.status === "Failed";
                        if (backupFilter === "Restored") return !!b.restoreDateTime;
                        return true;
                      })
                      .map((b) => (
                        <tr
                          key={b.id}
                          style={{
                            background: b.status === "Failed" ? "#fff5f5" : b.restoreDateTime ? "#f0fdf4" : undefined,
                          }}
                        >
                          <td>
                            <button
                              style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: 800, cursor: "pointer", textDecoration: "underline", padding: 0 }}
                              onClick={() => setSelectedBackupDetail(b)}
                            >
                              {b.id}
                            </button>
                            {b.preRestoreSnapshotRef && (
                              <span style={{ display: "block", fontSize: 10, color: "#059669", fontWeight: 700 }}>
                                📸 Pre-Snap: {b.preRestoreSnapshotRef}
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>{b.dateTimeCreated}</strong>
                            {b.restoreDateTime && (
                              <span style={{ display: "block", fontSize: 11, color: "#16a34a", fontWeight: 700 }}>
                                Restored: {b.restoreDateTime}
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ background: b.backupType === "Manual" ? "#eff6ff" : "#f1f5f9", color: b.backupType === "Manual" ? "#1d4ed8" : "#475569", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              {b.backupType}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: 12, color: "#0f172a" }}>{b.backupScope}</strong>
                          </td>
                          <td>{b.fileSize}</td>
                          <td>{b.triggeredBy}</td>
                          <td>
                            {b.status === "Completed" && (
                              <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                                ✓ Completed
                              </span>
                            )}
                            {b.status === "Failed" && (
                              <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                ⚠️ Failed
                              </span>
                            )}
                            {b.status === "In Progress" && (
                              <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                                ⚙ In Progress
                              </span>
                            )}
                          </td>
                          <td>
                            {b.testRestoreResult === "Pass" ? (
                              <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 12 }}>✓ Pass</span>
                            ) : b.testRestoreResult === "Fail" ? (
                              <span style={{ color: "#dc2626", fontWeight: 800, fontSize: 12 }}>✗ Fail</span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: 11 }}>Untested</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 8px" }}
                                onClick={() => {
                                  showToast(`📥 Downloading ${b.id} (${b.fileSize})...`);
                                }}
                              >
                                📥 Download
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 8px" }}
                                onClick={() => handleTestRestoreClick(b)}
                              >
                                🧪 Test
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 8px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", fontWeight: 700 }}
                                onClick={() => setShowRestoreModal(b)}
                              >
                                🔒 Restore
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 20. SYSTEM SETTINGS & CONFIGURATION */}
          {activeTab === "settings" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>⚙️ System Settings & Configuration</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Manage business profiles, document numbering, tax compliance, roles, themes, and account security.
                  </p>
                </div>
                <button
                  className="primary"
                  style={{ padding: "10px 24px", borderRadius: 10, fontWeight: 800, background: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer" }}
                  onClick={() => showToast("⚙️ All system settings saved successfully!")}
                >
                  💾 Save All Settings
                </button>
              </div>

              {/* SECTION 1: BUSINESS & OWNER PROFILE */}
              <div className="purely-card-white" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
                  🏢 Business Profile & Tax Compliance
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  <div className="form-group">
                    <label>Business Name <span className="required-star">*</span></label>
                    <input
                      className="input-field"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Owner Name <span className="required-star">*</span></label>
                    <input
                      className="input-field"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>Business Address</label>
                    <input
                      className="input-field"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Owner Contact (Phone / Email)</label>
                    <input
                      className="input-field"
                      value={ownerContact}
                      onChange={(e) => setOwnerContact(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Business Logo / Seal</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        className="input-field"
                        value={businessLogo}
                        onChange={(e) => setBusinessLogo(e.target.value)}
                      />
                      <button className="secondary-sm" style={{ flexShrink: 0 }} onClick={() => showToast("🖼 Logo updated!")}>
                        Upload
                      </button>
                    </div>
                  </div>

                  {/* REGISTERED TOGGLE */}
                  <div className="form-group" style={{ gridColumn: "span 2", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={isRegistered}
                        onChange={(e) => setIsRegistered(e.target.checked)}
                        style={{ width: 18, height: 18 }}
                      />
                      <span>Tax / BIR Registered Entity (`Registered = Yes`)</span>
                    </label>
                    <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                      TIN Number and VAT/Non-VAT status fields appear automatically when registered is set to Yes.
                    </span>
                  </div>

                  {/* CONDITIONAL TAX FIELDS (Visible ONLY if Registered = Yes) */}
                  {isRegistered && (
                    <>
                      <div className="form-group">
                        <label>TIN Number (Tax Identification Number) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          value={tin}
                          onChange={(e) => setTin(e.target.value)}
                          placeholder="e.g. 482-910-384-0000"
                        />
                      </div>

                      <div className="form-group">
                        <label>VAT / Non-VAT Status <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={vatStatus}
                          onChange={(e) => setVatStatus(e.target.value as "VAT Registered" | "Non-VAT Registered")}
                        >
                          <option value="VAT Registered">VAT Registered (12% Standard VAT)</option>
                          <option value="Non-VAT Registered">Non-VAT Registered</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION 2: DOCUMENT NUMBERING CONFIGURATION (Per Document Type) */}
              <div className="purely-card-white" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                      🔢 Document Numbering Configuration
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                      Configure custom prefix, current running counter, and annual year-reset rules per document type.
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="rhps-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>Prefix</th>
                        <th>Current Running Number</th>
                        <th>Year-Reset Rule (`Yes`/`No`)</th>
                        <th>Sample Output Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docConfigs.map((cfg, idx) => (
                        <tr key={cfg.docType}>
                          <td><strong>{cfg.docType}</strong></td>
                          <td>
                            <input
                              className="input-field"
                              style={{ width: 100, padding: "4px 8px", fontSize: 13 }}
                              value={cfg.prefix}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDocConfigs(docConfigs.map((c, i) => i === idx ? { ...c, prefix: val } : c));
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="input-field"
                              style={{ width: 110, padding: "4px 8px", fontSize: 13 }}
                              value={cfg.currentNumber}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setDocConfigs(docConfigs.map((c, i) => i === idx ? { ...c, currentNumber: val } : c));
                              }}
                            />
                          </td>
                          <td>
                            <select
                              className="input-field"
                              style={{ width: 100, padding: "4px 8px", fontSize: 13 }}
                              value={cfg.yearResetRule}
                              onChange={(e) => {
                                const val = e.target.value as "Yes" | "No";
                                setDocConfigs(docConfigs.map((c, i) => i === idx ? { ...c, yearResetRule: val } : c));
                              }}
                            >
                              <option value="Yes">Yes (Annual)</option>
                              <option value="No">No (Continuous)</option>
                            </select>
                          </td>
                          <td>
                            <code style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: 6, fontWeight: 700, color: "#0f172a" }}>
                              {cfg.prefix}2026-{String(cfg.currentNumber).padStart(3, "0")}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: APPEARANCE, THEMES & SYSTEM DEFAULTS */}
              <div className="purely-card-white" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
                  🎨 Appearance, Theme & System Defaults
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                  <div className="form-group">
                    <label>System Theme</label>
                    <select
                      className="input-field"
                      value={activeTheme}
                      onChange={(e) => {
                        setActiveTheme(e.target.value);
                        showToast(`🎨 Theme switched to ${e.target.value}`);
                      }}
                    >
                      <option value="Seasalt & Platinum (Default Eye-Care)">🌿 Seasalt & Platinum (Soft Eye-Care)</option>
                      <option value="Warm Blush Plum">🌸 Warm Blush Plum (CV Classic)</option>
                      <option value="Midnight Slate">🌙 Midnight Slate</option>
                      <option value="Corporate Blue">🔵 Corporate Blue</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Font Size Options</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["Medium", "Large", "Extra Large"] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            border: "1px solid #cbd5e1",
                            cursor: "pointer",
                            background: fontSize === sz ? "#0f172a" : "#ffffff",
                            color: fontSize === sz ? "#ffffff" : "#475569",
                          }}
                          onClick={() => {
                            setFontSize(sz);
                            showToast(`🔤 Font size changed to ${sz}`);
                          }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Backup Reminder Frequency</label>
                    <select
                      className="input-field"
                      value={backupReminderFreq}
                      onChange={(e) => setBackupReminderFreq(e.target.value as "Daily" | "Weekly" | "Monthly")}
                    >
                      <option value="Daily">Daily (Recommended for Active Business)</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>Default Payment Terms</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={defaultPaymentTerms}
                      onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2", background: "#0f172a", color: "#ffffff", padding: 12, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <strong style={{ fontSize: 13, display: "block" }}>⚡ Convert Target (Late-Encoding Shortcut)</strong>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>Already approved or in-progress? Convert immediately upon saving!</span>
                        </div>
                        <select
                          className="input-field"
                          style={{ width: "auto", background: "#1e293b", color: "#ffffff", borderColor: "#334155", fontWeight: 700, fontSize: 12 }}
                          value={estConvertTarget}
                          onChange={(e) => setEstConvertTarget(e.target.value)}
                        >
                          <option value="ESTIMATES">📐 ESTIMATES (Draft)</option>
                          <option value="QUOTATION">📄 QUOTATION</option>
                          <option value="JOB ORDER">🛠️ JOB ORDER</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>System Administration Notes</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={systemNotes}
                      onChange={(e) => setSystemNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: MULTI-USER ROLES & PERMISSIONS */}
              <div className="purely-card-white" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                      👥 Multi-User Roles & Permitted Actions
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                      Control user roles (`Owner`, `Staff`, `Technician`) and permitted action scopes across RHPS OS.
                    </p>
                  </div>
                  <button
                    className="secondary-sm"
                    style={{ padding: "6px 14px", fontWeight: 700 }}
                    onClick={() => setShowAddUserModal(true)}
                  >
                    ＋ Add User Role
                  </button>
                </div>

                <table className="rhps-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Permitted Actions Scope</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRoles.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.id}</strong></td>
                        <td><strong>{u.name}</strong></td>
                        <td>
                          <span
                            style={{
                              background: u.role === "Owner" ? "#fef3c7" : u.role === "Staff" ? "#eff6ff" : "#f1f5f9",
                              color: u.role === "Owner" ? "#92400e" : u.role === "Staff" ? "#1d4ed8" : "#475569",
                              padding: "3px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td><span style={{ fontSize: 12.5, color: "#334155" }}>{u.permittedActions}</span></td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="secondary-sm"
                            style={{ fontSize: 11, padding: "2px 8px" }}
                            onClick={() => showToast(`Edit action for ${u.name}`)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SECTION 5: ACCOUNT PASSWORD & SECURITY (Never displays current password) */}
              <div className="purely-card-white" style={{ display: "flex", flexDirection: "column", gap: 18, border: "1px solid #cbd5e1" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                    🔒 Account Password & Security Management
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                    Managed securely. Existing passwords are never displayed. Update owner credentials safely.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!currentPassword) {
                      showToast("⚠️ Current password is required.");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      showToast("⚠️ New password and confirmation do not match!");
                      return;
                    }
                    if (newPassword.length < 6) {
                      showToast("⚠️ Password must be at least 6 characters.");
                      return;
                    }
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    showToast("🔒 Account password updated successfully!");
                  }}
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, alignItems: "flex-end" }}
                >
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      className="input-field"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="input-field"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="input-field"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="primary"
                      style={{ padding: "10px 22px", borderRadius: 10, fontWeight: 700, width: "100%" }}
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 21. RHPS PIANO MASTER AI */}
          {activeTab === "ai_assistant" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2>🤖 RHPS Master AI</h2>
                  <p className="subtitle">Your private AI assistant for piano service operations in Davao & Mindanao.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "#84cc16", padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 800, letterSpacing: "0.04em" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#84cc16", display: "inline-block", boxShadow: "0 0 6px #84cc16" }} />
                  RHPS Master AI — Active
                </div>
              </div>

              {/* QUICK AI PRESET CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <button
                  className="purely-card-white"
                  onClick={() => sendAiMessage("Draft a professional repair quotation scope for a Yamaha U3 upright piano needing A440 tuning and action regulation in Davao.")}
                  style={{ textAlign: "left", cursor: "pointer", border: "1px solid #e2e8f0", background: "#ffffff", padding: 16 }}
                >
                  <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>📋</span>
                  <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>Draft Service Quotation</strong>
                  <small style={{ fontSize: 11, color: "#64748b" }}>Action regulation, A440 pitch raise, hammer voicing</small>
                </button>

                <button
                  className="purely-card-white"
                  onClick={() => sendAiMessage("Draft a friendly 6-month piano tuning SMS reminder for client Atty. Fernando Alonso.")}
                  style={{ textAlign: "left", cursor: "pointer", border: "1px solid #e2e8f0", background: "#ffffff", padding: 16 }}
                >
                  <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>📲</span>
                  <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>6-Month Tuning SMS</strong>
                  <small style={{ fontSize: 11, color: "#64748b" }}>Friendly reminder for Davao acoustic piano owners</small>
                </button>

                <button
                  className="purely-card-white"
                  onClick={() => sendAiMessage("How do I fix sticky piano keys and sluggish hammer return caused by Davao's high humidity?")}
                  style={{ textAlign: "left", cursor: "pointer", border: "1px solid #e2e8f0", background: "#ffffff", padding: 16 }}
                >
                  <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>🔧</span>
                  <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>Technical Fault Guide</strong>
                  <small style={{ fontSize: 11, color: "#64748b" }}>Diagnose sticky keys & pinblock torque issues</small>
                </button>

                <button
                  className="purely-card-white"
                  onClick={() => sendAiMessage("Summarize my current active piano service job orders, verified revenue, and pending reminders.")}
                  style={{ textAlign: "left", cursor: "pointer", border: "1px solid #e2e8f0", background: "#ffffff", padding: 16 }}
                >
                  <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>📊</span>
                  <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>Business Summary</strong>
                  <small style={{ fontSize: 11, color: "#64748b" }}>Analyze active jobs and verified revenue</small>
                </button>
              </div>

              {/* AI CHAT MESSAGES FEED */}
              <div
                ref={chatBoxRef}
                className="purely-card-white"
                style={{ display: "flex", flexDirection: "column", gap: 16, height: 460, overflowY: "auto", padding: 24, scrollBehavior: "smooth" }}
              >
                {aiMessages.map((msg, index) => {
                  const isLastAssistant = msg.role === "assistant" && index === aiMessages.length - 1;
                  const chips = isLastAssistant ? getSmartChips(msg.content) : [];
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      {/* Role label */}
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {msg.role === "user" ? "🙋 You" : "🤖 RHPS Master AI"}
                      </span>

                      {/* Message bubble */}
                      <div
                        style={{
                          maxWidth: "88%",
                          background: msg.role === "user" ? "linear-gradient(135deg,#0f172a,#1e293b)" : "#f8fafc",
                          color: msg.role === "user" ? "#ffffff" : "#0f172a",
                          border: msg.role === "user" ? "none" : "1px solid #e2e8f0",
                          borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                          padding: "16px 20px",
                          fontSize: 13.5,
                          lineHeight: 1.7,
                          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        }}
                      >
                        {msg.role === "user" ? (
                          <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                        ) : (
                          renderRhpsAiMarkdown(msg.content)
                        )}
                      </div>

                      {/* Action buttons under assistant messages */}
                      {msg.role === "assistant" && index > 0 && (
                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                          <button
                            className="secondary-sm"
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, cursor: "pointer" }}
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              showToast("📋 Copied to clipboard!");
                            }}
                          >
                            📋 Copy Text
                          </button>
                          <button
                            className="secondary-sm"
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, cursor: "pointer", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
                            onClick={() => {
                              setActiveTab("quotations");
                              mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                              showToast("📋 Switched to Quotations tab — paste your AI draft there!");
                            }}
                          >
                            📋 → Quotation
                          </button>
                          <button
                            className="secondary-sm"
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, cursor: "pointer", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                            onClick={() => {
                              setActiveTab("follow_ups");
                              mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                              showToast("📲 Switched to Follow-Ups tab — paste your AI reminder there!");
                            }}
                          >
                            📲 → Send as SMS
                          </button>
                          <button
                            className="secondary-sm"
                            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, cursor: "pointer", background: "#fefce8", color: "#a16207", border: "1px solid #fde68a" }}
                            onClick={() => {
                              setActiveTab("invoices");
                              mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                              showToast("🧾 Switched to Invoices tab — paste your AI description there!");
                            }}
                          >
                            🧾 → Invoice
                          </button>
                        </div>
                      )}

                      {/* Upgrade 3: Smart Follow-Up Chips (last AI message only) */}
                      {isLastAssistant && chips.length > 0 && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          {chips.map((chip) => (
                            <button
                              key={chip}
                              onClick={() => sendAiMessage(chip)}
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "6px 14px",
                                borderRadius: 99,
                                border: "1.5px solid #cbd5e1",
                                background: "#ffffff",
                                color: "#334155",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => { (e.currentTarget.style.background = "#0f172a"); (e.currentTarget.style.color = "#ffffff"); }}
                              onMouseLeave={(e) => { (e.currentTarget.style.background = "#ffffff"); (e.currentTarget.style.color = "#334155"); }}
                            >
                              ✨ {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {aiLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13, fontStyle: "italic", padding: 12 }}>
                    <span style={{ fontSize: 20, animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span>
                    RHPS Master AI is thinking...
                  </div>
                )}
              </div>

              {/* Upgrade 4 — Clear history button */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="secondary-sm"
                  style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, color: "#ef4444", border: "1px solid #fecaca", background: "#fff1f1" }}
                  onClick={() => {
                    setAiMessages([WELCOME_MSG]);
                    localStorage.removeItem(AI_STORAGE_KEY);
                    showToast("🗑 Chat history cleared.");
                  }}
                >
                  🗑 Clear Chat History
                </button>
              </div>

              {/* CHAT INPUT FORM — Upgrade 5: Voice Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendAiMessage();
                }}
                style={{ display: "flex", gap: 12, alignItems: "stretch" }}
              >
                {/* Upgrade 5: Microphone voice button */}
                <button
                  type="button"
                  onClick={startVoiceInput}
                  title="Voice Input — tap and speak"
                  style={{
                    padding: "0 16px",
                    borderRadius: 14,
                    border: isListening ? "2px solid #ef4444" : "1.5px solid #cbd5e1",
                    background: isListening ? "#fee2e2" : "#f8fafc",
                    fontSize: 20,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {isListening ? "🔴" : "🎤"}
                </button>

                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={isListening ? "Listening... speak now 🎤" : "Ask RHPS Master AI anything (or tap 🎤 to speak)..."}
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: 14,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 14,
                    outline: "none",
                    background: isListening ? "#fefce8" : "#ffffff",
                    transition: "background 0.2s",
                  }}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  className="primary"
                  style={{ padding: "14px 28px", borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: aiLoading ? "wait" : "pointer", flexShrink: 0 }}
                >
                  {aiLoading ? "⚙️ Thinking..." : "Send ➔"}
                </button>
              </form>
            </div>
          )}

          {/* INVENTORY CREATE/EDIT MODAL */}
          {showInventoryModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowInventoryModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 760 }}>
                <div className="rhps-modal-header">
                  <h3>{editingInventory ? `✏️ Edit Inventory Unit — ${editingInventory.id}` : "➕ Add Inventory Unit"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowInventoryModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveInventorySubmit}>
                  <div className="rhps-modal-body" style={{ gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Brand <span className="required-star">*</span></label>
                        <input className="input-field" required value={invBrand} onChange={(e) => setInvBrand(e.target.value)} placeholder="e.g. Yamaha" />
                      </div>
                      <div className="form-group">
                        <label>Model <span className="required-star">*</span></label>
                        <input className="input-field" required value={invModel} onChange={(e) => setInvModel(e.target.value)} placeholder="e.g. U1 Professional Upright" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Inventory Category <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          style={{ fontWeight: 700, color: invCategory === "Personal Inventory" ? "#7e22ce" : "#0369a1", borderColor: invCategory === "Personal Inventory" ? "#c084fc" : "#38bdf8" }}
                          value={invCategory}
                          onChange={(e) => setInvCategory(e.target.value as InventoryCategory)}
                        >
                          <option value="Shop Inventory">🏪 Shop Inventory (Store Sales)</option>
                          <option value="Personal Inventory">👤 Personal Inventory (Owner / Private)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select className="input-field" value={invStatus} onChange={(e) => setInvStatus(e.target.value as InventoryUnit["status"])}>
                          <option value="In Stock">In Stock</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                          <option value="Under Repair">Under Repair</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Record Mode</label>
                        <select className="input-field" value={invRecordMode} onChange={(e) => setInvRecordMode(e.target.value as RecordMode)}>
                          <option value="ACTUAL">ACTUAL</option>
                          <option value="TEST">TEST</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Serial Number <span className="required-star">*</span></label>
                        <input className="input-field" required value={invSerialNo} onChange={(e) => setInvSerialNo(e.target.value)} placeholder="e.g. YM-491028" />
                      </div>

                      <div className="form-group">
                        <label>Condition</label>
                        <select className="input-field" value={invCondition} onChange={(e) => setInvCondition(e.target.value as InventoryUnit["condition"])}>
                          <option value="Refurbished">Refurbished</option>
                          <option value="Pre-Owned Excellent">Pre-Owned Excellent</option>
                          <option value="Brand New">Brand New</option>
                          <option value="As Is">As Is</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Price (PHP) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          min={0}
                          className="input-field"
                          required
                          value={Number.isFinite(invPrice) ? invPrice : 0}
                          onChange={(e) => setInvPrice(Number(e.target.value || 0))}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Status</label>
                        <select className="input-field" value={invStatus} onChange={(e) => setInvStatus(e.target.value as InventoryUnit["status"])}>
                          <option value="In Stock">In Stock</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                          <option value="Under Repair">Under Repair</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Record Mode</label>
                        <select className="input-field" value={invRecordMode} onChange={(e) => setInvRecordMode(e.target.value as RecordMode)}>
                          <option value="ACTUAL">ACTUAL</option>
                          <option value="TEST">TEST</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
                      <strong style={{ fontSize: 12, color: "#0f172a", display: "block", marginBottom: 8 }}>📷 Upload Photos</strong>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="input-field"
                        onChange={handleInventoryPhotoFilesSelected}
                        style={{ marginBottom: 8 }}
                      />
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input
                          className="input-field"
                          value={invPhotoInput}
                          onChange={(e) => setInvPhotoInput(e.target.value)}
                          placeholder="Paste photo URL or filename"
                          style={{ flex: 1, minWidth: 260 }}
                        />
                        <button type="button" className="secondary-sm" onClick={handleAddPhotoToDraft}>Add Photo</button>
                      </div>
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {invPhotos.length === 0 ? (
                          <span style={{ fontSize: 11, color: "#64748b" }}>No photos yet.</span>
                        ) : (
                          invPhotos.map((photo, idx) => (
                            <span key={`${photo}-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 999, padding: "4px 10px", fontSize: 11 }}>
                              {photo}
                              <button type="button" onClick={() => handleRemovePhotoFromDraft(photo)} style={{ border: "none", background: "transparent", color: "#dc2626", cursor: "pointer", fontWeight: 800 }}>×</button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        className="input-field"
                        rows={3}
                        value={invNotes}
                        onChange={(e) => setInvNotes(e.target.value)}
                        placeholder="Condition details, repairs done, or sales notes"
                      />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowInventoryModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 20px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingInventory ? "💾 Save Details" : "➕ Add Unit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* INVENTORY RESERVE MODAL */}
          {showReserveModal && inventoryActionTarget && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowReserveModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 560 }}>
                <div className="rhps-modal-header">
                  <h3>🔒 Reserve Unit — {inventoryActionTarget.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowReserveModal(false)}>×</button>
                </div>
                <form onSubmit={handleReserveInventorySubmit}>
                  <div className="rhps-modal-body" style={{ gap: 12 }}>
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 10, fontSize: 12, color: "#1e3a8a" }}>
                      Reserving: <strong>{inventoryActionTarget.brand} {inventoryActionTarget.model}</strong>
                    </div>
                    <div className="form-group">
                      <label>Reserved By <span className="required-star">*</span></label>
                      <input className="input-field" required value={reserveByInput} onChange={(e) => setReserveByInput(e.target.value)} placeholder="Buyer / customer name" />
                    </div>
                    <div className="form-group">
                      <label>Reserved Until</label>
                      <input type="date" className="input-field" value={reserveUntilInput} onChange={(e) => setReserveUntilInput(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Reservation Notes</label>
                      <textarea className="input-field" rows={3} value={reserveNotesInput} onChange={(e) => setReserveNotesInput(e.target.value)} placeholder="Deposit details, contact confirmation, etc." />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowReserveModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#1d4ed8", color: "#ffffff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700 }}>
                      🔒 Confirm Reservation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* INVENTORY RELEASE RESERVATION MODAL */}
          {showReleaseReserveModal && inventoryActionTarget && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowReleaseReserveModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 520 }}>
                <div className="rhps-modal-header">
                  <h3>🔓 Release Reservation</h3>
                  <button className="rhps-modal-close" onClick={() => setShowReleaseReserveModal(false)}>×</button>
                </div>
                <div className="rhps-modal-body" style={{ gap: 12 }}>
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: 12, fontSize: 12.5, color: "#92400e" }}>
                    You are about to release reservation for <strong>{inventoryActionTarget.id}</strong>.
                  </div>
                  <div style={{ fontSize: 12.5, color: "#334155" }}>
                    Reserved by: <strong>{inventoryActionTarget.reservedBy || "N/A"}</strong><br />
                    Reserved until: <strong>{inventoryActionTarget.reservedUntil || "N/A"}</strong>
                  </div>
                </div>
                <div className="rhps-modal-footer">
                  <button type="button" className="secondary-sm" onClick={() => setShowReleaseReserveModal(false)}>Cancel</button>
                  <button type="button" className="primary" onClick={handleReleaseReservation} style={{ background: "#d97706", color: "#ffffff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700 }}>
                    🔓 Release Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY MARK SOLD MODAL */}
          {showMarkSoldModal && inventoryActionTarget && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowMarkSoldModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 560 }}>
                <div className="rhps-modal-header">
                  <h3>✅ Mark Unit as Sold — {inventoryActionTarget.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowMarkSoldModal(false)}>×</button>
                </div>
                <form onSubmit={handleMarkSoldSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 12 }}>
                    <div className="form-group">
                      <label>Sold To <span className="required-star">*</span></label>
                      <input className="input-field" required value={markSoldToInput} onChange={(e) => setMarkSoldToInput(e.target.value)} placeholder="Buyer / customer name" />
                    </div>
                    <div className="form-group">
                      <label>Sold Date</label>
                      <input type="date" className="input-field" value={markSoldDateInput} onChange={(e) => setMarkSoldDateInput(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Sale Notes</label>
                      <textarea className="input-field" rows={3} value={markSoldNotesInput} onChange={(e) => setMarkSoldNotesInput(e.target.value)} placeholder="Payment terms, official receipt reference, etc." />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowMarkSoldModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#15803d", color: "#ffffff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700 }}>
                      ✅ Confirm Sold
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* INVENTORY ADJUST PRICE MODAL */}
          {showAdjustPriceModal && inventoryActionTarget && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowAdjustPriceModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 560 }}>
                <div className="rhps-modal-header">
                  <h3>💰 Adjust Price — {inventoryActionTarget.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowAdjustPriceModal(false)}>×</button>
                </div>
                <form onSubmit={handleAdjustPriceSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 12 }}>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, fontSize: 12.5, color: "#334155" }}>
                      Current Price: <strong>₱{inventoryActionTarget.price.toLocaleString()}</strong>
                    </div>
                    <div className="form-group">
                      <label>New Price (PHP) <span className="required-star">*</span></label>
                      <input type="number" min={1} className="input-field" required value={adjustPriceInput} onChange={(e) => setAdjustPriceInput(Number(e.target.value || 0))} />
                    </div>
                    <div className="form-group">
                      <label>Reason for Adjustment</label>
                      <textarea className="input-field" rows={3} value={adjustPriceReasonInput} onChange={(e) => setAdjustPriceReasonInput(e.target.value)} placeholder="Market update, cosmetic restoration completed, promo, etc." />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowAdjustPriceModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700 }}>
                      💰 Save New Price
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CRM LEAD MODAL */}
          {showLeadModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowLeadModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 920 }}>
                <div className="rhps-modal-header">
                  <h3>{editingLead ? `✏️ Edit Lead — ${editingLead.id}` : "✦ Add CRM Lead"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowLeadModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveLeadSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Lead ID</label>
                        <input className="input-field" value={editingLead?.id || `LEAD-${String(leads.length + 1).padStart(3, "0")}`} disabled />
                      </div>
                      <div className="form-group">
                        <label>Date Created <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={leadCreatedDate}
                          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                          onChange={(e) => setLeadCreatedDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Lead Source <span className="required-star">*</span></label>
                        <select className="input-field" required value={leadSource} onChange={(e) => setLeadSource(e.target.value as Lead["source"])}>
                          <option value="Facebook">Facebook</option>
                          <option value="Website">Website</option>
                          <option value="Call">Call</option>
                          <option value="Walk-In">Walk-In</option>
                          <option value="Referral">Referral</option>
                          <option value="Repeat Customer">Repeat Customer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name <span className="required-star">*</span></label>
                        <input className="input-field" required value={leadCustomerName} onChange={(e) => setLeadCustomerName(e.target.value)} placeholder="Full customer or business name" />
                      </div>
                      <div className="form-group">
                        <label>Contact Number <span className="required-star">*</span></label>
                        <input className="input-field" required value={leadContactNumber} onChange={(e) => setLeadContactNumber(e.target.value)} placeholder="0917-123-4567" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Location / City <span className="required-star">*</span></label>
                        <input className="input-field" required value={leadLocationCity} onChange={(e) => setLeadLocationCity(e.target.value)} placeholder="Davao City / district" />
                      </div>
                      <div className="form-group">
                        <label>Google Maps Link / Pin 📍</label>
                        <input className="input-field" value={leadGmapsLink} onChange={(e) => setLeadGmapsLink(e.target.value)} placeholder="Paste Google Maps URL / Pin" />
                      </div>
                      <div className="form-group">
                        <label>Inquiry Type <span className="required-star">*</span></label>
                        <select className="input-field" required value={leadInquiryType} onChange={(e) => setLeadInquiryType(e.target.value as Lead["inquiryType"])}>
                          <option value="Tuning">Tuning</option>
                          <option value="Repair">Repair</option>
                          <option value="Cleaning">Cleaning</option>
                          <option value="Assessment">Assessment</option>
                          <option value="Moving">Moving</option>
                          <option value="Sales">Sales</option>
                          <option value="Trade-In">Trade-In</option>
                          <option value="Rental">Rental</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Piano Type <span className="required-star">*</span></label>
                        <input className="input-field" required value={leadPianoType} onChange={(e) => setLeadPianoType(e.target.value)} placeholder="Grand, Upright, digital, etc." />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Main Concern <span className="required-star">*</span></label>
                      <textarea className="input-field" rows={3} required value={leadMainConcern} onChange={(e) => setLeadMainConcern(e.target.value)} placeholder="Describe the main issue or request" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Preferred Schedule <span className="required-star">*</span></label>
                        <input className="input-field" required value={leadPreferredSchedule} onChange={(e) => setLeadPreferredSchedule(e.target.value)} placeholder="Mornings, weekends, etc." />
                      </div>
                      <div className="form-group">
                        <label>Lead Status <span className="required-star">*</span></label>
                        <select className="input-field" required value={leadStatus} onChange={(e) => setLeadStatus(e.target.value as Lead["status"])}>
                          <option value="New Lead">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Converted to Estimate">Converted to Estimate</option>
                          <option value="Lost / Closed No Sale">Lost / Closed No Sale</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Assigned Owner <span className="required-star">*</span></label>
                        <input className="input-field" required value={leadAssignedOwner} onChange={(e) => setLeadAssignedOwner(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Next Action <span className="required-star">*</span></label>
                      <select
                        className="input-field"
                        required
                        value={
                          ["Callback", "Schedule Visit", "Send Estimate"].includes(leadNextAction)
                            ? leadNextAction
                            : "Action Note"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "Action Note") {
                            setLeadNextAction(leadNextActionNote || "Action Note");
                          } else {
                            setLeadNextAction(val);
                          }
                        }}
                      >
                        <option value="Callback">📞 Callback</option>
                        <option value="Schedule Visit">📅 Schedule Visit (Auto-adds to Reminders)</option>
                        <option value="Send Estimate">📋 Send Estimate</option>
                        <option value="Action Note">📝 Action Note (Custom)</option>
                      </select>
                      {(!["Callback", "Schedule Visit", "Send Estimate"].includes(leadNextAction) || leadNextAction === "Action Note") && (
                        <input
                          className="input-field"
                          style={{ marginTop: 6 }}
                          value={leadNextActionNote}
                          onChange={(e) => {
                            setLeadNextActionNote(e.target.value);
                            setLeadNextAction(e.target.value || "Action Note");
                          }}
                          placeholder="Type custom action note..."
                        />
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Facebook Name</label>
                        <input className="input-field" value={leadFacebookName} onChange={(e) => setLeadFacebookName(e.target.value)} placeholder="Facebook profile or page name" />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="input-field" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="email@example.com" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Existing Customer ID</label>
                        <input className="input-field" value={leadExistingCustomerId} onChange={(e) => setLeadExistingCustomerId(e.target.value)} placeholder="If repeat customer" />
                      </div>
                      <div className="form-group">
                        <label>Piano Brand</label>
                        <input className="input-field" value={leadPianoBrand} onChange={(e) => setLeadPianoBrand(e.target.value)} placeholder="Yamaha, Kawai, Steinway..." />
                      </div>
                      <div className="form-group">
                        <label>Budget Range</label>
                        <input className="input-field" value={leadBudgetRange} onChange={(e) => setLeadBudgetRange(e.target.value)} placeholder="₱15,000 – ₱20,000" />
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
                      <strong style={{ fontSize: 12, color: "#0f172a", display: "block", marginBottom: 8 }}>Photos / Videos</strong>
                      <input type="file" accept="image/*,video/*" multiple className="input-field" onChange={handleLeadMediaFilesSelected} style={{ marginBottom: 8 }} />
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input className="input-field" value={leadMediaInput} onChange={(e) => setLeadMediaInput(e.target.value)} placeholder="Paste link, file name, or reference" style={{ flex: 1, minWidth: 260 }} />
                        <button type="button" className="secondary-sm" onClick={handleAddLeadMediaItem}>Add Item</button>
                      </div>
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {leadMediaItems.length === 0 ? (
                          <span style={{ fontSize: 11, color: "#64748b" }}>No media attached.</span>
                        ) : (
                          leadMediaItems.map((item, idx) => (
                            <span key={`${item}-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 999, padding: "4px 10px", fontSize: 11 }}>
                              {item}
                              <button type="button" onClick={() => handleRemoveLeadMediaItem(item)} style={{ border: "none", background: "transparent", color: "#dc2626", cursor: "pointer", fontWeight: 800 }}>×</button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Access / Parking / Travel Notes</label>
                        <textarea className="input-field" rows={3} value={leadAccessNotes} onChange={(e) => setLeadAccessNotes(e.target.value)} placeholder="Gate instructions, parking, stairs, travel constraints" />
                      </div>
                      <div className="form-group">
                        <label>Notes</label>
                        <textarea className="input-field" rows={3} value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} placeholder="Additional context or reminders" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Follow-Up Date</label>
                      <input
                        type="date"
                        className="input-field"
                        value={leadFollowUpDate}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        onChange={(e) => setLeadFollowUpDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowLeadModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingLead ? "💾 Save Lead" : "➕ Create Lead"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CREATE BACKUP MODAL */}
          {showCreateBackupModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowCreateBackupModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 540 }}>
                <div className="rhps-modal-header">
                  <h3>💾 Create New System Backup</h3>
                  <button className="rhps-modal-close" onClick={() => setShowCreateBackupModal(false)}>×</button>
                </div>
                <form onSubmit={handleCreateBackupSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                      <strong>🛡️ System Safeguard:</strong> Backups snapshot system records while isolating Actual vs Test records.
                    </div>

                    <div className="form-group">
                      <label>Backup Scope <span className="required-star">*</span></label>
                      <select className="input-field" value={newBackupScope} onChange={(e) => setNewBackupScope(e.target.value as BackupScope)}>
                        <option value="Full System">Full System (All Workspaces & Records)</option>
                        <option value="Actual Records Only">Actual Records Only (Excludes Test Data)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Backup Type <span className="required-star">*</span></label>
                      <select className="input-field" value={newBackupType} onChange={(e) => setNewBackupType(e.target.value as BackupType)}>
                        <option value="Manual">Manual (On-Demand Owner Snapshot)</option>
                        <option value="Scheduled Auto">Scheduled Auto (Automated Schedule)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Storage Destination Location</label>
                      <input
                        className="input-field"
                        value={newStorageLocation}
                        onChange={(e) => setNewStorageLocation(e.target.value)}
                        placeholder="e.g. RHPS Vault / Davao Storage"
                      />
                    </div>

                    <div className="form-group">
                      <label>Triggered By</label>
                      <input className="input-field" value={`${activeUser} (Owner)`} disabled />
                    </div>

                    <div className="form-group">
                      <label>Backup Notes / Operational Context</label>
                      <textarea
                        className="input-field"
                        rows={3}
                        value={newBackupNotes}
                        onChange={(e) => setNewBackupNotes(e.target.value)}
                        placeholder="Reason for manual backup or pre-maintenance notes..."
                      />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowCreateBackupModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 20px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      💾 Start & Save Backup
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* OWNER RESTORE MODAL (Restricted & Safeguarded) */}
          {showRestoreModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowRestoreModal(null)}>
              <div className="rhps-modal" style={{ maxWidth: 580, border: "2px solid #f87171" }}>
                <div className="rhps-modal-header" style={{ background: "#fef2f2", borderBottom: "1px solid #fca5a5" }}>
                  <h3 style={{ color: "#991b1b" }}>🔴 Owner System Restore (Restricted)</h3>
                  <button className="rhps-modal-close" onClick={() => setShowRestoreModal(null)}>×</button>
                </div>
                <form onSubmit={handleExecuteRestoreSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ background: "#fff1f2", border: "1px solid #fda4af", padding: 14, borderRadius: 12, color: "#9f1239", fontSize: 12.5, lineHeight: 1.6 }}>
                      <strong>🔒 KEY RULE & SAFEGUARD CHECKLIST:</strong>
                      <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                        <li><strong>Owner-Only Access:</strong> Restricted exclusively to <strong>{activeUser}</strong>.</li>
                        <li><strong>Auto Pre-Restore Snapshot:</strong> A fresh pre-restore snapshot (<code>SNAP-PRE-{new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01</code>) will be created automatically before restore.</li>
                        <li><strong>Boundary Protection:</strong> Actual vs Test record isolation is protected.</li>
                      </ul>
                    </div>

                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
                      <div><strong>Target Backup ID:</strong> {showRestoreModal.id}</div>
                      <div><strong>Created Date:</strong> {showRestoreModal.dateTimeCreated}</div>
                      <div><strong>Scope:</strong> {showRestoreModal.backupScope} ({showRestoreModal.fileSize})</div>
                    </div>

                    <div className="form-group">
                      <label>Restored By (Owner-Only) <span className="required-star">*</span></label>
                      <input className="input-field" value={`${activeUser} (Owner Authorized)`} disabled />
                    </div>

                    <div className="form-group">
                      <label>Reason for Restore <span className="required-star">*</span></label>
                      <textarea
                        className="input-field"
                        rows={3}
                        required
                        value={restoreReason}
                        onChange={(e) => setRestoreReason(e.target.value)}
                        placeholder="State official reason for system restore (e.g. Server recovery, data roll-back)..."
                      />
                    </div>

                    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", background: "#fef2f2", padding: 12, borderRadius: 10, border: "1px solid #fca5a5", fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
                      <input
                        type="checkbox"
                        required
                        style={{ marginTop: 2 }}
                        checked={restoreConfirmed}
                        onChange={(e) => setRestoreConfirmed(e.target.checked)}
                      />
                      <span>Yes, I explicitly confirm restoring system data from {showRestoreModal.id}. Pre-restore snapshot will be saved.</span>
                    </label>
                  </div>
                  <div className="rhps-modal-footer" style={{ background: "#fef2f2" }}>
                    <button type="button" className="secondary-sm" onClick={() => setShowRestoreModal(null)}>Cancel</button>
                    <button
                      type="submit"
                      disabled={!restoreConfirmed || !restoreReason.trim()}
                      className="primary"
                      style={{ background: restoreConfirmed && restoreReason.trim() ? "#dc2626" : "#94a3b8", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 800, border: "none", cursor: restoreConfirmed ? "pointer" : "not-allowed" }}
                    >
                      🔴 Execute Owner System Restore
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* BACKUP RECORD DETAIL INSPECTION MODAL */}
          {selectedBackupDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedBackupDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 560 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Backup Record Inspection — {selectedBackupDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedBackupDetail(null)}>×</button>
                </div>
                <div className="rhps-modal-body" style={{ gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Backup ID</span><strong>{selectedBackupDetail.id}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Date Created</span><strong>{selectedBackupDetail.dateTimeCreated}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Backup Type</span><strong>{selectedBackupDetail.backupType}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Backup Scope</span><strong>{selectedBackupDetail.backupScope}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>File Size</span><strong>{selectedBackupDetail.fileSize}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Triggered By</span><strong>{selectedBackupDetail.triggeredBy}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Status</span><strong style={{ color: selectedBackupDetail.status === "Completed" ? "#16a34a" : "#dc2626" }}>{selectedBackupDetail.status}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Storage Location</span><strong>{selectedBackupDetail.storageLocation}</strong></div>
                  </div>

                  {selectedBackupDetail.restoreDateTime && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 12, borderRadius: 10 }}>
                      <strong style={{ color: "#15803d", display: "block", marginBottom: 4 }}>✅ Restore Log Audit:</strong>
                      <div style={{ fontSize: 12, color: "#166534" }}>Restored Date: <strong>{selectedBackupDetail.restoreDateTime}</strong></div>
                      <div style={{ fontSize: 12, color: "#166534" }}>Restored By: <strong>{selectedBackupDetail.restoredBy}</strong></div>
                      <div style={{ fontSize: 12, color: "#166534" }}>Reason: <strong>{selectedBackupDetail.reasonForRestore}</strong></div>
                      <div style={{ fontSize: 12, color: "#166534" }}>Pre-Snapshot Ref: <strong>{selectedBackupDetail.preRestoreSnapshotRef}</strong></div>
                    </div>
                  )}

                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Notes & Retention</span>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#334155" }}>{selectedBackupDetail.notes || "No notes attached."}</p>
                    {selectedBackupDetail.retentionPeriodDate && (
                      <span style={{ display: "block", marginTop: 6, fontSize: 11, color: "#64748b" }}>Auto-Delete Date: {selectedBackupDetail.retentionPeriodDate}</span>
                    )}
                  </div>
                </div>
                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedBackupDetail(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* ADD USER ROLE MODAL */}
          {showAddUserModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowAddUserModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 520 }}>
                <div className="rhps-modal-header">
                  <h3>👥 Add New User & Assign Role</h3>
                  <button className="rhps-modal-close" onClick={() => setShowAddUserModal(false)}>×</button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newUserName.trim()) return;
                    const nextId = `USR-${String(userRoles.length + 1).padStart(2, "0")}`;
                    setUserRoles([
                      ...userRoles,
                      {
                        id: nextId,
                        name: newUserName,
                        role: newUserRole,
                        permittedActions: newUserActions || "General Workspace Access",
                      },
                    ]);
                    setShowAddUserModal(false);
                    setNewUserName("");
                    setNewUserActions("");
                    showToast(`👥 New user ${newUserName} (${newUserRole}) added successfully!`);
                  }}
                >
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div className="form-group">
                      <label>User Full Name <span className="required-star">*</span></label>
                      <input
                        className="input-field"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                      />
                    </div>

                    <div className="form-group">
                      <label>Assigned Role <span className="required-star">*</span></label>
                      <select
                        className="input-field"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as "Owner" | "Staff" | "Technician")}
                      >
                        <option value="Owner">Owner (Full System Access & Restore)</option>
                        <option value="Staff">Staff (Office, Quotations & Invoices)</option>
                        <option value="Technician">Technician (On-Site Jobs & Tuning Reports)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Permitted Action Scopes</label>
                      <textarea
                        className="input-field"
                        rows={2}
                        value={newUserActions}
                        onChange={(e) => setNewUserActions(e.target.value)}
                        placeholder="Specify actions permitted (e.g. Create Job Orders, Issue Invoices)..."
                      />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 20px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      ＋ Save User Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADD / EDIT CUSTOMER MODAL */}
          {showCustomerModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowCustomerModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 620 }}>
                <div className="rhps-modal-header">
                  <h3>{editingCustomer ? `✏️ Edit Customer — ${editingCustomer.id}` : "👤 Register New Customer"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowCustomerModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveCustomerSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Full Customer Name <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          placeholder="e.g. Atty. Fernando Alonso / San Pedro Cathedral Academy"
                        />
                      </div>

                      <div className="form-group">
                        <label>Primary Contact Number <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={custContact}
                          onChange={(e) => setCustContact(e.target.value)}
                          placeholder="e.g. 0917-555-0192"
                        />
                      </div>

                      <div className="form-group">
                        <label>Alternate Contact Number</label>
                        <input
                          className="input-field"
                          value={custAltContact}
                          onChange={(e) => setCustAltContact(e.target.value)}
                          placeholder="e.g. 0920-111-2233"
                        />
                      </div>

                      <div className="form-group">
                        <label>Customer Type <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={custType}
                          onChange={(e) => setCustType(e.target.value as "New" | "Old")}
                        >
                          <option value="New">New Customer</option>
                          <option value="Old">Old Customer</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          className="input-field"
                          value={custEmail}
                          onChange={(e) => setCustEmail(e.target.value)}
                          placeholder="e.g. client@example.com"
                        />
                      </div>

                      <div className="form-group">
                        <label>Facebook Account Name</label>
                        <input
                          className="input-field"
                          value={custFbName}
                          onChange={(e) => setCustFbName(e.target.value)}
                          placeholder="e.g. Fernando Alonso Law"
                        />
                      </div>

                      <div className="form-group">
                        <label>Facebook Profile / Page Link 🌐</label>
                        <input
                          className="input-field"
                          value={custFbLink}
                          onChange={(e) => setCustFbLink(e.target.value)}
                          placeholder="https://facebook.com/..."
                        />
                      </div>

                      <div className="form-group">
                        <label>City / Service Area</label>
                        <input
                          className="input-field"
                          value={custCityArea}
                          onChange={(e) => setCustCityArea(e.target.value)}
                          placeholder="e.g. Davao City Central / Matina"
                        />
                      </div>

                      <div className="form-group">
                        <label>Google Maps Link / Pin Location 📍</label>
                        <input
                          className="input-field"
                          value={custGmapsLink}
                          onChange={(e) => setCustGmapsLink(e.target.value)}
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Complete Address <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={custAddress}
                          onChange={(e) => setCustAddress(e.target.value)}
                          placeholder="House/Bldg No, Street, Barangay, City"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Landmark / Location Reference</label>
                        <input
                          className="input-field"
                          value={custLandmark}
                          onChange={(e) => setCustLandmark(e.target.value)}
                          placeholder="e.g. Beside St. Jude Parish, Near Shell Gas Station"
                        />
                      </div>

                      <div style={{ gridColumn: "span 2", background: "#f0f9ff", padding: 12, borderRadius: 10, border: "1px solid #bae6fd", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Set Follow-Up Reminder Date ⏰ (Auto-adds to Reminders)</label>
                          <input
                            type="date"
                            className="input-field"
                            value={custReminderDate}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                            onChange={(e) => setCustReminderDate(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Reminder Details / Notes</label>
                          <input
                            className="input-field"
                            value={custReminderNotes}
                            onChange={(e) => setCustReminderNotes(e.target.value)}
                            placeholder="e.g. Annual tuning follow-up"
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Customer Notes & Service Preferences</label>
                        <textarea
                          className="input-field"
                          rows={3}
                          value={custNotes}
                          onChange={(e) => setCustNotes(e.target.value)}
                          placeholder="VIP preferences, preferred service times, piano history notes..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingCustomer ? "💾 Save Changes" : "＋ Register Customer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CUSTOMER DETAIL & LINKED PIANOS INSPECTION MODAL */}
          {selectedCustomerDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedCustomerDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 600 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Customer Profile — {selectedCustomerDetail.name} ({selectedCustomerDetail.id})</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedCustomerDetail(null)}>×</button>
                </div>
                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer ID</span><strong>{selectedCustomerDetail.id}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer Type</span><strong style={{ color: selectedCustomerDetail.customerType === "Repeat" ? "#1e40af" : "#15803d" }}>{selectedCustomerDetail.customerType}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Primary Contact</span><strong>{selectedCustomerDetail.contactNumber}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Alt Contact</span><strong>{selectedCustomerDetail.alternateContactNumber || "N/A"}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Email</span><strong>{selectedCustomerDetail.email || "N/A"}</strong></div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Facebook Account</span>
                      {selectedCustomerDetail.facebookLink ? (
                        <a href={selectedCustomerDetail.facebookLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}>
                          🌐 {selectedCustomerDetail.facebookName || "View Profile"}
                        </a>
                      ) : (
                        <strong>{selectedCustomerDetail.facebookName || "N/A"}</strong>
                      )}
                    </div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>City / Area</span><strong>{selectedCustomerDetail.cityArea || "Davao City"}</strong></div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Location Pin</span>
                      {selectedCustomerDetail.gmapsLink ? (
                        <a href={selectedCustomerDetail.gmapsLink} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}>
                          📍 View Google Maps Pin
                        </a>
                      ) : (
                        <strong>{selectedCustomerDetail.landmark || "N/A"}</strong>
                      )}
                    </div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Complete Address</span><strong>{selectedCustomerDetail.completeAddress}</strong></div>
                    {selectedCustomerDetail.reminderDate && (
                      <div style={{ gridColumn: "span 2", background: "#f0f9ff", padding: 8, borderRadius: 8, border: "1px solid #bae6fd", fontSize: 12, color: "#0369a1" }}>
                        ⏰ <strong>Scheduled Reminder: {selectedCustomerDetail.reminderDate}</strong> {selectedCustomerDetail.reminderNotes ? `(${selectedCustomerDetail.reminderNotes})` : ""}
                      </div>
                    )}
                  </div>

                  {/* LINKED PIANOS SECTION */}
                  <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <strong style={{ color: "#0f172a", display: "block", marginBottom: 8, fontSize: 13 }}>
                      🎹 Linked Piano Instruments ({selectedCustomerDetail.pianos?.length || selectedCustomerDetail.linkedPianoIds?.length || 0}):
                    </strong>
                    {selectedCustomerDetail.pianos && selectedCustomerDetail.pianos.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {selectedCustomerDetail.pianos.map((p) => (
                          <div key={p.id} style={{ background: "#ffffff", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#0f172a" }}>
                              <span>🎹 {p.brand} {p.model} ({p.pianoType})</span>
                              <span style={{ color: "#2563eb" }}>S/N: {p.serialNumber}</span>
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>Location: {p.currentLocation} | Status: <strong>{p.pianoStatus}</strong></div>
                            {p.conditionNotes && <div style={{ color: "#475569", fontSize: 11, fontStyle: "italic", marginTop: 2 }}>Notes: {p.conditionNotes}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Linked Piano IDs: <strong>{selectedCustomerDetail.linkedPianoIds.join(", ")}</strong>
                      </div>
                    )}
                  </div>

                  {/* NOTES SECTION */}
                  {selectedCustomerDetail.notes && (
                    <div style={{ background: "#fffbebf5", padding: 12, borderRadius: 10, border: "1px solid #fde68a" }}>
                      <span style={{ color: "#92400e", fontSize: 11, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 2 }}>Notes & Special Instructions</span>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#78350f" }}>{selectedCustomerDetail.notes}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", paddingTop: 6 }}>
                    <span>Date Created: {selectedCustomerDetail.createdDate}</span>
                    <span>Last Updated: {selectedCustomerDetail.lastUpdatedDate}</span>
                  </div>
                </div>
                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedCustomerDetail(null)}>Close</button>
                  <button
                    className="primary"
                    style={{ background: "#0f172a", color: "#ffffff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                    onClick={() => {
                      const target = selectedCustomerDetail;
                      setSelectedCustomerDetail(null);
                      openEditCustomerModal(target);
                    }}
                  >
                    ✏️ Edit Customer Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT ESTIMATE MODAL */}
          {showEstimateModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowEstimateModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>{editingEstimate ? `✏️ Edit Estimate — ${editingEstimate.id}` : "📐 Create Preliminary Estimate"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowEstimateModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveEstimateSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                      <strong>ℹ️ Estimate vs Quotation Rule:</strong> Estimates are preliminary cost assessments linked to a Lead ID. Once approved by the customer, an estimate can be converted into a formal binding Quotation.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className="form-group">
                        <label>Linked Lead ID <span className="required-star">*</span></label>
                        <input
                          type="text"
                          className="input-field"
                          style={{ marginBottom: 4, padding: "4px 8px", fontSize: 12, background: "#f8fafc" }}
                          placeholder="🔍 Type to search lead / customer..."
                          value={estLeadSearch}
                          onChange={(e) => setEstLeadSearch(e.target.value)}
                        />
                        <select
                          className="input-field"
                          required
                          value={estLeadId}
                          onChange={(e) => {
                            const foundLead = leads.find((l) => l.id === e.target.value);
                            setEstLeadId(e.target.value);
                            if (foundLead) {
                              setEstCustomerName(foundLead.customerName);
                              setEstContactNumber(foundLead.contactNumber);
                              setEstServiceLocation(foundLead.locationCity);
                              setEstPianoDetails(foundLead.pianoType);
                              setEstMainConcern(foundLead.mainConcern);
                            }
                          }}
                        >
                          {leads
                            .filter((l) => {
                              if (!estLeadSearch.trim()) return true;
                              const q = estLeadSearch.toLowerCase();
                              return l.id.toLowerCase().includes(q) || l.customerName.toLowerCase().includes(q) || l.inquiryType.toLowerCase().includes(q);
                            })
                            .map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.id} — {l.customerName} ({l.inquiryType})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Estimate Basis <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={estBasis}
                          onChange={(e) => setEstBasis(e.target.value as "Remote" | "On-Site")}
                        >
                          <option value="On-Site">📍 On-Site Inspection Basis</option>
                          <option value="Remote">📱 Remote Assessment Basis (Photos/Video)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Customer Name <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={estCustomerName}
                          onChange={(e) => setEstCustomerName(e.target.value)}
                          placeholder="e.g. Maria Santos"
                        />
                      </div>

                      <div className="form-group">
                        <label>Contact Number <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={estContactNumber}
                          onChange={(e) => setEstContactNumber(e.target.value)}
                          placeholder="e.g. 0918-123-4567"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Complete Service Location <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={estServiceLocation}
                          onChange={(e) => setEstServiceLocation(e.target.value)}
                          placeholder="House/Bldg No, Street, Barangay, City"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Piano Brand / Type / Model / Serial Number <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={estPianoDetails}
                          onChange={(e) => setEstPianoDetails(e.target.value)}
                          placeholder="e.g. Steinway Model M Grand S/N: ST-44912"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Customer Reported Main Concern <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={estMainConcern}
                          onChange={(e) => setEstMainConcern(e.target.value)}
                          placeholder="e.g. Pitch drop A438, sticky keys, heavy touchweight"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Recommended Service Scope <span className="required-star">*</span></label>
                        <textarea
                          className="input-field"
                          rows={2}
                          required
                          value={estRecommendedScope}
                          onChange={(e) => setEstRecommendedScope(e.target.value)}
                          placeholder="Detailed recommended scope (e.g. Full Pitch Raise A440, Action Regulation, Keybed Lubrication)"
                        />
                      </div>

                      <div className="form-group">
                        <label>Estimated Amount (Base ₱) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          className="input-field"
                          required
                          value={estEstimatedAmount}
                          onChange={(e) => setEstEstimatedAmount(Number(e.target.value))}
                          placeholder="18500"
                        />
                      </div>

                      <div className="form-group">
                        <label>Estimated Range Display</label>
                        <input
                          className="input-field"
                          value={estAmountRange}
                          onChange={(e) => setEstAmountRange(e.target.value)}
                          placeholder="e.g. ₱17,500 – ₱19,500"
                        />
                      </div>

                      <div className="form-group">
                        <label>Validity Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={estValidityDate}
                          onChange={(e) => setEstValidityDate(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Prepared By <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={estPreparedBy}
                          onChange={(e) => setEstPreparedBy(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Photos / Video Reviewed?</label>
                        <select
                          className="input-field"
                          value={estPhotosReviewed}
                          onChange={(e) => setEstPhotosReviewed(e.target.value as "Yes" | "No")}
                        >
                          <option value="Yes">Yes (Client submitted media)</option>
                          <option value="No">No (In-person inspection only)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Deposit Required at Estimate Stage (₱)</label>
                        <input
                          type="number"
                          className="input-field"
                          value={estDepositRequired}
                          onChange={(e) => setEstDepositRequired(Number(e.target.value))}
                          placeholder="3000"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Landmark & Access Notes</label>
                        <input
                          className="input-field"
                          value={estLandmark}
                          onChange={(e) => setEstLandmark(e.target.value)}
                          placeholder="e.g. 2nd floor music room, elevator available, gate security code required"
                        />
                      </div>

                      <div className="form-group">
                        <label>Last Tuning / Service Date</label>
                        <input
                          type="date"
                          className="input-field"
                          value={estLastTuningDate}
                          onChange={(e) => setEstLastTuningDate(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Estimate Notes & Preliminary Assumptions</label>
                        <textarea
                          className="input-field"
                          rows={2}
                          value={estNotes}
                          onChange={(e) => setEstNotes(e.target.value)}
                          placeholder="Assumptions, preliminary parts lead times, client preferences..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowEstimateModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingEstimate ? "💾 Save Changes" : "📐 Save Preliminary Estimate"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ESTIMATE DETAIL INSPECTION MODAL */}
          {selectedEstimateDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedEstimateDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 620 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Estimate Document — {selectedEstimateDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedEstimateDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Lead ID</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>🔗 {selectedEstimateDetail.leadId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Estimate Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedEstimateDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Estimate Basis</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>{selectedEstimateDetail.estimateBasis}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Validity Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedEstimateDetail.validityDate}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer Name</span><strong>{selectedEstimateDetail.customerName}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Contact Number</span><strong>{selectedEstimateDetail.contactNumber}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Complete Service Location</span><strong>{selectedEstimateDetail.serviceLocation}</strong></div>
                    {selectedEstimateDetail.landmarkAccessNotes && (
                      <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Landmark / Access</span><strong>📍 {selectedEstimateDetail.landmarkAccessNotes}</strong></div>
                    )}
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Piano Brand / Model / Serial</span><strong>🎹 {selectedEstimateDetail.pianoBrandTypeModelSerial}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Main Reported Concern</span><strong>{selectedEstimateDetail.mainConcern}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Recommended Scope</span><strong style={{ color: "#1e293b" }}>{selectedEstimateDetail.recommendedScope}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Estimated Base Amount</span><strong style={{ fontSize: 16, color: "#059669" }}>₱{selectedEstimateDetail.estimatedAmount.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Estimated Range</span><strong>{selectedEstimateDetail.estimatedAmountRange || `₱${selectedEstimateDetail.estimatedAmount.toLocaleString()}`}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Photos/Video Reviewed</span><strong>{selectedEstimateDetail.photosVideoReviewed || "Yes"}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Deposit Required</span><strong>₱{(selectedEstimateDetail.depositRequired || 0).toLocaleString()}</strong></div>
                  </div>

                  {selectedEstimateDetail.notes && (
                    <div style={{ background: "#fffbebf5", padding: 12, borderRadius: 10, border: "1px solid #fde68a" }}>
                      <span style={{ color: "#92400e", fontSize: 11, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 2 }}>Notes & Preliminary Assumptions</span>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#78350f" }}>{selectedEstimateDetail.notes}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", paddingTop: 6 }}>
                    <span>Prepared By: <strong>{selectedEstimateDetail.preparedBy}</strong></span>
                    <span>Date Created: <strong>{selectedEstimateDetail.date}</strong></span>
                  </div>
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedEstimateDetail(null)}>Close</button>
                  {selectedEstimateDetail.status === "Approved" && (
                    <button
                      className="primary"
                      style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                      onClick={() => {
                        const target = selectedEstimateDetail;
                        setSelectedEstimateDetail(null);
                        handleConvertToQuotation(target);
                      }}
                    >
                      ⚡ Convert to Formal Quotation
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT QUOTATION MODAL */}
          {showQuotationModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowQuotationModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>{editingQuotation ? `✏️ Edit Quotation — ${editingQuotation.id}` : "📝 Issue Formal Binding Quotation"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowQuotationModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveQuotationSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ background: "#eff6ff", padding: 12, borderRadius: 10, border: "1px solid #bfdbfe", fontSize: 12, color: "#1e40af" }}>
                      <strong>🛡️ Operational Sequence Rule:</strong> Approved Quotations convert into a <strong>Customer Case</strong>, which is then scheduled before generating a Job Order.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className="form-group">
                        <label>Linked Estimate No. <span className="required-star">*</span></label>
                        <input
                          type="text"
                          className="input-field"
                          style={{ marginBottom: 4, padding: "4px 8px", fontSize: 12, background: "#f8fafc" }}
                          placeholder="🔍 Type to search estimate / customer..."
                          value={qtEstimateSearch}
                          onChange={(e) => setQtEstimateSearch(e.target.value)}
                        />
                        <select
                          className="input-field"
                          required
                          value={qtEstimateId}
                          onChange={(e) => {
                            const foundEst = estimates.find((est) => est.id === e.target.value);
                            setQtEstimateId(e.target.value);
                            if (foundEst) {
                              setQtCustomerName(foundEst.customerName);
                              setQtContactNumber(foundEst.contactNumber);
                              setQtServiceLocation(foundEst.serviceLocation);
                              setQtPianoDetails(foundEst.pianoBrandTypeModelSerial);
                              setQtProposedScope(foundEst.recommendedScope);
                              setQtApprovedAmount(foundEst.estimatedAmount);
                              setQtDepositRequired(foundEst.depositRequired || 5000);
                              setQtValidityDate(foundEst.validityDate);
                            }
                          }}
                        >
                          {estimates
                            .filter((est) => {
                              if (!qtEstimateSearch.trim()) return true;
                              const q = qtEstimateSearch.toLowerCase();
                              return est.id.toLowerCase().includes(q) || est.customerName.toLowerCase().includes(q) || String(est.estimatedAmount).includes(q);
                            })
                            .map((est) => (
                              <option key={est.id} value={est.id}>
                                {est.id} — {est.customerName} (₱{est.estimatedAmount.toLocaleString()})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Revision Number <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={qtRevisionNo}
                          onChange={(e) => setQtRevisionNo(e.target.value)}
                          placeholder="e.g. REV-01"
                        />
                      </div>

                      <div className="form-group">
                        <label>Customer Name <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={qtCustomerName}
                          onChange={(e) => setQtCustomerName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Contact Number <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={qtContactNumber}
                          onChange={(e) => setQtContactNumber(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Complete Service Location <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={qtServiceLocation}
                          onChange={(e) => setQtServiceLocation(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Piano Brand / Type / Model / Serial Number <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={qtPianoDetails}
                          onChange={(e) => setQtPianoDetails(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Proposed Scope of Work <span className="required-star">*</span></label>
                        <textarea
                          className="input-field"
                          rows={3}
                          required
                          value={qtProposedScope}
                          onChange={(e) => setQtProposedScope(e.target.value)}
                          placeholder="Detailed, itemized binding scope of work..."
                        />
                      </div>

                      <div className="form-group">
                        <label>Approved Quoted Amount (₱) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          className="input-field"
                          required
                          value={qtApprovedAmount}
                          onChange={(e) => setQtApprovedAmount(Number(e.target.value))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Deposit Required (₱) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          className="input-field"
                          required
                          value={qtDepositRequired}
                          onChange={(e) => setQtDepositRequired(Number(e.target.value))}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Balance Terms & Payment Plan <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={qtBalanceTerms}
                          onChange={(e) => setQtBalanceTerms(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Quotation Validity Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={qtValidityDate}
                          onChange={(e) => setQtValidityDate(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Prepared By <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={qtPreparedBy}
                          onChange={(e) => setQtPreparedBy(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Customer Decision Notes</label>
                        <input
                          className="input-field"
                          value={qtDecisionNotes}
                          onChange={(e) => setQtDecisionNotes(e.target.value)}
                          placeholder="e.g. Approved via Viber call, requested GCash deposit instructions"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Written Approval Reference</label>
                        <input
                          className="input-field"
                          value={qtWrittenApprovalRef}
                          onChange={(e) => setQtWrittenApprovalRef(e.target.value)}
                          placeholder="e.g. Signed Quote #SQ-9912 / Email approval dated Aug 2"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Special Terms & Conditions (Beyond Standard Exclusions)</label>
                        <textarea
                          className="input-field"
                          rows={2}
                          value={qtSpecialTerms}
                          onChange={(e) => setQtSpecialTerms(e.target.value)}
                          placeholder="e.g. Work during morning hours only; 1-month pitch stabilization guarantee"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowQuotationModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingQuotation ? "💾 Save Changes" : "📝 Issue Binding Quotation"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* QUOTATION DETAIL INSPECTION MODAL */}
          {selectedQuotationDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedQuotationDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 640 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Formal Quotation — {selectedQuotationDetail.id} ({selectedQuotationDetail.revisionNo})</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedQuotationDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Estimate No</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>🔗 {selectedQuotationDetail.estimateId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Quotation Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedQuotationDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Revision</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>{selectedQuotationDetail.revisionNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Validity Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedQuotationDetail.validityDate}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer Name</span><strong>{selectedQuotationDetail.customerName}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Contact Number</span><strong>{selectedQuotationDetail.contactNumber}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Complete Service Location</span><strong>{selectedQuotationDetail.serviceLocation}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Piano Brand / Model / Serial</span><strong>🎹 {selectedQuotationDetail.pianoBrandTypeModelSerial}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Proposed Binding Scope of Work</span><strong style={{ color: "#1e293b" }}>{selectedQuotationDetail.proposedScope}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Approved Quoted Amount</span><strong style={{ fontSize: 16, color: "#059669" }}>₱{selectedQuotationDetail.approvedQuotedAmount.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Deposit Required</span><strong style={{ fontSize: 16, color: "#2563eb" }}>₱{selectedQuotationDetail.depositRequired.toLocaleString()}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Balance Terms</span><strong>{selectedQuotationDetail.balanceTerms}</strong></div>
                    {selectedQuotationDetail.writtenApprovalRef && (
                      <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Written Approval Reference</span><strong>✍️ {selectedQuotationDetail.writtenApprovalRef}</strong></div>
                    )}
                  </div>

                  {selectedQuotationDetail.specialTermsConditions && (
                    <div style={{ background: "#fffbebf5", padding: 12, borderRadius: 10, border: "1px solid #fde68a" }}>
                      <span style={{ color: "#92400e", fontSize: 11, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 2 }}>Special Terms & Guarantees</span>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#78350f" }}>{selectedQuotationDetail.specialTermsConditions}</p>
                    </div>
                  )}

                  {selectedQuotationDetail.customerDecisionNotes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12 }}>
                      <span style={{ color: "#475569", fontWeight: 700, display: "block" }}>Customer Decision Notes:</span>
                      <span>{selectedQuotationDetail.customerDecisionNotes}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", paddingTop: 6 }}>
                    <span>Prepared By: <strong>{selectedQuotationDetail.preparedBy}</strong></span>
                    <span>Date Issued: <strong>{selectedQuotationDetail.date}</strong></span>
                  </div>
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedQuotationDetail(null)}>Close</button>
                  {selectedQuotationDetail.status === "Approved" && (
                    <button
                      className="primary"
                      style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                      onClick={() => {
                        const target = selectedQuotationDetail;
                        setSelectedQuotationDetail(null);
                        handleConvertToCustomerCase(target);
                      }}
                    >
                      ⚡ Convert to Customer Case
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT SCHEDULE MODAL */}
          {showScheduleModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowScheduleModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 640 }}>
                <div className="rhps-modal-header">
                  <h3>{editingSchedule ? `✏️ Edit Appointment — ${editingSchedule.id}` : "📅 Schedule Field Service Visit"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveScheduleSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ background: "#eff6ff", padding: 12, borderRadius: 10, border: "1px solid #bfdbfe", fontSize: 12, color: "#1e40af" }}>
                      <strong>ℹ️ Workflow Step:</strong> Service Appointments link to an active <strong>Customer Case ID</strong> and carry forward location & piano details.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className="form-group">
                        <label>Linked Customer Case ID <span className="required-star">*</span></label>
                        <input
                          type="text"
                          className="input-field"
                          style={{ marginBottom: 4, padding: "4px 8px", fontSize: 12, background: "#f8fafc" }}
                          placeholder="🔍 Type to search case / customer..."
                          value={schCaseSearch}
                          onChange={(e) => setSchCaseSearch(e.target.value)}
                        />
                        <select
                          className="input-field"
                          required
                          value={schCaseId}
                          onChange={(e) => {
                            const foundCase = cases.find((c) => c.id === e.target.value);
                            setSchCaseId(e.target.value);
                            if (foundCase) {
                              setSchCustomerName(foundCase.customerName);
                              setSchPianoDetails("Piano Instrument linked to Case " + foundCase.id);
                            }
                          }}
                        >
                          {cases
                            .filter((c) => {
                              if (!schCaseSearch.trim()) return true;
                              const q = schCaseSearch.toLowerCase();
                              return c.id.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q) || c.status.toLowerCase().includes(q);
                            })
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.id} — {c.customerName} ({c.status})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Customer Name (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={schCustomerName}
                          onChange={(e) => setSchCustomerName(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Complete Service Location (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={schServiceLocation}
                          onChange={(e) => setSchServiceLocation(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Piano Brand / Model / Serial (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={schPianoDetails}
                          onChange={(e) => setSchPianoDetails(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Target Service Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={schServiceDate}
                          onChange={(e) => setSchServiceDate(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Arrival Window <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          required
                          value={schArrivalWindow}
                          onChange={(e) => setSchArrivalWindow(e.target.value)}
                        >
                          <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                          <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                          <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                          <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
                          <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Lead Technician <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={schLeadTech}
                          onChange={(e) => setSchLeadTech(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Technical Associates <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={schAssociates}
                          onChange={(e) => setSchAssociates(e.target.value)}
                          placeholder="e.g. Jun (Tech Asst)"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Access / Parking / Travel Notes (Carried Forward)</label>
                        <input
                          className="input-field"
                          value={schAccessNotes}
                          onChange={(e) => setSchAccessNotes(e.target.value)}
                          placeholder="e.g. Gate clearance code, driveway parking, 2nd floor stairs"
                        />
                      </div>

                      {editingSchedule && editingSchedule.rescheduledFromDate && (
                        <div className="form-group">
                          <label>Rescheduled From Date</label>
                          <input
                            className="input-field"
                            value={schRescheduledFrom}
                            onChange={(e) => setSchRescheduledFrom(e.target.value)}
                          />
                        </div>
                      )}

                      {editingSchedule && editingSchedule.cancellationReason && (
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label>Cancellation Reason</label>
                          <input
                            className="input-field"
                            value={schCancellationReason}
                            onChange={(e) => setSchCancellationReason(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>On-Site Preparation & Special Notes</label>
                        <textarea
                          className="input-field"
                          rows={2}
                          value={schNotes}
                          onChange={(e) => setSchNotes(e.target.value)}
                          placeholder="e.g. Bring pitch fork A440, Renner action springs, key level tools"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingSchedule ? "💾 Save Changes" : "📅 Confirm & Schedule Visit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SCHEDULE DETAIL INSPECTION MODAL */}
          {selectedScheduleDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedScheduleDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 620 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Appointment Details — {selectedScheduleDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedScheduleDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Case ID</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>🔗 {selectedScheduleDetail.caseId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Schedule Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedScheduleDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Service Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedScheduleDetail.serviceDate}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Arrival Window</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>{selectedScheduleDetail.arrivalWindow}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer Name</span><strong>{selectedScheduleDetail.customerName}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Service Location</span><strong>📍 {selectedScheduleDetail.serviceLocation}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Piano Instrument</span><strong>🎹 {selectedScheduleDetail.pianoDetails}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Lead Technician</span><strong>🛠️ {selectedScheduleDetail.leadTechnician}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Technical Associates</span><strong>{selectedScheduleDetail.associates}</strong></div>
                  </div>

                  {selectedScheduleDetail.accessParkingTravelNotes && (
                    <div style={{ background: "#fffbebf5", padding: 12, borderRadius: 10, border: "1px solid #fde68a" }}>
                      <span style={{ color: "#92400e", fontSize: 11, fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 2 }}>🚗 Access / Parking / Travel Notes</span>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#78350f" }}>{selectedScheduleDetail.accessParkingTravelNotes}</p>
                    </div>
                  )}

                  {selectedScheduleDetail.rescheduledFromDate && (
                    <div style={{ background: "#ffedd5", padding: 10, borderRadius: 8, border: "1px solid #fed7aa", fontSize: 12, color: "#c2410c" }}>
                      <strong>🔄 Rescheduled Info:</strong> Originally scheduled for {selectedScheduleDetail.rescheduledFromDate}
                    </div>
                  )}

                  {selectedScheduleDetail.cancellationReason && (
                    <div style={{ background: "#fee2e2", padding: 10, borderRadius: 8, border: "1px solid #fca5a5", fontSize: 12, color: "#b91c1c" }}>
                      <strong>❌ Cancellation Reason:</strong> {selectedScheduleDetail.cancellationReason}
                    </div>
                  )}

                  {selectedScheduleDetail.notes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12 }}>
                      <span style={{ color: "#475569", fontWeight: 700, display: "block" }}>Preparation Notes:</span>
                      <span>{selectedScheduleDetail.notes}</span>
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedScheduleDetail(null)}>Close</button>
                  {selectedScheduleDetail.status === "Confirmed" && (
                    <button
                      className="primary"
                      style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                      onClick={() => {
                        const target = selectedScheduleDetail;
                        setSelectedScheduleDetail(null);
                        handleConvertToJobOrder(target);
                      }}
                    >
                      ⚡ Convert to Job Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT JOB ORDER MODAL */}
          {showJobOrderModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowJobOrderModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 680 }}>
                <div className="rhps-modal-header">
                  <h3>{editingJobOrder ? `✏️ Edit Job Order — ${editingJobOrder.id}` : "🛠️ Issue Technical Job Order"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowJobOrderModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveJobOrderSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Linked Quotation No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joQuotationNo}
                          onChange={(e) => setJoQuotationNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Appointment No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joAppointmentNo}
                          onChange={(e) => setJoAppointmentNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Case ID <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joCaseId}
                          onChange={(e) => setJoCaseId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name & Contact (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joCustomerName}
                          onChange={(e) => setJoCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Location & Landmark (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joLocation}
                          onChange={(e) => setJoLocation(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Piano Instrument Details (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joPianoDetails}
                          onChange={(e) => setJoPianoDetails(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Approved Scope of Work <span className="required-star">*</span></label>
                        <textarea
                          className="input-field"
                          rows={2}
                          required
                          value={joApprovedScope}
                          onChange={(e) => setJoApprovedScope(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Service Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={joServiceDate}
                          onChange={(e) => setJoServiceDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Arrival Window <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joArrivalWindow}
                          onChange={(e) => setJoArrivalWindow(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Lead Technician <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joLeadTech}
                          onChange={(e) => setJoLeadTech(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Technical Associates <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={joAssociates}
                          onChange={(e) => setJoAssociates(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* ITEM-BASED PRE-SERVICE CHECKLIST */}
                    <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                        📋 Pre-Service Inspection Checklist (Item-based Yes/No)
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joPreCheck.pinsCheck} onChange={(e) => setJoPreCheck({ ...joPreCheck, pinsCheck: e.target.checked })} />
                          Tuning Pins Check (Tightness)
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joPreCheck.soundboardIntegrity} onChange={(e) => setJoPreCheck({ ...joPreCheck, soundboardIntegrity: e.target.checked })} />
                          Soundboard Integrity (Cracks)
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joPreCheck.keybedLevel} onChange={(e) => setJoPreCheck({ ...joPreCheck, keybedLevel: e.target.checked })} />
                          Keybed & Key Height Level
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joPreCheck.pedalMovement} onChange={(e) => setJoPreCheck({ ...joPreCheck, pedalMovement: e.target.checked })} />
                          Pedal Trapwork Movement
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joPreCheck.benchStability} onChange={(e) => setJoPreCheck({ ...joPreCheck, benchStability: e.target.checked })} />
                          Piano Bench Stability
                        </label>
                      </div>
                    </div>

                    {/* CONDITIONAL ADDITIONAL FINDINGS SECTION */}
                    <div style={{ background: "#fffbebf5", padding: 14, borderRadius: 12, border: "1px solid #fde68a" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#92400e", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                        ⚠️ Conditional Additional Finding (If Occurs On-Site)
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label style={{ color: "#78350f" }}>Finding Description</label>
                          <input
                            className="input-field"
                            value={joFindingDesc}
                            onChange={(e) => setJoFindingDesc(e.target.value)}
                            placeholder="e.g. Discovered cracked bass bridge pin & 2 broken whippen springs"
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: "#78350f" }}>Customer Decision</label>
                          <select
                            className="input-field"
                            value={joCustomerDecision}
                            onChange={(e) => setJoCustomerDecision(e.target.value as "Approved" | "Declined" | "Pending")}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Declined">Declined</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ color: "#78350f" }}>Written Approval Reference</label>
                          <input
                            className="input-field"
                            value={joFindingApprovalRef}
                            onChange={(e) => setJoFindingApprovalRef(e.target.value)}
                            placeholder="e.g. Viber chat photo sign-off #VB-9912"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PARTS & MATERIALS / OPTIONAL NOTES */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="form-group">
                        <label>Parts & Materials Used</label>
                        <input
                          className="input-field"
                          value={joPartsUsed}
                          onChange={(e) => setJoPartsUsed(e.target.value)}
                          placeholder="e.g. 1 Set Renner felts, 6 action springs"
                        />
                      </div>
                      <div className="form-group">
                        <label>Inspection Photos Count</label>
                        <input
                          type="number"
                          className="input-field"
                          value={joPhotosCount}
                          onChange={(e) => setJoPhotosCount(Number(e.target.value))}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Not Approved / Pending Approval Items</label>
                        <input
                          className="input-field"
                          value={joPendingItems}
                          onChange={(e) => setJoPendingItems(e.target.value)}
                          placeholder="e.g. Full string replacement deferred by client"
                        />
                      </div>
                    </div>

                    {/* ITEM-BASED FINAL TESTING CHECKLIST */}
                    <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 12, border: "1px solid #bbf7d0" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#166534", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                        ✅ Final Testing Checklist (Pre-Completion Verification)
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joFinalCheck.pitchA440Check} onChange={(e) => setJoFinalCheck({ ...joFinalCheck, pitchA440Check: e.target.checked })} />
                          Concert Pitch A440 Verified
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joFinalCheck.keyRepetitionTest} onChange={(e) => setJoFinalCheck({ ...joFinalCheck, keyRepetitionTest: e.target.checked })} />
                          Rapid Key Repetition Passed
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joFinalCheck.voicingUniformity} onChange={(e) => setJoFinalCheck({ ...joFinalCheck, voicingUniformity: e.target.checked })} />
                          Hammer Voicing Tone Uniformity
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joFinalCheck.pedalTrapworkTest} onChange={(e) => setJoFinalCheck({ ...joFinalCheck, pedalTrapworkTest: e.target.checked })} />
                          Pedal Trapwork & Clearance Test
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={joFinalCheck.cabinetCleanUp} onChange={(e) => setJoFinalCheck({ ...joFinalCheck, cabinetCleanUp: e.target.checked })} />
                          Cabinet Polished & Work Area Clean
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowJobOrderModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingJobOrder ? "💾 Save Changes" : "🛠️ Issue Job Order"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* JOB ORDER DETAIL INSPECTION MODAL */}
          {selectedJobOrderDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedJobOrderDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Technical Job Order — {selectedJobOrderDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedJobOrderDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Quotation</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>📄 {selectedJobOrderDetail.linkedQuotationNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Appointment No</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>📅 {selectedJobOrderDetail.appointmentNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedJobOrderDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Service Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedJobOrderDetail.serviceDate}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer / Contact</span><strong>{selectedJobOrderDetail.customerName}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Location / Landmark</span><strong>📍 {selectedJobOrderDetail.location}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Piano Instrument</span><strong>🎹 {selectedJobOrderDetail.pianoDetails}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Approved Technical Scope</span><strong style={{ color: "#0f172a" }}>{selectedJobOrderDetail.approvedScope}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Lead Technician</span><strong>🛠️ {selectedJobOrderDetail.leadTechnician}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Technical Associates</span><strong>{selectedJobOrderDetail.associates}</strong></div>
                  </div>

                  {/* PRE-SERVICE CHECKLIST DISPLAY */}
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ color: "#475569", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 6 }}>📋 Pre-Service Inspection Checklist Results</span>
                    {typeof selectedJobOrderDetail.preServiceChecklist === "object" ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        <div>Pins Tightness: <strong>{selectedJobOrderDetail.preServiceChecklist.pinsCheck ? "✓ Pass" : "✕ Issue"}</strong></div>
                        <div>Soundboard Integrity: <strong>{selectedJobOrderDetail.preServiceChecklist.soundboardIntegrity ? "✓ Pass" : "✕ Issue"}</strong></div>
                        <div>Keybed Level: <strong>{selectedJobOrderDetail.preServiceChecklist.keybedLevel ? "✓ Pass" : "✕ Issue"}</strong></div>
                        <div>Pedal Movement: <strong>{selectedJobOrderDetail.preServiceChecklist.pedalMovement ? "✓ Pass" : "✕ Issue"}</strong></div>
                        <div>Bench Stability: <strong>{selectedJobOrderDetail.preServiceChecklist.benchStability ? "✓ Pass" : "✕ Issue"}</strong></div>
                      </div>
                    ) : (
                      <div>{selectedJobOrderDetail.preServiceChecklist}</div>
                    )}
                  </div>

                  {/* CONDITIONAL FINDING DISPLAY */}
                  {selectedJobOrderDetail.findingDescription && (
                    <div style={{ background: "#fffbebf5", padding: 12, borderRadius: 10, border: "1px solid #fde68a", fontSize: 12 }}>
                      <span style={{ color: "#92400e", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 4 }}>⚠️ On-Site Additional Finding</span>
                      <div>Description: <strong>{selectedJobOrderDetail.findingDescription}</strong></div>
                      <div>Customer Decision: <strong>{selectedJobOrderDetail.customerDecision || "Pending"}</strong></div>
                      {selectedJobOrderDetail.findingWrittenApprovalRef && (
                        <div>Approval Reference: <strong>✍️ {selectedJobOrderDetail.findingWrittenApprovalRef}</strong></div>
                      )}
                    </div>
                  )}

                  {selectedJobOrderDetail.partsUsed && (
                    <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 12, color: "#166534" }}>
                      <strong>📦 Parts & Materials Used:</strong> {selectedJobOrderDetail.partsUsed}
                    </div>
                  )}

                  {/* FINAL TESTING CHECKLIST DISPLAY */}
                  {selectedJobOrderDetail.finalTestingChecklist && (
                    <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 10, border: "1px solid #bbf7d0", fontSize: 12 }}>
                      <span style={{ color: "#166534", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 6 }}>✅ Final Quality Assurance Verification</span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        <div>Pitch A440: <strong>{selectedJobOrderDetail.finalTestingChecklist.pitchA440Check ? "✓ Verified" : "Pending"}</strong></div>
                        <div>Key Repetition: <strong>{selectedJobOrderDetail.finalTestingChecklist.keyRepetitionTest ? "✓ Verified" : "Pending"}</strong></div>
                        <div>Voicing Tone: <strong>{selectedJobOrderDetail.finalTestingChecklist.voicingUniformity ? "✓ Verified" : "Pending"}</strong></div>
                        <div>Pedal Trapwork: <strong>{selectedJobOrderDetail.finalTestingChecklist.pedalTrapworkTest ? "✓ Verified" : "Pending"}</strong></div>
                        <div>Cabinet Clean-up: <strong>{selectedJobOrderDetail.finalTestingChecklist.cabinetCleanUp ? "✓ Clean" : "Pending"}</strong></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedJobOrderDetail(null)}>Close</button>
                  {(selectedJobOrderDetail.status === "In Progress" || selectedJobOrderDetail.status === "Additional Finding Pending") && (
                    <button
                      className="primary"
                      style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                      onClick={() => {
                        const target = selectedJobOrderDetail;
                        setSelectedJobOrderDetail(null);
                        handleCompleteJob(target);
                      }}
                    >
                      ✓ Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT SERVICE REPORT MODAL */}
          {showServiceReportModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowServiceReportModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 680 }}>
                <div className="rhps-modal-header">
                  <h3>{editingServiceReport ? `✏️ Edit Service Report — ${editingServiceReport.id}` : "📋 Issue Technical Service Report"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowServiceReportModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveServiceReportSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Linked Job Order No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srJobOrderNo}
                          onChange={(e) => setSrJobOrderNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Linked Quotation No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srQuotationNo}
                          onChange={(e) => setSrQuotationNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Service Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={srServiceDate}
                          onChange={(e) => setSrServiceDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name & Contact (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srCustomerName}
                          onChange={(e) => setSrCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Location (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srLocation}
                          onChange={(e) => setSrLocation(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Piano Details (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srPianoDetails}
                          onChange={(e) => setSrPianoDetails(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Customer-Reported Concern <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srCustomerConcern}
                          onChange={(e) => setSrCustomerConcern(e.target.value)}
                          placeholder="e.g. Keys felt heavy & pitch was flat by 18 cents"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Initial Inspection Findings <span className="required-star">*</span></label>
                        <textarea
                          className="input-field"
                          rows={2}
                          required
                          value={srInitialFindings}
                          onChange={(e) => setSrInitialFindings(e.target.value)}
                          placeholder="e.g. Pitch flat by 18 cents; friction in whippen center pins due to humidity expansion"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Approved Service Scope <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srApprovedScope}
                          onChange={(e) => setSrApprovedScope(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Work Actually Performed <span className="required-star">*</span></label>
                        <textarea
                          className="input-field"
                          rows={2}
                          required
                          value={srWorkPerformed}
                          onChange={(e) => setSrWorkPerformed(e.target.value)}
                          placeholder="e.g. Tuned 88 keys to concert pitch A440; lubricated center pins, regulated key height"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Service Results and Limitations <span className="required-star">*</span></label>
                        <textarea
                          className="input-field"
                          rows={2}
                          required
                          value={srResultsLimitations}
                          onChange={(e) => setSrResultsLimitations(e.target.value)}
                          placeholder="e.g. Pitch fully stabilized to A440; recommended Dampp-Chaser humidity control rod"
                        />
                      </div>

                      <div className="form-group">
                        <label>Lead Technician <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srLeadTech}
                          onChange={(e) => setSrLeadTech(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Technical Associates <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srAssociates}
                          onChange={(e) => setSrAssociates(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Customer Acknowledgment (Name / Signature / Date) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={srAcknowledgment}
                          onChange={(e) => setSrAcknowledgment(e.target.value)}
                          placeholder="e.g. Signed by Atty. Fernando Alonso on 2026-08-05"
                        />
                      </div>

                      <div className="form-group">
                        <label>Parts & Materials Used</label>
                        <input
                          className="input-field"
                          value={srPartsUsed}
                          onChange={(e) => setSrPartsUsed(e.target.value)}
                          placeholder="e.g. 1 Set Renner felts, Center Pin Wire #20"
                        />
                      </div>

                      <div className="form-group">
                        <label>Recommended Next Service Target Date</label>
                        <input
                          type="date"
                          className="input-field"
                          value={srNextServiceDate}
                          onChange={(e) => setSrNextServiceDate(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Follow-Up Required</label>
                        <select
                          className="input-field"
                          value={srFollowUpRequired}
                          onChange={(e) => setSrFollowUpRequired(e.target.value as "Yes" | "No")}
                        >
                          <option value="Yes">Yes (Schedule 6-Month Reminder)</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Photos Attached Count</label>
                        <input
                          type="number"
                          className="input-field"
                          value={srPhotosCount}
                          onChange={(e) => setSrPhotosCount(Number(e.target.value))}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Additional Technical Notes</label>
                        <input
                          className="input-field"
                          value={srNotes}
                          onChange={(e) => setSrNotes(e.target.value)}
                          placeholder="e.g. Client requested SMS reminder prior to next tuning visit"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowServiceReportModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingServiceReport ? "💾 Save Changes" : "📋 Issue Service Report"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SERVICE REPORT DETAIL INSPECTION MODAL */}
          {selectedServiceReportDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedServiceReportDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Service Report — {selectedServiceReportDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedServiceReportDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Job Order</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>🛠️ {selectedServiceReportDetail.jobOrderNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Quotation</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>📄 {selectedServiceReportDetail.quotationNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Report Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedServiceReportDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Service Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedServiceReportDetail.serviceDate}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer / Contact</span><strong>{selectedServiceReportDetail.customerName}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Location</span><strong>📍 {selectedServiceReportDetail.location}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Piano Instrument</span><strong>🎹 {selectedServiceReportDetail.pianoDetails}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer-Reported Concern</span><strong style={{ color: "#991b1b" }}>{selectedServiceReportDetail.customerReportedConcern}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Initial Inspection Findings</span><strong style={{ color: "#0f172a" }}>{selectedServiceReportDetail.initialInspectionFindings}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Approved Service Scope</span><strong>{selectedServiceReportDetail.approvedServiceScope}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Work Actually Performed</span><strong style={{ color: "#059669" }}>{selectedServiceReportDetail.workActuallyPerformed}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Service Results & Limitations</span><strong>{selectedServiceReportDetail.serviceResultsLimitations}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Lead Technician</span><strong>🛠️ {selectedServiceReportDetail.leadTechnician}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Technical Associates</span><strong>{selectedServiceReportDetail.associates}</strong></div>
                  </div>

                  <div style={{ background: "#dcfce7", padding: 12, borderRadius: 10, border: "1px solid #86efac", fontSize: 12, color: "#166534" }}>
                    <strong>✍️ Customer Acknowledgment & Digital Sign-Off:</strong>
                    <div style={{ fontWeight: 800, fontSize: 13, marginTop: 2 }}>{selectedServiceReportDetail.customerAcknowledgment}</div>
                  </div>

                  {selectedServiceReportDetail.partsUsed && (
                    <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 12, color: "#166534" }}>
                      <strong>📦 Parts & Materials Used:</strong> {selectedServiceReportDetail.partsUsed}
                    </div>
                  )}

                  {selectedServiceReportDetail.recommendedNextServiceDate && (
                    <div style={{ background: "#e0f2fe", padding: 10, borderRadius: 8, border: "1px solid #7dd3fc", fontSize: 12, color: "#0369a1" }}>
                      <strong>📅 Recommended Next Tuning Date:</strong> {selectedServiceReportDetail.recommendedNextServiceDate} (Follow-Up: {selectedServiceReportDetail.followUpRequired || "Yes"})
                    </div>
                  )}

                  {selectedServiceReportDetail.notes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12 }}>
                      <span style={{ color: "#475569", fontWeight: 700, display: "block" }}>Technical Notes:</span>
                      <span>{selectedServiceReportDetail.notes}</span>
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedServiceReportDetail(null)}>Close</button>
                  <button
                    className="primary"
                    style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                    onClick={() => {
                      const target = selectedServiceReportDetail;
                      setSelectedServiceReportDetail(null);
                      setPrintableDoc({ type: "Service Report", data: target });
                    }}
                  >
                    🖨️ Generate PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT INVOICE MODAL */}
          {showInvoiceModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowInvoiceModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 680 }}>
                <div className="rhps-modal-header">
                  <h3>{editingInvoice ? `✏️ Edit Invoice — ${editingInvoice.id}` : "🧾 Issue Commercial Invoice"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowInvoiceModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveInvoiceSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    {/* OWNER EXCEPTION CHECKBOX & FIELDS */}
                    <div style={{ background: invExceptionWithoutReport ? "#fffbebf5" : "#f8fafc", padding: 12, borderRadius: 10, border: invExceptionWithoutReport ? "1px solid #fde68a" : "1px solid #e2e8f0" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 700, fontSize: 12.5, color: invExceptionWithoutReport ? "#92400e" : "#0f172a" }}>
                        <input
                          type="checkbox"
                          checked={invExceptionWithoutReport}
                          onChange={(e) => setInvExceptionWithoutReport(e.target.checked)}
                        />
                        ⚠️ Issue Invoice Without Service Report (Owner Exception Required)
                      </label>

                      {invExceptionWithoutReport && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                          <div className="form-group">
                            <label style={{ color: "#78350f" }}>Exception Approved By (Owner) <span className="required-star">*</span></label>
                            <input
                              className="input-field"
                              required={invExceptionWithoutReport}
                              value={invExceptionApprovedBy}
                              onChange={(e) => setInvExceptionApprovedBy(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ color: "#78350f" }}>Exception Reason <span className="required-star">*</span></label>
                            <input
                              className="input-field"
                              required={invExceptionWithoutReport}
                              value={invExceptionReason}
                              onChange={(e) => setInvExceptionReason(e.target.value)}
                              placeholder="e.g. Advance billing requested by client"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Invoice Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={invDate}
                          onChange={(e) => setInvDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Linked Service Report No {!invExceptionWithoutReport && <span className="required-star">*</span>}</label>
                        <input
                          className="input-field"
                          required={!invExceptionWithoutReport}
                          disabled={invExceptionWithoutReport}
                          value={invExceptionWithoutReport ? "N/A (Owner Exception)" : invServiceReportNo}
                          onChange={(e) => setInvServiceReportNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Linked Job Order No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={invJobOrderNo}
                          onChange={(e) => setInvJobOrderNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Linked Quotation No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={invQuotationNo}
                          onChange={(e) => setInvQuotationNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Linked Case ID <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={invCaseId}
                          onChange={(e) => setInvCaseId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name / Contact (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={invCustomerName}
                          onChange={(e) => setInvCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Billing Address (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={invBillingAddress}
                          onChange={(e) => setInvBillingAddress(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Service / Item Description <span className="required-star">*</span></label>
                        <textarea
                          className="input-field"
                          rows={2}
                          required
                          value={invServiceDesc}
                          onChange={(e) => setInvServiceDesc(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Invoice Amount (₱) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          className="input-field"
                          required
                          value={invAmount}
                          onChange={(e) => setInvAmount(Number(e.target.value))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Discount Amount (₱)</label>
                        <input
                          type="number"
                          className="input-field"
                          value={invDiscount}
                          onChange={(e) => setInvDiscount(Number(e.target.value))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Payment Terms <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={invPaymentTerms}
                          onChange={(e) => setInvPaymentTerms(e.target.value)}
                        >
                          <option value="Due on Receipt">Due on Receipt</option>
                          <option value="Net 7">Net 7</option>
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Due Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={invDueDate}
                          onChange={(e) => setInvDueDate(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Prepared By <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={invPreparedBy}
                          onChange={(e) => setInvPreparedBy(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Payment Method Expected</label>
                        <select
                          className="input-field"
                          value={invPaymentMethodExpected}
                          onChange={(e) => setInvPaymentMethodExpected(e.target.value)}
                        >
                          <option value="GCash">GCash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash">Cash</option>
                          <option value="Check">Check</option>
                        </select>
                      </div>
                    </div>

                    {/* REGISTERED BUSINESS TAX / VAT SECTION — HIDDEN / DISABLED IF NOT REGISTERED */}
                    {isRegistered ? (
                      <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 12, border: "1px solid #bbf7d0" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#166534", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                          🏛️ Tax & Official VAT Registration Fields (Business Registered = Yes)
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 12 }}>
                          <div><span style={{ color: "#64748b", fontSize: 11 }}>Registered TIN:</span> <strong>{tin}</strong></div>
                          <div><span style={{ color: "#64748b", fontSize: 11 }}>VAT Status:</span> <strong>{vatStatus}</strong></div>
                          <div><span style={{ color: "#64748b", fontSize: 11 }}>Official Tax Document:</span> <strong>VAT Official Receipt / Invoice</strong></div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 12 }}>
                        🔒 Tax / VAT / TIN fields are hidden & disabled because <strong>Registered = No</strong> in Business Info Settings.
                      </div>
                    )}

                    <div className="form-group">
                      <label>Internal Billing Notes</label>
                      <input
                        className="input-field"
                        value={invInternalNotes}
                        onChange={(e) => setInvInternalNotes(e.target.value)}
                        placeholder="e.g. Client requested PDF copy emailed to billing department"
                      />
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingInvoice ? "💾 Save Changes" : "🧾 Issue Invoice"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* INVOICE DETAIL INSPECTION MODAL */}
          {selectedInvoiceDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedInvoiceDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Commercial Invoice — {selectedInvoiceDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedInvoiceDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Service Report</span>
                      <strong style={{ display: "block", color: "#0284c7" }}>📋 {selectedInvoiceDetail.serviceReportNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Job Order</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>🛠️ {selectedInvoiceDetail.jobOrderNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Invoice Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedInvoiceDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Due Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedInvoiceDetail.dueDate}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer / Contact</span><strong>{selectedInvoiceDetail.customerName}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Billing Address</span><strong>📍 {selectedInvoiceDetail.billingAddress}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Service / Item Description</span><strong style={{ color: "#0f172a" }}>{selectedInvoiceDetail.serviceDescription}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Gross Invoice Amount</span><strong>₱{selectedInvoiceDetail.invoiceAmount.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>System-Calculated Amount Paid</span><strong style={{ color: "#059669" }}>₱{selectedInvoiceDetail.amountPaid.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>System-Calculated Balance</span><strong style={{ color: selectedInvoiceDetail.balance > 0 ? "#c2410c" : "#059669", fontSize: 15 }}>₱{selectedInvoiceDetail.balance.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Payment Terms</span><strong>{selectedInvoiceDetail.paymentTerms}</strong></div>
                  </div>

                  {/* EXCEPTION DETAILS */}
                  {selectedInvoiceDetail.exceptionWithoutReport && (
                    <div style={{ background: "#fffbebf5", padding: 12, borderRadius: 10, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
                      <strong>⚠️ Owner Exception Authorized:</strong>
                      <div>Approved By: <strong>{selectedInvoiceDetail.exceptionApprovedBy}</strong></div>
                      <div>Reason: <strong>{selectedInvoiceDetail.exceptionReason}</strong></div>
                    </div>
                  )}

                  {/* VOID REASON DETAILS */}
                  {selectedInvoiceDetail.status === "Void" && selectedInvoiceDetail.voidReason && (
                    <div style={{ background: "#fee2e2", padding: 12, borderRadius: 10, border: "1px solid #fca5a5", fontSize: 12, color: "#991b1b" }}>
                      <strong>⛔ Invoice Voided:</strong> {selectedInvoiceDetail.voidReason}
                    </div>
                  )}

                  {isRegistered && (
                    <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 12, color: "#166534" }}>
                      <strong>🏛️ Tax Info:</strong> TIN: {tin} | Status: {vatStatus}
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedInvoiceDetail(null)}>Close</button>
                  {selectedInvoiceDetail.status !== "Void" && selectedInvoiceDetail.status !== "Paid in Full" && (
                    <button
                      className="primary"
                      style={{ background: "#059669", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                      onClick={() => {
                        const target = selectedInvoiceDetail;
                        setSelectedInvoiceDetail(null);
                        handleRecordPaymentForInvoice(target);
                      }}
                    >
                      💳 Record Payment
                    </button>
                  )}
                  <button
                    className="primary"
                    style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                    onClick={() => {
                      const target = selectedInvoiceDetail;
                      setSelectedInvoiceDetail(null);
                      setPrintableDoc({ type: "Invoice", data: target });
                    }}
                  >
                    🖨️ PDF Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT PAYMENT MODAL */}
          {showPaymentModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowPaymentModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 680 }}>
                <div className="rhps-modal-header">
                  <h3>{editingPayment ? `✏️ Edit Payment Record — ${editingPayment.id}` : "💳 Record Customer Payment"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
                </div>
                <form onSubmit={handleSavePaymentSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Linked Invoice No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payInvoiceNo}
                          onChange={(e) => setPayInvoiceNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Linked Job Order No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payJobOrderNo}
                          onChange={(e) => setPayJobOrderNo(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Linked Case ID <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payCaseId}
                          onChange={(e) => setPayCaseId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payCustomerName}
                          onChange={(e) => setPayCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Payment Date & Time <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payDateTime}
                          onChange={(e) => setPayDateTime(e.target.value)}
                          placeholder="YYYY-MM-DD HH:MM"
                        />
                      </div>

                      <div className="form-group">
                        <label>Payment Type <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={payType}
                          onChange={(e) => setPayType(e.target.value as PaymentType)}
                        >
                          <option value="Deposit">Deposit</option>
                          <option value="Partial">Partial</option>
                          <option value="Progress">Progress</option>
                          <option value="Full">Full</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Payment Method (Locked Dropdown) <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          style={{ fontWeight: 700 }}
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        >
                          <option value="Cash">Cash</option>
                          <option value="GCash">GCash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Check">Check</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Reference Number (or 'N/A') <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payRefNo}
                          onChange={(e) => setPayRefNo(e.target.value)}
                          placeholder="e.g. GC-994810294 or N/A"
                        />
                      </div>

                      <div className="form-group">
                        <label>Amount Received Today (₱) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          className="input-field"
                          required
                          value={payAmountReceived}
                          onChange={(e) => setPayAmountReceived(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* SYSTEM-CALCULATED READ-ONLY PREVIEW */}
                    {(() => {
                      const targetInv = invoices.find((i) => i.id === payInvoiceNo);
                      const invTotal = targetInv ? Math.max(0, targetInv.invoiceAmount - (targetInv.discount || 0)) : payAmountReceived;
                      const prevPaid = targetInv ? targetInv.amountPaid : 0;
                      const newPaid = prevPaid + (payAmountReceived || 0);
                      const remBal = Math.max(0, invTotal - newPaid);

                      return (
                        <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                            🤖 System-Calculated Read-Only Balance Breakdown
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, fontSize: 12 }}>
                            <div><span style={{ color: "#64748b", fontSize: 11 }}>Invoice Total:</span> <strong style={{ display: "block" }}>₱{invTotal.toLocaleString()}</strong></div>
                            <div><span style={{ color: "#64748b", fontSize: 11 }}>Previous Total Paid:</span> <strong style={{ display: "block", color: "#64748b" }}>₱{prevPaid.toLocaleString()}</strong></div>
                            <div><span style={{ color: "#64748b", fontSize: 11 }}>New Total Paid:</span> <strong style={{ display: "block", color: "#059669" }}>₱{newPaid.toLocaleString()}</strong></div>
                            <div><span style={{ color: "#64748b", fontSize: 11 }}>Remaining Balance:</span> <strong style={{ display: "block", color: remBal > 0 ? "#c2410c" : "#059669", fontSize: 13 }}>₱{remBal.toLocaleString()}</strong></div>
                          </div>
                        </div>
                      );
                    })()}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Received By (Separate Handler Field) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payReceivedBy}
                          onChange={(e) => setPayReceivedBy(e.target.value)}
                          placeholder="e.g. Jun (Tech Asst)"
                        />
                      </div>
                      <div className="form-group">
                        <label>Verified By (Separate Handler Field) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={payVerifiedBy}
                          onChange={(e) => setPayVerifiedBy(e.target.value)}
                          placeholder="e.g. Robert Herrero (Owner)"
                        />
                        <span style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, display: "block" }}>
                          ℹ️ Owner-only override applies if same person handles both.
                        </span>
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Customer Confirmation Reference (Screenshot / Signature)</label>
                        <input
                          className="input-field"
                          value={payCustomerConfirmation}
                          onChange={(e) => setPayCustomerConfirmation(e.target.value)}
                          placeholder="e.g. GCash receipt screenshot #GC-994810294 verified"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Internal Notes</label>
                        <input
                          className="input-field"
                          value={payNotes}
                          onChange={(e) => setPayNotes(e.target.value)}
                          placeholder="e.g. Payment verified against bank statement line item"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingPayment ? "💾 Save Changes" : "💳 Record Payment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PAYMENT DETAIL & BALANCE INSPECTION MODAL */}
          {selectedPaymentDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedPaymentDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Payment Record — {selectedPaymentDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedPaymentDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Payment ACK No.</span>
                      <strong style={{ display: "block", color: "#0284c7" }}>📜 {selectedPaymentDetail.paymentAckNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Invoice</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>🧾 {selectedPaymentDetail.invoiceNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Payment Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedPaymentDetail.status}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Payment Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedPaymentDetail.paymentDateTime}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer Name</span><strong>{selectedPaymentDetail.customerName}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Payment Method & Ref</span><strong>{selectedPaymentDetail.paymentMethod} ({selectedPaymentDetail.referenceNo})</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Amount Received Today</span><strong style={{ color: "#059669", fontSize: 16 }}>₱{selectedPaymentDetail.amountReceivedToday.toLocaleString()}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Payment Type</span><strong>{selectedPaymentDetail.paymentType}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Received By (Handler 1)</span><strong>📥 {selectedPaymentDetail.receivedBy}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Verified By (Handler 2)</span><strong>✅ {selectedPaymentDetail.verifiedBy}</strong></div>
                  </div>

                  <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 12, border: "1px solid #bbf7d0" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#166534", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                      📊 System-Calculated Read-Only Balance Summary
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, fontSize: 12 }}>
                      <div><span style={{ color: "#64748b", fontSize: 11 }}>Invoice Total:</span><strong style={{ display: "block" }}>₱{selectedPaymentDetail.invoiceTotal.toLocaleString()}</strong></div>
                      <div><span style={{ color: "#64748b", fontSize: 11 }}>Previous Paid:</span><strong style={{ display: "block", color: "#64748b" }}>₱{selectedPaymentDetail.previousTotalPaid.toLocaleString()}</strong></div>
                      <div><span style={{ color: "#64748b", fontSize: 11 }}>New Total Paid:</span><strong style={{ display: "block", color: "#059669" }}>₱{selectedPaymentDetail.newTotalPaid.toLocaleString()}</strong></div>
                      <div><span style={{ color: "#64748b", fontSize: 11 }}>Remaining Balance:</span><strong style={{ display: "block", color: selectedPaymentDetail.remainingBalance > 0 ? "#c2410c" : "#059669", fontSize: 14 }}>₱{selectedPaymentDetail.remainingBalance.toLocaleString()}</strong></div>
                    </div>
                  </div>

                  {selectedPaymentDetail.customerConfirmation && (
                    <div style={{ background: "#e0f2fe", padding: 10, borderRadius: 8, border: "1px solid #7dd3fc", fontSize: 12, color: "#0369a1" }}>
                      <strong>📸 Customer Confirmation Reference:</strong> {selectedPaymentDetail.customerConfirmation}
                    </div>
                  )}

                  {selectedPaymentDetail.refundReason && (
                    <div style={{ background: "#fee2e2", padding: 10, borderRadius: 8, border: "1px solid #fca5a5", fontSize: 12, color: "#991b1b" }}>
                      <strong>💸 Refund Reason Logged:</strong> {selectedPaymentDetail.refundReason}
                    </div>
                  )}

                  {selectedPaymentDetail.voidReason && (
                    <div style={{ background: "#fee2e2", padding: 10, borderRadius: 8, border: "1px solid #fca5a5", fontSize: 12, color: "#991b1b" }}>
                      <strong>⛔ Void Reason Logged:</strong> {selectedPaymentDetail.voidReason}
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedPaymentDetail(null)}>Close</button>
                  <button
                    className="primary"
                    style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                    onClick={() => {
                      const target = selectedPaymentDetail;
                      setSelectedPaymentDetail(null);
                      handleGenerateAckAction(target);
                    }}
                  >
                    📜 Generate Acknowledgment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT FOLLOW-UP MODAL */}
          {showFollowUpModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowFollowUpModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 680 }}>
                <div className="rhps-modal-header">
                  <h3>{editingFollowUp ? `✏️ Edit Follow-Up — ${editingFollowUp.id}` : "📅 Schedule Follow-Up & Reminder"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowFollowUpModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveFollowUpSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Linked Case ID <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={folCaseId}
                          onChange={(e) => setFolCaseId(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Target Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={folTargetDate}
                          onChange={(e) => setFolTargetDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Assigned Technician <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={folAssignedTo}
                          onChange={(e) => setFolAssignedTo(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={folCustomerName}
                          onChange={(e) => setFolCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Piano Details (Carried Forward) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={folPianoDetails}
                          onChange={(e) => setFolPianoDetails(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Follow-Up Type <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={folType}
                          onChange={(e) => setFolType(e.target.value as FollowUpType)}
                        >
                          <option value="Routine Check-In">Routine Check-In</option>
                          <option value="Next Service Reminder">Next Service Reminder</option>
                          <option value="Warranty Comeback">Warranty Comeback</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Follow-Up Status <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={folStatus}
                          onChange={(e) => setFolStatus(e.target.value as FollowUpStatus)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* CONDITIONAL REQUIRED SECTION: WARRANTY COMEBACK */}
                    {folType === "Warranty Comeback" && (
                      <div style={{ background: "#ffedd5", padding: 14, borderRadius: 12, border: "1px solid #fed7aa" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                          🛠️ Warranty Comeback Mandatory Links & Charges
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div className="form-group">
                            <label style={{ color: "#7c2d12" }}>Linked Original Job Order No. <span className="required-star">*</span></label>
                            <input
                              className="input-field"
                              required={folType === "Warranty Comeback"}
                              value={folJobOrderNo}
                              onChange={(e) => setFolJobOrderNo(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ color: "#7c2d12" }}>Linked Original Service Report No. <span className="required-star">*</span></label>
                            <input
                              className="input-field"
                              required={folType === "Warranty Comeback"}
                              value={folServiceReportNo}
                              onChange={(e) => setFolServiceReportNo(e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label style={{ color: "#7c2d12" }}>Warranty Issue Description <span className="required-star">*</span></label>
                            <input
                              className="input-field"
                              required={folType === "Warranty Comeback"}
                              value={folIssueDesc}
                              onChange={(e) => setFolIssueDesc(e.target.value)}
                              placeholder="e.g. Minor damper felts buzz on C#4 after regulation"
                            />
                          </div>
                          <div className="form-group">
                            <label style={{ color: "#7c2d12" }}>Covered by Warranty? <span className="required-star">*</span></label>
                            <select
                              className="input-field"
                              value={folCoveredByWarranty}
                              onChange={(e) => setFolCoveredByWarranty(e.target.value as "Yes" | "No")}
                            >
                              <option value="Yes">Yes (No Auto Billing / Free Fix)</option>
                              <option value="No">No (Out of Scope)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label style={{ color: "#7c2d12" }}>New Charges Required? <span className="required-star">*</span></label>
                            <select
                              className="input-field"
                              value={folNewChargesRequired}
                              onChange={(e) => setFolNewChargesRequired(e.target.value as "Yes" | "No")}
                            >
                              <option value="No">No (Strict No Auto-Billing Rule)</option>
                              <option value="Yes">Yes (Requires New Quotation Path)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Preferred Contact Method</label>
                        <select
                          className="input-field"
                          value={folContactMethod}
                          onChange={(e) => setFolContactMethod(e.target.value as "Call" | "Message")}
                        >
                          <option value="Call">Call</option>
                          <option value="Message">Message / Viber</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Notes / Reminders</label>
                        <input
                          className="input-field"
                          value={folNotes}
                          onChange={(e) => setFolNotes(e.target.value)}
                          placeholder="e.g. Customer prefers morning contact before 10 AM"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowFollowUpModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingFollowUp ? "💾 Save Changes" : "📅 Schedule Follow-Up"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* FOLLOW-UP DETAIL INSPECTION MODAL */}
          {selectedFollowUpDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedFollowUpDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Follow-Up Record — {selectedFollowUpDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedFollowUpDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Case ID</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>📁 {selectedFollowUpDetail.caseId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Follow-Up Type</span>
                      <strong style={{ display: "block", color: "#c2410c" }}>{selectedFollowUpDetail.followUpType}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Target Date</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedFollowUpDetail.targetDate}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedFollowUpDetail.status}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Customer Name</span><strong>{selectedFollowUpDetail.customerName}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Piano Details</span><strong>🎹 {selectedFollowUpDetail.pianoDetails}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Assigned Technician</span><strong>👤 {selectedFollowUpDetail.assignedTo}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Contact Method</span><strong>{selectedFollowUpDetail.contactMethod || "Call"}</strong></div>
                  </div>

                  {/* WARRANTY DETAILS */}
                  {selectedFollowUpDetail.followUpType === "Warranty Comeback" && (
                    <div style={{ background: "#ffedd5", padding: 12, borderRadius: 10, border: "1px solid #fed7aa", fontSize: 12, color: "#7c2d12" }}>
                      <strong>🛠️ Warranty Comeback Log:</strong>
                      <div>Linked Orig Job Order: <strong>{selectedFollowUpDetail.linkedOriginalJobOrderNo}</strong></div>
                      <div>Linked Orig Service Report: <strong>{selectedFollowUpDetail.linkedOriginalServiceReportNo}</strong></div>
                      <div>Issue Reported: <strong>{selectedFollowUpDetail.issueDescription}</strong></div>
                      <div>Covered by Warranty: <strong>{selectedFollowUpDetail.coveredByWarranty}</strong></div>
                      <div>New Charges Required: <strong>{selectedFollowUpDetail.newChargesRequired}</strong></div>
                    </div>
                  )}

                  {selectedFollowUpDetail.notes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                      <strong>📝 Notes:</strong> {selectedFollowUpDetail.notes}
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedFollowUpDetail(null)}>Close</button>
                  {selectedFollowUpDetail.followUpType === "Warranty Comeback" && selectedFollowUpDetail.newChargesRequired === "Yes" && (
                    <button
                      className="primary"
                      style={{ background: "#c2410c", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                      onClick={() => {
                        const target = selectedFollowUpDetail;
                        setSelectedFollowUpDetail(null);
                        handleTriggerNewQuotationForWarranty(target);
                      }}
                    >
                      ⚡ Trigger Quotation
                    </button>
                  )}
                  <button
                    className="primary"
                    style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                    onClick={() => {
                      const target = selectedFollowUpDetail;
                      setSelectedFollowUpDetail(null);
                      handleTriggerNewCaseForFutureService(target);
                    }}
                  >
                    🚀 Open New Case
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT DOCUMENT MODAL */}
          {showDocModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowDocModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>{editingDoc ? `✏️ Edit Document Record — ${editingDoc.id}` : "📁 Generate Official Document Record"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowDocModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveDocSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                      <strong>ℹ️ Auto-Assigned Document Numbering:</strong> Document No. is auto-assigned from Manage Numbering (e.g. <code>DOC-2026-XXX</code>) — never manually typed.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Document Type <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as DocumentType)}
                        >
                          <option value="Estimate">Estimate</option>
                          <option value="Quotation">Quotation</option>
                          <option value="Job Order">Job Order</option>
                          <option value="Service Report">Service Report</option>
                          <option value="Invoice">Invoice</option>
                          <option value="Payment Acknowledgment">Payment Acknowledgment</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Record Type (Safeguard Tag) <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          style={{ fontWeight: 800, color: docRecordType === "TEST" ? "#c2410c" : "#15803d" }}
                          value={docRecordType}
                          onChange={(e) => setDocRecordType(e.target.value as RecordMode)}
                        >
                          <option value="ACTUAL">ACTUAL RECORD (Official Business)</option>
                          <option value="TEST">TEST RECORD ONLY (Safeguard Sandbox)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Linked Source Record No. <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={docSourceNo}
                          onChange={(e) => setDocSourceNo(e.target.value)}
                          placeholder="e.g. QT-2026-001 or INV-2026-001"
                        />
                      </div>

                      <div className="form-group">
                        <label>Linked Case ID <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={docCaseId}
                          onChange={(e) => setDocCaseId(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Generating Module <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={docModule}
                          onChange={(e) => setDocModule(e.target.value as GeneratingModule)}
                        >
                          <option value="Customer Desk">Customer Desk</option>
                          <option value="Service & Quotations">Service & Quotations</option>
                          <option value="Office & Records">Office & Records</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Generated By <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={docGeneratedBy}
                          onChange={(e) => setDocGeneratedBy(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Ownership Role <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={docOwnershipRole}
                          onChange={(e) => setDocOwnershipRole(e.target.value)}
                          placeholder="e.g. Lead Technician / Owner"
                        />
                      </div>

                      <div className="form-group">
                        <label>Document Status <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={docStatus}
                          onChange={(e) => setDocStatus(e.target.value as DocumentStatus)}
                        >
                          <option value="Generated">Generated</option>
                          <option value="Sent">Sent</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Sent To (Recipient Contact / Method)</label>
                        <input
                          className="input-field"
                          value={docSentTo}
                          onChange={(e) => setDocSentTo(e.target.value)}
                          placeholder="e.g. 0917-555-0192 (Email PDF / Viber)"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Document Notes</label>
                        <input
                          className="input-field"
                          value={docNotes}
                          onChange={(e) => setDocNotes(e.target.value)}
                          placeholder="e.g. Version 1.0 official signed copy"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowDocModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingDoc ? "💾 Save Changes" : "📁 Generate Document"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DOCUMENT DETAIL INSPECTION MODAL */}
          {selectedDocDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedDocDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 660 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Document Record — {selectedDocDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedDocDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  {selectedDocDetail.recordType === "TEST" && (
                    <div style={{ background: "#fffbebf5", border: "1px solid #fde68a", padding: 12, borderRadius: 10, fontSize: 12, color: "#92400e" }}>
                      <strong>⚠️ TEST RECORD ONLY:</strong> This document is tagged for sandbox testing and is <strong>strictly excluded from actual income, expense, balance, or dashboard totals</strong>.
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Document Type</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedDocDetail.documentType}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Source Record</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>📄 {selectedDocDetail.linkedSourceRecordNo}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Linked Case ID</span>
                      <strong style={{ display: "block", color: "#3730a3" }}>📁 {selectedDocDetail.linkedCaseId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedDocDetail.status}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Date Generated</span><strong>{selectedDocDetail.dateGenerated}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Generated By</span><strong>👤 {selectedDocDetail.generatedBy}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Generating Module</span><strong>{selectedDocDetail.generatingModule}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Ownership Role</span><strong>{selectedDocDetail.documentOwnershipRole}</strong></div>
                    {selectedDocDetail.sentTo && <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Sent To</span><strong>{selectedDocDetail.sentTo}</strong></div>}
                  </div>

                  {selectedDocDetail.notes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                      <strong>📝 Notes:</strong> {selectedDocDetail.notes}
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedDocDetail(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE / EDIT TRADE-IN DEAL MODAL */}
          {showTradeModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowTradeModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 740 }}>
                <div className="rhps-modal-header">
                  <h3>{editingTrade ? `✏️ Edit Trade-In Deal — ${editingTrade.id}` : "🔄 Log Trade-In & Piano Sales Deal"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowTradeModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveTradeSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    {/* CUSTOMER & CONTACT */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={trdCustomerName}
                          onChange={(e) => setTrdCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Number <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={trdContactNumber}
                          onChange={(e) => setTrdContactNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* DUAL TRANSACTION SECTION 1: TRADED-IN UNIT */}
                    <div style={{ background: "#fff7ed", padding: 14, borderRadius: 12, border: "1px solid #ffedd5" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                        🎹 1. Traded-In Unit (Customer's Piano & Credit)
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div className="form-group">
                          <label style={{ color: "#7c2d12" }}>Offered Piano Brand & Model <span className="required-star">*</span></label>
                          <input
                            className="input-field"
                            required
                            value={trdOfferedBrandModel}
                            onChange={(e) => setTrdOfferedBrandModel(e.target.value)}
                            placeholder="e.g. Kawai K-15 Upright"
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: "#7c2d12" }}>Serial Number <span className="required-star">*</span></label>
                          <input
                            className="input-field"
                            required
                            value={trdOfferedSerialNo}
                            onChange={(e) => setTrdOfferedSerialNo(e.target.value)}
                            placeholder="e.g. KW-391820"
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label style={{ color: "#7c2d12" }}>Physical & Mechanical Condition Appraisal <span className="required-star">*</span></label>
                          <input
                            className="input-field"
                            required
                            value={trdOfferedCondition}
                            onChange={(e) => setTrdOfferedCondition(e.target.value)}
                            placeholder="e.g. Action pins tight, soundboard intact, minor cabinet scratches"
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                          <label style={{ color: "#7c2d12" }}>Appraised Trade Allowance Credit (₱) <span className="required-star">*</span></label>
                          <input
                            type="number"
                            className="input-field"
                            style={{ fontSize: 15, fontWeight: 800, color: "#c2410c" }}
                            required
                            value={trdAppraisalValuation}
                            onChange={(e) => setTrdAppraisalValuation(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* DUAL TRANSACTION SECTION 2: TARGET UNIT PURCHASED */}
                    <div style={{ background: "#f0f9ff", padding: 14, borderRadius: 12, border: "1px solid #e0f2fe" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#0369a1", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                        🏪 2. Target Unit Purchased (Store Inventory & Net Payable)
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Select Store Inventory Unit</label>
                          <select
                            className="input-field"
                            value={trdTargetInventoryUnitId}
                            onChange={(e) => {
                              const selId = e.target.value;
                              setTrdTargetInventoryUnitId(selId);
                              const targetUnit = inventory.find((i) => i.id === selId);
                              if (targetUnit) {
                                setTrdTargetBrandModel(`${targetUnit.brand} ${targetUnit.model}`);
                                setTrdTargetGrossPrice(targetUnit.price);
                              }
                            }}
                          >
                            {inventory.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.id} — {inv.brand} {inv.model} (₱{inv.price.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Target Piano Description <span className="required-star">*</span></label>
                          <input
                            className="input-field"
                            required
                            value={trdTargetBrandModel}
                            onChange={(e) => setTrdTargetBrandModel(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Gross Selling Price (₱) <span className="required-star">*</span></label>
                          <input
                            type="number"
                            className="input-field"
                            required
                            value={trdTargetGrossPrice}
                            onChange={(e) => setTrdTargetGrossPrice(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ color: "#166534" }}>System Net Payable Balance (₱) (Read-Only)</label>
                          <input
                            className="input-field"
                            readOnly
                            style={{ background: "#dcfce7", fontWeight: 900, color: "#15803d", fontSize: 16 }}
                            value={`₱${Math.max(0, trdTargetGrossPrice - trdAppraisalValuation).toLocaleString()}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* APPRAISER & STATUS */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Appraised By <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={trdAppraisedBy}
                          onChange={(e) => setTrdAppraisedBy(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Approved By (Owner) <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={trdApprovedByOwner}
                          onChange={(e) => setTrdApprovedByOwner(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Trade Status <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={trdStatus}
                          onChange={(e) => setTrdStatus(e.target.value as TradeInStatus)}
                        >
                          <option value="Opportunity Added">Opportunity Added</option>
                          <option value="In Appraisal">In Appraisal</option>
                          <option value="Valuation Offered">Valuation Offered</option>
                          <option value="Buyer Registered">Buyer Registered</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Closed Lost">Closed Lost</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Deal Notes / Terms</label>
                      <input
                        className="input-field"
                        value={trdNotes}
                        onChange={(e) => setTrdNotes(e.target.value)}
                        placeholder="e.g. Delivery scheduled post-refurbish with 1 year tuning warranty"
                      />
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowTradeModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingTrade ? "💾 Save Trade Deal" : "🔄 Log Trade-In Deal"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TRADE-IN INSPECTION MODAL */}
          {selectedTradeDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedTradeDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 700 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Trade-In Record — {selectedTradeDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedTradeDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Customer Name</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedTradeDetail.customerName}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Contact</span>
                      <strong style={{ display: "block", color: "#2563eb" }}>📞 {selectedTradeDetail.contactNumber}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Status</span>
                      <strong style={{ display: "block", color: "#059669" }}>{selectedTradeDetail.status}</strong>
                    </div>
                  </div>

                  <div style={{ background: "#fff7ed", padding: 12, borderRadius: 10, border: "1px solid #ffedd5" }}>
                    <strong style={{ color: "#c2410c" }}>🎹 Traded-In Unit Appraisal:</strong>
                    <div style={{ fontSize: 12.5, margin: "4px 0" }}>Piano: <strong>{selectedTradeDetail.offeredPianoBrandModel}</strong> (S/N: {selectedTradeDetail.offeredPianoSerialNo})</div>
                    <div style={{ fontSize: 12, color: "#475569" }}>Condition: {selectedTradeDetail.offeredPianoCondition}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#c2410c", marginTop: 4 }}>Appraised Credit Value: ₱{selectedTradeDetail.appraisalValuation.toLocaleString()}</div>
                  </div>

                  <div style={{ background: "#f0f9ff", padding: 12, borderRadius: 10, border: "1px solid #e0f2fe" }}>
                    <strong style={{ color: "#0369a1" }}>🏪 Target Unit & Net Breakdown:</strong>
                    <div style={{ fontSize: 12.5, margin: "4px 0" }}>Target Piano: <strong>{selectedTradeDetail.targetPianoBrandModel}</strong></div>
                    <div style={{ fontSize: 12, color: "#334155" }}>Gross Price: ₱{selectedTradeDetail.targetGrossPrice.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "#c2410c" }}>Trade Credit: -₱{selectedTradeDetail.appraisalValuation.toLocaleString()}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#166534", marginTop: 6 }}>Net Payable Balance: ₱{selectedTradeDetail.netPayableBalance.toLocaleString()}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12.5 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Appraised By</span><strong>🔍 {selectedTradeDetail.appraisedBy}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Owner Sign-Off</span><strong>✅ {selectedTradeDetail.approvedByOwner}</strong></div>
                  </div>

                  {selectedTradeDetail.notes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                      <strong>📝 Notes:</strong> {selectedTradeDetail.notes}
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedTradeDetail(null)}>Close</button>
                  <button
                    className="primary"
                    style={{ background: "#0f172a", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}
                    onClick={() => {
                      const target = selectedTradeDetail;
                      setSelectedTradeDetail(null);
                      openCreateInvoiceModal();
                    }}
                  >
                    🧾 Issue Net Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER BUYER MODAL */}
          {showRegisterBuyerModal && targetTradeForAction && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowRegisterBuyerModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 500 }}>
                <div className="rhps-modal-header">
                  <h3>👤 Register Buyer for Trade Deal — {targetTradeForAction.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowRegisterBuyerModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveRegisterBuyer}>
                  <div className="rhps-modal-body" style={{ gap: 14 }}>
                    <div style={{ background: "#f0f9ff", padding: 12, borderRadius: 10, border: "1px solid #e0f2fe", fontSize: 12, color: "#0369a1" }}>
                      Register buyer details to officially reserve the target piano unit (<strong>{targetTradeForAction.targetPianoBrandModel || "Store Unit"}</strong>).
                    </div>
                    <div className="form-group">
                      <label>Buyer Name <span className="required-star">*</span></label>
                      <input
                        className="input-field"
                        required
                        value={buyerInputName}
                        onChange={(e) => setBuyerInputName(e.target.value)}
                        placeholder="e.g. Atty. Fernando Alonso"
                      />
                    </div>
                    <div className="form-group">
                      <label>Buyer Contact Number <span className="required-star">*</span></label>
                      <input
                        className="input-field"
                        required
                        value={buyerInputContact}
                        onChange={(e) => setBuyerInputContact(e.target.value)}
                        placeholder="e.g. 0917-882-9912"
                      />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowRegisterBuyerModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0284c7", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontWeight: 700, border: "none" }}>
                      👤 Save Registered Buyer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CLOSE LOST REASON MODAL */}
          {showCloseLostModal && targetTradeForAction && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowCloseLostModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 500 }}>
                <div className="rhps-modal-header">
                  <h3>🔴 Mark Deal Closed Lost — {targetTradeForAction.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowCloseLostModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveCloseLost}>
                  <div className="rhps-modal-body" style={{ gap: 14 }}>
                    <div style={{ background: "#fef2f2", padding: 12, borderRadius: 10, border: "1px solid #fee2e2", fontSize: 12, color: "#991b1b" }}>
                      Please provide a reason why this trade opportunity was lost for reporting & analytics.
                    </div>
                    <div className="form-group">
                      <label>Reason for Closed Lost <span className="required-star">*</span></label>
                      <input
                        className="input-field"
                        required
                        value={lostReasonInput}
                        onChange={(e) => setLostReasonInput(e.target.value)}
                        placeholder="e.g. Client opted for lower appraisal elsewhere / Budget constraint"
                      />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowCloseLostModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#b91c1c", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontWeight: 700, border: "none" }}>
                      🔴 Confirm Closed Lost
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* CREATE / EDIT EXPENSE MODAL */}
          {showExpModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowExpModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 680 }}>
                <div className="rhps-modal-header">
                  <h3>{editingExp ? `✏️ Edit Expense Record — ${editingExp.id}` : "📉 Log Operating Expense & Link to Job"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowExpModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveExpenseSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Expense Category <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                        >
                          <option value="Parts">Parts & Materials</option>
                          <option value="Transport / Fuel">Transport & Fuel</option>
                          <option value="Tools">Tools & Equipment</option>
                          <option value="Utilities">Utilities & Rent</option>
                          <option value="Marketing">Marketing & Ads</option>
                          <option value="Job Overhead">Job Direct Overhead</option>
                          <option value="Other">Other Expenses</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Record Type (Safeguard Tag) <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          style={{ fontWeight: 800, color: expRecordType === "TEST" ? "#c2410c" : "#15803d" }}
                          value={expRecordType}
                          onChange={(e) => setExpRecordType(e.target.value as RecordMode)}
                        >
                          <option value="ACTUAL">ACTUAL RECORD (Official Expense)</option>
                          <option value="TEST">TEST RECORD ONLY (Safeguard Sandbox)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Amount (₱) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          className="input-field"
                          style={{ fontSize: 16, fontWeight: 900, color: "#dc2626" }}
                          required
                          value={expAmount}
                          onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Vendor / Payee <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={expPaidTo}
                          onChange={(e) => setExpPaidTo(e.target.value)}
                          placeholder="e.g. PianoParts Supply Asia"
                        />
                      </div>
                    </div>

                    {/* LINK TO JOB SECTION */}
                    <div style={{ background: "#e0f2fe", padding: 14, borderRadius: 12, border: "1px solid #bae6fd" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#0369a1", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                        ⚙️ Link Expense to Specific Job Order / Case
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Linked Job Order No.</label>
                          <select
                            className="input-field"
                            value={expLinkedJobOrderNo}
                            onChange={(e) => {
                              const selJo = e.target.value;
                              setExpLinkedJobOrderNo(selJo);
                              const matchedJo = jobOrders.find((j) => j.id === selJo);
                              const nextCaseId = matchedJo?.caseId;
                              setExpLinkedCaseId(typeof nextCaseId === "string" ? nextCaseId : "");
                            }}
                          >
                            <option value="">-- General Overhead (No Job) --</option>
                            {jobOrders.map((jo) => (
                              <option key={jo.id} value={jo.id}>
                                {jo.id} — {jo.customerName} ({jo.serviceType})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Linked Case ID</label>
                          <input
                            className="input-field"
                            value={expLinkedCaseId}
                            onChange={(e) => setExpLinkedCaseId(e.target.value)}
                            placeholder="e.g. CASE-2026-001"
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ color: "#0369a1" }}>Receipt / Voucher Ref No.</label>
                          <input
                            className="input-field"
                            value={expReceiptRefNo}
                            onChange={(e) => setExpReceiptRefNo(e.target.value)}
                            placeholder="e.g. OR-882910"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Expense Description <span className="required-star">*</span></label>
                      <input
                        className="input-field"
                        required
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        placeholder="e.g. Imported Renner hammer felt set for Steinway M"
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Expense Date <span className="required-star">*</span></label>
                        <input
                          type="date"
                          className="input-field"
                          required
                          value={expDate}
                          onChange={(e) => setExpDate(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Recorded By <span className="required-star">*</span></label>
                        <input
                          className="input-field"
                          required
                          value={expRecordedBy}
                          onChange={(e) => setExpRecordedBy(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notes / Voucher Details</label>
                      <input
                        className="input-field"
                        value={expNotes}
                        onChange={(e) => setExpNotes(e.target.value)}
                        placeholder="e.g. Receipt filed in Shop Accounting Folder B"
                      />
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowExpModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingExp ? "💾 Save Changes" : "📉 Log Expense"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EXPENSE DETAIL INSPECTION MODAL */}
          {selectedExpDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedExpDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 600 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Expense Record — {selectedExpDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedExpDetail(null)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  {selectedExpDetail.recordMode === "TEST" && (
                    <div style={{ background: "#fffbebf5", border: "1px solid #fde68a", padding: 12, borderRadius: 10, fontSize: 12, color: "#92400e" }}>
                      <strong>⚠️ TEST RECORD ONLY:</strong> Strictly excluded from actual financial total calculations.
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Expense Category</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedExpDetail.category}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Amount</span>
                      <strong style={{ display: "block", color: "#dc2626", fontSize: 16 }}>₱{selectedExpDetail.amount.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Payee / Vendor</span><strong>{selectedExpDetail.paidTo}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Date</span><strong>{selectedExpDetail.date}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Linked Job Order</span><strong>⚙️ {selectedExpDetail.linkedJobOrderNo || "General Overhead"}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Linked Case ID</span><strong>📁 {selectedExpDetail.linkedCaseId || "N/A"}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Receipt Ref No.</span><strong>{selectedExpDetail.receiptRefNo || "N/A"}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Recorded By</span><strong>👤 {selectedExpDetail.recordedBy}</strong></div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12.5 }}>
                    <strong>📝 Description:</strong> {selectedExpDetail.description}
                  </div>

                  {selectedExpDetail.notes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                      <strong>📝 Notes:</strong> {selectedExpDetail.notes}
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedExpDetail(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* JOB PROFITABILITY BREAKDOWN MODAL */}
          {showProfitModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowProfitModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 840 }}>
                <div className="rhps-modal-header">
                  <h3>📊 Job-Level Net Profit & Margin Analysis</h3>
                  <button className="rhps-modal-close" onClick={() => setShowProfitModal(false)}>×</button>
                </div>

                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ background: "#f0f9ff", padding: 14, borderRadius: 12, border: "1px solid #e0f2fe", fontSize: 12.5, color: "#0369a1" }}>
                    Real-time net profit and margin breakdown comparing verified customer revenues against linked job expenses for each active Job Order.
                  </div>

                  <div style={{ overflow: "hidden", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    <table className="rhps-table" style={{ margin: 0 }}>
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          <th>Job Order & Customer</th>
                          <th>Service Type</th>
                          <th>Job Invoiced Revenue</th>
                          <th>Linked Job Expenses</th>
                          <th>Net Job Profit</th>
                          <th>Profit Margin</th>
                          <th style={{ textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobOrders.map((jo) => {
                          // Revenue for this Job Order (Invoices or Verified Payments)
                          const jobRevenue = invoices
                            .filter((inv) => inv.linkedJobOrderNo === jo.id && inv.recordMode === "ACTUAL")
                            .reduce((sum, inv) => {
                              const invoiceTotal = typeof inv.grandTotal === "number" ? inv.grandTotal : 0;
                              return sum + invoiceTotal;
                            }, 0) || (jo.cost || 0);

                          // Expenses linked to this Job Order
                          const jobExpenses = expenses
                            .filter((e) => e.linkedJobOrderNo === jo.id && e.recordMode === "ACTUAL")
                            .reduce((sum, e) => sum + e.amount, 0);

                          const netJobProfit = jobRevenue - jobExpenses;
                          const profitMargin = jobRevenue > 0 ? (netJobProfit / jobRevenue) * 100 : 0;

                          return (
                            <tr key={jo.id}>
                              <td>
                                <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>⚙️ {jo.id}</strong>
                                <div style={{ fontSize: 11, color: "#475569" }}>👤 {jo.customerName}</div>
                              </td>
                              <td style={{ fontSize: 12, color: "#334155" }}>{jo.serviceType}</td>
                              <td>
                                <strong style={{ fontSize: 13, color: "#059669" }}>₱{jobRevenue.toLocaleString()}</strong>
                              </td>
                              <td>
                                <strong style={{ fontSize: 13, color: "#dc2626" }}>₱{jobExpenses.toLocaleString()}</strong>
                              </td>
                              <td>
                                <strong style={{ fontSize: 14, color: netJobProfit >= 0 ? "#166534" : "#991b1b" }}>
                                  ₱{netJobProfit.toLocaleString()}
                                </strong>
                              </td>
                              <td>
                                <span
                                  style={{
                                    background: profitMargin >= 40 ? "#dcfce7" : profitMargin >= 15 ? "#e0f2fe" : "#fee2e2",
                                    color: profitMargin >= 40 ? "#15803d" : profitMargin >= 15 ? "#0369a1" : "#b91c1c",
                                    padding: "2px 8px",
                                    borderRadius: 99,
                                    fontSize: 11,
                                    fontWeight: 900,
                                  }}
                                >
                                  {profitMargin.toFixed(1)}%
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "3px 8px", background: "#f0f9ff", color: "#0369a1", border: "1px solid #7dd3fc" }}
                                  onClick={() => {
                                    setShowProfitModal(false);
                                    openCreateExpenseModal(jo.id, jo.caseId);
                                  }}
                                >
                                  ＋ Log Expense
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setShowProfitModal(false)}>Close Analysis</button>
                </div>
              </div>
            </div>
          )}
          {/* ADD / EDIT REPAIR MODAL */}
          {showRepairModal && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowRepairModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 700 }}>
                <div className="rhps-modal-header">
                  <h3>{editingRepair ? `✏️ Edit Repair — ${editingRepair.id}` : "🔧 Log New Shop Repair"}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowRepairModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveRepairSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 16 }}>
                    {/* CUSTOMER & PIANO */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Customer Name <span className="required-star">*</span></label>
                        <input className="input-field" required value={repCustomerName} onChange={(e) => setRepCustomerName(e.target.value)} placeholder="e.g. San Pedro Cathedral Academy" />
                      </div>
                      <div className="form-group">
                        <label>Contact Number <span className="required-star">*</span></label>
                        <input className="input-field" required value={repContactNumber} onChange={(e) => setRepContactNumber(e.target.value)} placeholder="e.g. 082-228-5101" />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Piano Brand & Model <span className="required-star">*</span></label>
                        <input className="input-field" required value={repPianoModel} onChange={(e) => setRepPianoModel(e.target.value)} placeholder="e.g. Kawai K-300 Upright" />
                      </div>
                      <div className="form-group">
                        <label>Piano Serial Number <span className="required-star">*</span></label>
                        <input className="input-field" required value={repPianoSerialNo} onChange={(e) => setRepPianoSerialNo(e.target.value)} placeholder="e.g. KW-581920" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Issue Description <span className="required-star">*</span></label>
                      <input className="input-field" required value={repIssueDescription} onChange={(e) => setRepIssueDescription(e.target.value)} placeholder="e.g. Keybed regulation & damper felt replacement required" />
                    </div>

                    {/* STAGE, DATES, COST */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Current Stage <span className="required-star">*</span></label>
                        <select className="input-field" value={repStage} onChange={(e) => setRepStage(e.target.value as RepairStage)}>
                          <option value="Intake & Inspection">Intake & Inspection</option>
                          <option value="Parts Ordering">Parts Ordering</option>
                          <option value="In Repair">In Repair</option>
                          <option value="Testing & Tuning">Testing & Tuning</option>
                          <option value="Ready for Delivery">Ready for Delivery</option>
                          <option value="Delivered & Closed">Delivered & Closed</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Intake Date <span className="required-star">*</span></label>
                        <input type="date" className="input-field" required value={repIntakeDate} onChange={(e) => setRepIntakeDate(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Est. Completion Date <span className="required-star">*</span></label>
                        <input type="date" className="input-field" required value={repEstimatedCompletion} onChange={(e) => setRepEstimatedCompletion(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>➡️ Next Action / Task</label>
                      <input className="input-field" value={repNextAction} onChange={(e) => setRepNextAction(e.target.value)} placeholder="e.g. Complete damper felt gluing, final regulation pass" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Assigned Technician <span className="required-star">*</span></label>
                        <input className="input-field" required value={repAssignedTechnician} onChange={(e) => setRepAssignedTechnician(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Linked Job Order No.</label>
                        <input className="input-field" value={repLinkedJobOrderNo} onChange={(e) => setRepLinkedJobOrderNo(e.target.value)} placeholder="e.g. JO-2026-003" />
                      </div>
                      <div className="form-group">
                        <label>Linked Case ID</label>
                        <input className="input-field" value={repLinkedCaseId} onChange={(e) => setRepLinkedCaseId(e.target.value)} placeholder="e.g. CASE-2026-003" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Estimated Repair Cost (₱)</label>
                        <input type="number" className="input-field" value={repRepairCost} onChange={(e) => setRepRepairCost(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="form-group">
                        <label>Technician Notes / Progress</label>
                        <input className="input-field" value={repNotes} onChange={(e) => setRepNotes(e.target.value)} placeholder="e.g. Keybed leveling done. Damper rail replacement in progress." />
                      </div>
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowRepairModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0f172a", color: "#ffffff", padding: "10px 22px", borderRadius: 10, fontWeight: 700, border: "none" }}>
                      {editingRepair ? "💾 Save Changes" : "🔧 Log Repair"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* RECORD DOWNPAYMENT MODAL */}
          {showRecordDownpaymentModal && downpaymentTargetRepair && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowRecordDownpaymentModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 520 }}>
                <div className="rhps-modal-header">
                  <h3>💳 Record Downpayment / Deposit — {downpaymentTargetRepair.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowRecordDownpaymentModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveDownpaymentSubmit}>
                  <div className="rhps-modal-body" style={{ gap: 14 }}>
                    <div style={{ background: "#f0f9ff", padding: 14, borderRadius: 12, border: "1px solid #bae6fd", fontSize: 13 }}>
                      <strong>🎹 {downpaymentTargetRepair.pianoModel}</strong> ({downpaymentTargetRepair.customerName})
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
                        <span>Quoted Cost: <strong>₱{(downpaymentTargetRepair.repairCost || 0).toLocaleString()}</strong></span>
                        <span>Paid So Far: <strong>₱{(downpaymentTargetRepair.downpaymentPaid || 0).toLocaleString()}</strong></span>
                        <span>Remaining Balance: <strong style={{ color: "#c2410c" }}>₱{Math.max(0, (downpaymentTargetRepair.repairCost || 0) - (downpaymentTargetRepair.downpaymentPaid || 0)).toLocaleString()}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="form-group">
                        <label>Downpayment Received (₱) <span className="required-star">*</span></label>
                        <input
                          type="number"
                          className="input-field"
                          style={{ fontSize: 16, fontWeight: 900, color: "#15803d" }}
                          required
                          value={downpaymentAmountInput}
                          onChange={(e) => setDownpaymentAmountInput(parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Payment Method <span className="required-star">*</span></label>
                        <select
                          className="input-field"
                          value={downpaymentMethodInput}
                          onChange={(e) => setDownpaymentMethodInput(e.target.value as PaymentMethod)}
                        >
                          <option value="GCash">GCash</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Check">Check</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Reference No. / OR Slip No. <span className="required-star">*</span></label>
                      <input
                        className="input-field"
                        required
                        value={downpaymentRefNoInput}
                        onChange={(e) => setDownpaymentRefNoInput(e.target.value)}
                        placeholder="e.g. GCASH-9918203 or OR-881920"
                      />
                    </div>

                    <div style={{ background: "#dcfce7", padding: 10, borderRadius: 8, border: "1px solid #86efac", fontSize: 11.5, color: "#15803d" }}>
                      <strong>💡 AUTOMATIC REVENUE LINKING:</strong> Submitting this downpayment will automatically generate a verified <strong>Payment Record</strong> in the Financial Module and update customer balance metrics!
                    </div>
                  </div>

                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowRecordDownpaymentModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#15803d", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontWeight: 700, border: "none" }}>
                      💳 Save Downpayment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* UPDATE STAGE & NEXT ACTION MODAL */}
          {showUpdateStageModal && stageTargetRepair && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowUpdateStageModal(false)}>
              <div className="rhps-modal" style={{ maxWidth: 500 }}>
                <div className="rhps-modal-header">
                  <h3>🔄 Update Stage — {stageTargetRepair.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setShowUpdateStageModal(false)}>×</button>
                </div>
                <form onSubmit={handleSaveUpdateStage}>
                  <div className="rhps-modal-body" style={{ gap: 14 }}>
                    <div style={{ background: "#f0f9ff", padding: 12, borderRadius: 10, border: "1px solid #e0f2fe", fontSize: 12.5 }}>
                      <strong>🎹 {stageTargetRepair.pianoModel}</strong> — {stageTargetRepair.customerName}
                    </div>
                    <div className="form-group">
                      <label>New Stage <span className="required-star">*</span></label>
                      <select className="input-field" style={{ fontWeight: 800 }} value={newStageInput} onChange={(e) => setNewStageInput(e.target.value as RepairStage)}>
                        <option value="Intake & Inspection">Intake & Inspection</option>
                        <option value="Parts Ordering">Parts Ordering</option>
                        <option value="In Repair">In Repair</option>
                        <option value="Testing & Tuning">Testing & Tuning</option>
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Delivered & Closed">Delivered & Closed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>➡️ Set Next Action / Task <span className="required-star">*</span></label>
                      <input
                        className="input-field"
                        required
                        value={nextActionInput}
                        onChange={(e) => setNextActionInput(e.target.value)}
                        placeholder="e.g. Order Renner hammer felts from supplier, ETA 5 days"
                      />
                    </div>
                  </div>
                  <div className="rhps-modal-footer">
                    <button type="button" className="secondary-sm" onClick={() => setShowUpdateStageModal(false)}>Cancel</button>
                    <button type="submit" className="primary" style={{ background: "#0369a1", color: "#ffffff", padding: "8px 18px", borderRadius: 8, fontWeight: 700, border: "none" }}>
                      🔄 Update Stage & Next Action
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* REPAIR DETAIL INSPECTION MODAL */}
          {selectedRepairDetail && (
            <div className="rhps-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelectedRepairDetail(null)}>
              <div className="rhps-modal" style={{ maxWidth: 640 }}>
                <div className="rhps-modal-header">
                  <h3>🔍 Repair Record — {selectedRepairDetail.id}</h3>
                  <button className="rhps-modal-close" onClick={() => setSelectedRepairDetail(null)}>×</button>
                </div>
                <div className="rhps-modal-body" style={{ gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Customer</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>{selectedRepairDetail.customerName}</strong>
                      <span style={{ fontSize: 11, color: "#475569" }}>📞 {selectedRepairDetail.contactNumber}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Stage</span>
                      <strong style={{ display: "block", color: "#c2410c", fontSize: 14 }}>{selectedRepairDetail.stage}</strong>
                    </div>
                  </div>

                  <div style={{ background: "#fff7ed", padding: 12, borderRadius: 10, border: "1px solid #ffedd5" }}>
                    <strong style={{ color: "#c2410c" }}>🎹 Piano:</strong> {selectedRepairDetail.pianoModel} <span style={{ color: "#64748b", fontSize: 12 }}>(S/N: {selectedRepairDetail.pianoSerialNo})</span>
                    <div style={{ fontSize: 12.5, marginTop: 4, color: "#334155" }}>{selectedRepairDetail.issueDescription}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Intake Date</span><strong>{selectedRepairDetail.intakeDate}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Est. Completion</span><strong>{selectedRepairDetail.estimatedCompletion}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Assigned Technician</span><strong>👤 {selectedRepairDetail.assignedTechnician}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Repair Cost</span><strong style={{ color: "#dc2626" }}>₱{(selectedRepairDetail.repairCost || 0).toLocaleString()}</strong></div>
                    {selectedRepairDetail.linkedJobOrderNo && <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Job Order</span><strong>⚙️ {selectedRepairDetail.linkedJobOrderNo}</strong></div>}
                    {selectedRepairDetail.linkedCaseId && <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Case ID</span><strong>📁 {selectedRepairDetail.linkedCaseId}</strong></div>}
                    {selectedRepairDetail.convertedToServiceReportId && <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Converted SR</span><strong style={{ color: "#059669" }}>📋 {selectedRepairDetail.convertedToServiceReportId}</strong></div>}
                  </div>

                  {selectedRepairDetail.nextAction && (
                    <div style={{ background: "#fefce8", padding: 10, borderRadius: 8, border: "1px solid #fde047", fontSize: 12.5, color: "#713f12" }}>
                      <strong>➡️ Next Action:</strong> {selectedRepairDetail.nextAction}
                    </div>
                  )}

                  {selectedRepairDetail.repairNotes && (
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                      <strong>📝 Technician Notes:</strong> {selectedRepairDetail.repairNotes}
                    </div>
                  )}
                </div>

                <div className="rhps-modal-footer">
                  <button className="secondary-sm" onClick={() => setSelectedRepairDetail(null)}>Close</button>
                  <button
                    className="secondary-sm"
                    style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc" }}
                    onClick={() => { setSelectedRepairDetail(null); handleOpenUpdateStage(selectedRepairDetail); }}
                  >
                    🔄 Update Stage
                  </button>
                  {selectedRepairDetail.stage !== "Delivered & Closed" && !selectedRepairDetail.convertedToServiceReportId && (
                    <button
                      className="primary"
                      style={{ background: "#15803d", color: "#ffffff", padding: "8px 16px", borderRadius: 8, fontWeight: 700, border: "none" }}
                      onClick={() => {
                        const rep = selectedRepairDetail;
                        setSelectedRepairDetail(null);
                        if (confirm(`Convert ${rep.id} to a Service Report?`)) {
                          handleConvertRepairToServiceReport(rep);
                        }
                      }}
                    >
                      📋 Convert to Service Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── RHPS MASTER AI FLOATING CENTER BUBBLE MODAL ─────────────────── */}
        {isAiBubbleModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              padding: "16px",
              boxSizing: "border-box",
            }}
            onClick={() => setIsAiBubbleModalOpen(false)}
          >
            <style>{`
              @keyframes popInBubble {
                0% {
                  opacity: 0;
                  transform: scale(0.85) translateY(20px);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
              .rhps-ai-bubble-modal input::placeholder {
                color: #94a3b8 !important;
              }
            `}</style>
            <div
              className="rhps-ai-bubble-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(92vw, 760px)",
                height: "min(88vh, 680px)",
                background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
                borderRadius: "24px",
                border: "1.5px solid rgba(56, 189, 248, 0.4)",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 40px rgba(56, 189, 248, 0.25)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
                animation: "popInBubble 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              {/* HEADER BAR */}
              <div
                style={{
                  padding: "16px 22px",
                  background: "rgba(15, 23, 42, 0.9)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #38bdf8, #0284c7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      boxShadow: "0 0 16px rgba(56, 189, 248, 0.6)",
                    }}
                  >
                    🤖
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#f8fafc", display: "flex", alignItems: "center", gap: 8 }}>
                      RHPS Master AI
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: "#166534",
                          color: "#4ade80",
                          padding: "2px 8px",
                          borderRadius: 99,
                          border: "1px solid #22c55e",
                        }}
                      >
                        ● Active
                      </span>
                    </h3>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                      Private AI Assistant for Davao & Mindanao Piano Operations
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiBubbleModalOpen(false);
                      setActiveTab("ai_assistant");
                      showToast("↗ Expanded RHPS Master AI to Full Tab!");
                    }}
                    title="Expand to Full Tab View"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "#38bdf8",
                      border: "1px solid rgba(56, 189, 248, 0.35)",
                      padding: "6px 12px",
                      borderRadius: "10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ↗ Full Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAiBubbleModalOpen(false)}
                    title="Close Chatbot Bubble"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "#94a3b8",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      width: 32,
                      height: 32,
                      borderRadius: "10px",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* QUICK PRESETS ROW */}
              <div
                style={{
                  padding: "10px 18px",
                  background: "rgba(30, 41, 59, 0.5)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                }}
              >
                <button
                  onClick={() => sendAiMessage("Draft a professional repair quotation scope for a Yamaha U3 upright piano needing A440 tuning and action regulation in Davao.")}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    padding: "6px 12px",
                    borderRadius: "99px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  📋 Service Quotation
                </button>
                <button
                  onClick={() => sendAiMessage("Draft a friendly 6-month piano tuning SMS reminder for client Atty. Fernando Alonso.")}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    padding: "6px 12px",
                    borderRadius: "99px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  📲 6-Month Tuning SMS
                </button>
                <button
                  onClick={() => sendAiMessage("How do I fix sticky piano keys and sluggish hammer return caused by Davao's high humidity?")}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    padding: "6px 12px",
                    borderRadius: "99px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  🔧 Technical Fault Guide
                </button>
                <button
                  onClick={() => sendAiMessage("Summarize my current active piano service job orders, verified revenue, and pending reminders.")}
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "#e2e8f0",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    padding: "6px 12px",
                    borderRadius: "99px",
                    fontSize: 11.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  📊 Business Summary
                </button>
              </div>

              {/* MESSAGES FEED */}
              <div
                ref={modalChatBoxRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  scrollBehavior: "smooth",
                  background: "#0b1329",
                }}
              >
                {aiMessages.map((msg, index) => {
                  const isLastAssistant = msg.role === "assistant" && index === aiMessages.length - 1;
                  const chips = isLastAssistant ? getSmartChips(msg.content) : [];
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 800, color: msg.role === "user" ? "#38bdf8" : "#38bdf8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {msg.role === "user" ? "🙋 You" : "🤖 RHPS Master AI"}
                      </span>
                      <div
                        style={{
                          maxWidth: "88%",
                          background: msg.role === "user" ? "linear-gradient(135deg, #0284c7, #0369a1)" : "#1e293b",
                          color: "#ffffff",
                          border: msg.role === "user" ? "none" : "1.5px solid rgba(56, 189, 248, 0.25)",
                          borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                          padding: "14px 20px",
                          fontSize: 13.5,
                          lineHeight: 1.65,
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {msg.role === "user" ? (
                          <span style={{ whiteSpace: "pre-wrap", color: "#ffffff", fontWeight: 500 }}>{msg.content}</span>
                        ) : (
                          renderRhpsAiMarkdown(msg.content, true)
                        )}
                      </div>

                      {/* Actions under assistant messages */}
                      {msg.role === "assistant" && index > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          <button
                            style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              showToast("📋 Copied to clipboard!");
                            }}
                          >
                            📋 Copy
                          </button>
                          <button
                            style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 6, background: "#1e3a8a", color: "#93c5fd", border: "1px solid #3b82f6", cursor: "pointer" }}
                            onClick={() => {
                              setIsAiBubbleModalOpen(false);
                              setActiveTab("quotations");
                              showToast("📋 Switched to Quotations tab!");
                            }}
                          >
                            📋 → Quotation
                          </button>
                          <button
                            style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 6, background: "#14532d", color: "#86efac", border: "1px solid #22c55e", cursor: "pointer" }}
                            onClick={() => {
                              setIsAiBubbleModalOpen(false);
                              setActiveTab("follow_ups");
                              showToast("📲 Switched to Follow-Ups tab!");
                            }}
                          >
                            📲 → Follow-Up
                          </button>
                        </div>
                      )}

                      {isLastAssistant && chips.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          {chips.map((chip) => (
                            <button
                              key={chip}
                              onClick={() => sendAiMessage(chip)}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "5px 12px",
                                borderRadius: 99,
                                border: "1px solid rgba(56, 189, 248, 0.35)",
                                background: "rgba(15, 23, 42, 0.9)",
                                color: "#38bdf8",
                                cursor: "pointer",
                              }}
                            >
                              ✨ {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {aiLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#38bdf8", fontSize: 13, fontStyle: "italic", padding: 12 }}>
                    <span style={{ fontSize: 18, animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span>
                    RHPS Master AI is thinking...
                  </div>
                )}
              </div>

              {/* INPUT FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendAiMessage();
                }}
                style={{
                  padding: "14px 20px",
                  background: "rgba(15, 23, 42, 0.95)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={startVoiceInput}
                  title="Voice Input"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: isListening ? "2px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.15)",
                    background: isListening ? "#7f1d1d" : "rgba(255, 255, 255, 0.06)",
                    color: "#ffffff",
                    fontSize: 18,
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isListening ? "🔴" : "🎤"}
                </button>

                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={isListening ? "Listening... speak now 🎤" : "Ask RHPS Master AI anything..."}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(56, 189, 248, 0.3)",
                    background: "rgba(30, 41, 59, 0.8)",
                    color: "#f8fafc",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />

                <button
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: aiLoading ? "wait" : "pointer",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)",
                  }}
                >
                  {aiLoading ? "⚙️" : "Send ➔"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
