"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

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
  customerType: "New" | "Repeat";
  linkedPianoIds: string[];
  createdDate: string;
  lastUpdatedDate: string;
  email?: string;
  facebookName?: string;
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

export type Expense = {
  id: string;
  category: "Parts" | "Transport / Fuel" | "Tools" | "Utilities" | "Marketing" | "Other";
  description: string;
  amount: number;
  paidTo: string;
  date: string;
  recordMode: RecordMode;
};

export type FollowUp = {
  id: string;
  caseId: string;
  customerName: string;
  pianoDetails: string;
  followUpType: "Routine Check-In" | "Next Service Reminder" | "Warranty Comeback" | "Other";
  targetDate: string;
  assignedTo: string;
  status: "Pending" | "Done" | "Rescheduled" | "Closed";
  recordMode: RecordMode;
  notes?: string;
  lastTuningDate?: string;
};

export type RepairRecord = {
  id: string;
  customerName: string;
  pianoModel: string;
  issueDescription: string;
  estimatedCompletion: string;
  status: "Inspection" | "Parts Ordering" | "In Repair" | "Testing & Tuning" | "Ready for Delivery";
  recordMode: RecordMode;
};

export type TradeInSale = {
  id: string;
  customerName: string;
  offeredPiano: string;
  valuation: number;
  status: "In Valuation" | "Approved Trade-In" | "Sold Direct" | "Completed" | "Cancelled";
  recordMode: RecordMode;
};

export type InventoryUnit = {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  condition: "Refurbished" | "Pre-Owned Excellent" | "Brand New" | "As Is";
  price: number;
  status: "In Stock" | "Reserved" | "Sold" | "Under Repair";
  recordMode: RecordMode;
};

export type RHPSDocument = {
  id: string;
  title: string;
  category?: string;
  documentType: "Estimate" | "Quotation" | "Job Order" | "Service Report" | "Invoice" | "Payment Acknowledgment";
  recordType: RecordMode;
  linkedSourceRecordNo: string;
  linkedCaseId: string;
  dateGenerated: string;
  generatedBy: string;
  generatingModule: "Customer Desk" | "Service & Quotations" | "Office & Records";
  documentOwnershipRole: string;
  status: "Generated" | "Sent" | "Archived";
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
  { id: "LEAD-001", createdDate: "2026-08-01", source: "Website", customerName: "Maria Santos", contactNumber: "0918-123-4567", locationCity: "Bajada, Davao City", inquiryType: "Tuning", pianoType: "Grand (Steinway Model M)", mainConcern: "Full tuning and pitch raise A440", preferredSchedule: "Mornings", status: "Converted to Estimate", nextAction: "Send formal Estimate", assignedOwner: "Robert Herrero", recordMode: "ACTUAL" },
  { id: "LEAD-002", createdDate: "2026-08-03", source: "Referral", customerName: "Davao Concert Hall", contactNumber: "0920-987-6543", locationCity: "Davao City", inquiryType: "Assessment", pianoType: "Concert Grand", mainConcern: "Concert grand tuning & hammer voicing", preferredSchedule: "Weekends", status: "New Lead", nextAction: "Schedule On-Site Visit", assignedOwner: "Robert Herrero", recordMode: "ACTUAL" },
  { id: "LEAD-003", createdDate: "2026-08-03", source: "Walk-In", customerName: "Dr. Gabriel Cruz", contactNumber: "0917-888-1234", locationCity: "Matina, Davao City", inquiryType: "Repair", pianoType: "Kawai Upright", mainConcern: "Sticky key regulation & pedal alignment", preferredSchedule: "Afternoons", status: "Qualified", nextAction: "Send Estimate", assignedOwner: "Robert Herrero", recordMode: "ACTUAL" },
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
  { id: "EXP-2026-01", category: "Parts", description: "Renner Hammer Felts Import Batch #4", amount: 12400, paidTo: "PianoParts Asia", date: "2026-08-01", recordMode: "ACTUAL" },
];

const demoFollowUps: FollowUp[] = [
  { id: "FOL-2026-01", caseId: "CASE-2026-001", customerName: "Atty. Fernando Alonso", pianoDetails: "Yamaha U3 S/N: YM-582910", followUpType: "Next Service Reminder", targetDate: "2026-08-04", assignedTo: "Robert Herrero", status: "Pending", recordMode: "ACTUAL", notes: "6-month post-regulation tuning check-in due today!", lastTuningDate: "2026-02-01" },
];

const demoRepairs: RepairRecord[] = [
  { id: "REP-2026-01", customerName: "San Pedro Cathedral Academy", pianoModel: "Kawai K-300", issueDescription: "Keybed regulation & damper felt replacement", estimatedCompletion: "2026-08-10", status: "In Repair", recordMode: "ACTUAL" },
];

const demoTradeIns: TradeInSale[] = [
  { id: "TRD-2026-01", customerName: "Dr. Gabriel Cruz", offeredPiano: "Kawai K-15 Upright", valuation: 85000, status: "In Valuation", recordMode: "ACTUAL" },
];

const demoInventory: InventoryUnit[] = [
  { id: "RHPS-INV-001", brand: "Yamaha", model: "U1 Professional Upright", serialNumber: "YM-491028", condition: "Refurbished", price: 165000, status: "In Stock", recordMode: "ACTUAL" },
  { id: "RHPS-INV-002", brand: "Kawai", model: "KG-2 Grand Piano 5'10\"", serialNumber: "KW-382910", condition: "Pre-Owned Excellent", price: 285000, status: "In Stock", recordMode: "ACTUAL" },
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

const demoDocuments: RHPSDocument[] = [
  { id: "DOC-2026-01", title: "Signed Service Report - JO-2026-001", category: "Service Report", documentType: "Service Report", linkedSourceRecordNo: "SR-2026-001", linkedCaseId: "CASE-2026-001", dateGenerated: "2026-08-03", generatedBy: "Robert Herrero", generatingModule: "Office & Records", documentOwnershipRole: "Owner", status: "Generated", recordType: "ACTUAL" },
];

// --- RHPS AI MARKDOWN & TABLE RENDERER ---
function renderRhpsAiMarkdown(content: string) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return <strong key={idx} style={{ fontWeight: 700, color: "#0f172a" }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return <em key={idx} style={{ fontStyle: "italic", color: "#475569" }}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return <code key={idx} style={{ background: "#f1f5f9", color: "#0f172a", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 12 }}>{part.slice(1, -1)}</code>;
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
      blocks.push(<h3 key={`h3-${i}`} style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "14px 0 8px" }}>{formatInline(trimmed.replace(/^###\s+/, ""))}</h3>);
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(<h2 key={`h2-${i}`} style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "16px 0 10px", borderBottom: "2px solid #e2e8f0", paddingBottom: 6 }}>{formatInline(trimmed.replace(/^##\s+/, ""))}</h2>);
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(<h1 key={`h1-${i}`} style={{ fontSize: 19, fontWeight: 900, color: "#0f172a", margin: "18px 0 12px", borderBottom: "2px solid #cbd5e1", paddingBottom: 8 }}>{formatInline(trimmed.replace(/^#\s+/, ""))}</h1>);
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote key={`bq-${i}`} style={{ borderLeft: "3px solid #0f172a", paddingLeft: 14, margin: "10px 0", color: "#475569", fontStyle: "italic", background: "#ffffff", padding: "10px 14px", borderRadius: "0 8px 8px 0", border: "1px solid #e2e8f0", borderLeftWidth: 4, borderLeftColor: "#0f172a" }}>
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
        <ul key={`ul-${i}`} style={{ paddingLeft: 20, margin: "8px 0 12px", listStyleType: "disc" }}>
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} style={{ marginBottom: 4, color: "#334155", lineHeight: 1.65 }}>
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
        <ol key={`ol-${i}`} style={{ paddingLeft: 20, margin: "8px 0 12px" }}>
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} style={{ marginBottom: 4, color: "#334155", lineHeight: 1.65 }}>
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
        <p key={`p-${i}`} style={{ margin: "0 0 8px", lineHeight: 1.75, color: "#334155" }}>
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
}: {
  activeUser?: string;
  onLockWorkspace?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
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
  const [customerFilter, setCustomerFilter] = useState<"All" | "New" | "Repeat">("All");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);

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

  // Customer Modal Form State
  const [custName, setCustName] = useState<string>("");
  const [custContact, setCustContact] = useState<string>("");
  const [custAltContact, setCustAltContact] = useState<string>("");
  const [custAddress, setCustAddress] = useState<string>("");
  const [custType, setCustType] = useState<"New" | "Repeat">("New");
  const [custEmail, setCustEmail] = useState<string>("");
  const [custFbName, setCustFbName] = useState<string>("");
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
    } catch {}
    return [WELCOME_MSG];
  };

  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(loadHistory);

  // Auto-save to localStorage whenever messages change
  useEffect(() => {
    try {
      // Keep last 60 messages
      const trimmed = aiMessages.slice(-60);
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {}
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

    if (editingCustomer) {
      const updated = customers.map((c) => {
        if (c.id === editingCustomer.id) {
          return {
            ...c,
            name: custName,
            contactNumber: custContact,
            alternateContactNumber: custAltContact,
            completeAddress: custAddress,
            customerType: custType,
            email: custEmail,
            facebookName: custFbName,
            cityArea: custCityArea,
            landmark: custLandmark,
            notes: custNotes,
            lastUpdatedDate: formattedDate,
          };
        }
        return c;
      });
      setCustomers(updated);
      showToast(`👤 Customer ${editingCustomer.id} (${custName}) updated successfully!`);
    } else {
      const nextNum = customers.length + 1;
      const newId = `CUST-${String(nextNum).padStart(3, "0")}`;
      const newRecord: Customer = {
        id: newId,
        name: custName,
        contactNumber: custContact,
        alternateContactNumber: custAltContact,
        completeAddress: custAddress,
        customerType: custType,
        linkedPianoIds: [],
        createdDate: formattedDate,
        lastUpdatedDate: formattedDate,
        email: custEmail,
        facebookName: custFbName,
        cityArea: custCityArea,
        landmark: custLandmark,
        notes: custNotes,
        pianos: [],
      };
      setCustomers([newRecord, ...customers]);
      showToast(`🎉 New Customer ${newId} (${custName}) registered successfully!`);
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

        <div className="rhps-safeguard-bar">
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

          {/* 1. DASHBOARD - GRAPH-FREE OPERATIONS MONITORING WITH 4 CONTROLS */}
          {activeTab === "dashboard" && (
            <div className="rhps-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h2>Dashboard & Owner Operations Monitoring</h2>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Clean operational queue for open service items, follow-ups, and instant resolution.
                  </p>
                </div>

                {/* THE 4 REQUIRED ACTION CONTROLS / FILTERS */}
                <div style={{ display: "flex", gap: 8, background: "#e1e2e4", padding: 5, borderRadius: 12 }}>
                  {(["Open", "View All", "Resolve", "Follow Up"] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      type="button"
                      style={{
                        padding: "8px 18px",
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 800,
                        border: "none",
                        cursor: "pointer",
                        background: dashboardFilter === filterOpt ? "#0f172a" : "transparent",
                        color: dashboardFilter === filterOpt ? "#ffffff" : "#475569",
                        transition: "all 0.15s ease",
                      }}
                      onClick={() => setDashboardFilter(filterOpt)}
                    >
                      {filterOpt === "Open" && "📂 Open"}
                      {filterOpt === "View All" && "👁 View All"}
                      {filterOpt === "Resolve" && "✅ Resolve"}
                      {filterOpt === "Follow Up" && "↗ Follow Up"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CLEAN GRAPH-FREE METRIC CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div className="purely-card-white" style={{ padding: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Open Service Operations</span>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "6px 0" }}>
                    {jobOrders.filter((j) => j.status !== "Completed" && j.status !== "Cancelled").length} Active Jobs
                  </div>
                  <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>⚙️ In Field / Service Workshop</span>
                </div>

                <div className="purely-card-white" style={{ padding: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Follow-Ups</span>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#d97706", margin: "6px 0" }}>
                    {followUps.filter((f) => f.status === "Pending").length} Reminders
                  </div>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>📲 6-Month Tuning Check-Ins</span>
                </div>

                <div className="purely-card-white" style={{ padding: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actual Verified Revenue</span>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#059669", margin: "6px 0" }}>₱18,500</div>
                  <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>🟢 Verified Collections YTD</span>
                </div>

                <div className="purely-card-white" style={{ padding: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Net Operating Profit</span>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "6px 0" }}>₱6,100</div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>After parts & fuel expenses</span>
                </div>
              </div>

              {/* OPERATIONS QUEUE TABLE FILTERED BY THE 4 CONTROLS */}
              <div className="purely-card-white" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", background: "#e1e2e4", borderBottom: "1px solid #d2d5d8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>
                    📋 Operations Priority Queue — Filtered by: <span style={{ color: "#2563eb" }}>{dashboardFilter}</span>
                  </strong>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                    Click 'Resolve' to complete items or 'Follow Up' to send client SMS
                  </span>
                </div>

                <table className="rhps-table" style={{ margin: 0, borderRadius: 0, border: "none" }}>
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Category / Module</th>
                      <th>Customer & Piano Instrument</th>
                      <th>Scope / Main Concern</th>
                      <th>Target Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Quick Operations Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* JOB ORDERS */}
                    {jobOrders
                      .filter((j) => {
                        if (dashboardFilter === "Open") return j.status !== "Completed" && j.status !== "Cancelled";
                        if (dashboardFilter === "Resolve") return j.status === "Assigned" || j.status === "In Progress";
                        if (dashboardFilter === "Follow Up") return j.status === "Additional Finding Pending";
                        return true;
                      })
                      .map((j) => (
                        <tr key={j.id}>
                          <td><strong>{j.id}</strong></td>
                          <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Job Order</span></td>
                          <td>
                            <strong>{j.customerName}</strong>
                            <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>{j.pianoDetails}</span>
                          </td>
                          <td>{j.approvedScope}</td>
                          <td>{j.serviceDate}</td>
                          <td>
                            <span
                              style={{
                                background: j.status === "Completed" ? "#dcfce7" : j.status === "In Progress" ? "#fef3c7" : "#e0f2fe",
                                color: j.status === "Completed" ? "#15803d" : j.status === "In Progress" ? "#92400e" : "#0369a1",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {j.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 10px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 800 }}
                                onClick={() => {
                                  setJobOrders(jobOrders.map((item) => item.id === j.id ? { ...item, status: "Completed" } : item));
                                  showToast(`✅ Job Order ${j.id} marked as RESOLVED & Completed!`);
                                }}
                              >
                                ✓ Resolve
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", fontWeight: 800 }}
                                onClick={() => showToast(`📲 SMS Follow-Up sent to ${j.customerName} for ${j.id}!`)}
                              >
                                ↗ Follow Up
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {/* FOLLOW UPS */}
                    {followUps
                      .filter((f) => {
                        if (dashboardFilter === "Open") return f.status === "Pending";
                        if (dashboardFilter === "Resolve") return f.status === "Pending";
                        if (dashboardFilter === "Follow Up") return f.status === "Pending";
                        return true;
                      })
                      .map((f) => (
                        <tr key={f.id}>
                          <td><strong>{f.id}</strong></td>
                          <td><span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Follow-Up</span></td>
                          <td>
                            <strong>{f.customerName}</strong>
                            <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>{f.pianoDetails}</span>
                          </td>
                          <td>{f.notes || f.followUpType}</td>
                          <td>{f.targetDate}</td>
                          <td>
                            <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                              {f.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 10px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 800 }}
                                onClick={() => {
                                  setFollowUps(followUps.map((item) => item.id === f.id ? { ...item, status: "Done" } : item));
                                  showToast(`✅ Follow-Up ${f.id} marked as RESOLVED!`);
                                }}
                              >
                                ✓ Resolve
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", fontWeight: 800 }}
                                onClick={() => showToast(`📲 SMS 6-Month Reminder sent to ${f.customerName}!`)}
                              >
                                ↗ Follow Up
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {/* LEADS */}
                    {leads
                      .filter((l) => {
                        if (dashboardFilter === "Open") return l.status !== "Lost / Closed No Sale";
                        if (dashboardFilter === "Resolve") return l.status === "New Lead" || l.status === "Contacted";
                        if (dashboardFilter === "Follow Up") return l.status === "Qualified" || l.status === "Converted to Estimate";
                        return true;
                      })
                      .map((l) => (
                        <tr key={l.id}>
                          <td><strong>{l.id}</strong></td>
                          <td><span style={{ background: "#f3e8ff", color: "#7e22ce", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>CRM Lead</span></td>
                          <td>
                            <strong>{l.customerName}</strong>
                            <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>{l.contactNumber} • {l.locationCity}</span>
                          </td>
                          <td>{l.mainConcern} ({l.inquiryType})</td>
                          <td>{l.createdDate}</td>
                          <td>
                            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                              {l.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 10px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 800 }}
                                onClick={() => {
                                  setLeads(leads.map((item) => item.id === l.id ? { ...item, status: "Converted to Estimate" } : item));
                                  showToast(`✅ Lead ${l.id} RESOLVED & Converted to Estimate!`);
                                }}
                              >
                                ✓ Resolve
                              </button>
                              <button
                                className="secondary-sm"
                                style={{ fontSize: 11, padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", fontWeight: 800 }}
                                onClick={() => showToast(`📲 Inquiry Follow-Up sent to ${l.customerName}!`)}
                              >
                                ↗ Follow Up
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

          {/* 2. CRM LEADS */}
          {activeTab === "crm_leads" && (
            <div className="rhps-view">
              <h2>CRM Leads</h2>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Customer Name</th>
                    <th>Contact Number</th>
                    <th>Location / City</th>
                    <th>Inquiry Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td><strong>{lead.id}</strong></td>
                      <td>{lead.customerName}</td>
                      <td>{lead.contactNumber}</td>
                      <td>{lead.locationCity}</td>
                      <td>{lead.inquiryType}</td>
                      <td>{lead.status}</td>
                    </tr>
                  ))}
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
                  {(["All", "New", "Repeat"] as const).map((tab) => (
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
                        if (customerFilter === "Repeat" && c.customerType !== "Repeat") return false;
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
                              <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>
                                👤 FB: {c.facebookName}
                              </span>
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
                            {c.landmark && (
                              <div style={{ fontSize: 10.5, color: "#d97706", fontStyle: "italic" }}>📍 {c.landmark}</div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                background: c.customerType === "Repeat" ? "#dbeafe" : "#dcfce7",
                                color: c.customerType === "Repeat" ? "#1e40af" : "#15803d",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {c.customerType}
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

                              {/* ACTION 5: CONVERT TO QUOTATION */}
                              {est.status === "Approved" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "4px 10px", background: "#0f172a", color: "#ffffff", border: "none", fontWeight: 800 }}
                                  onClick={() => handleConvertToQuotation(est)}
                                >
                                  ⚡ Convert to Quotation
                                </button>
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

                              {/* ACTION 5: CONVERT TO CUSTOMER CASE (SAFEGUARD RULE) */}
                              {qt.status === "Approved" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "4px 10px", background: "#0f172a", color: "#ffffff", border: "none", fontWeight: 800 }}
                                  onClick={() => handleConvertToCustomerCase(qt)}
                                >
                                  ⚡ Convert to Customer Case
                                </button>
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
                              {sch.status === "Confirmed" && (
                                <button
                                  className="secondary-sm"
                                  style={{ fontSize: 10.5, padding: "4px 10px", background: "#0f172a", color: "#ffffff", border: "none", fontWeight: 800 }}
                                  onClick={() => handleConvertToJobOrder(sch)}
                                >
                                  ⚡ Convert to Job Order
                                </button>
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

          {/* 11. EXPENSES */}
          {activeTab === "expenses" && (
            <div className="rhps-view">
              <h2>Operating Expenses</h2>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Expense ID</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td><strong>{e.id}</strong></td>
                      <td>{e.category}</td>
                      <td>{e.description}</td>
                      <td>₱{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 12. FOLLOW-UPS */}
          {activeTab === "follow_ups" && (
            <div className="rhps-view">
              <h2>Follow-Ups & Service Reminders</h2>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Follow-Up No</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Target Date</th>
                  </tr>
                </thead>
                <tbody>
                  {followUps.map((f) => (
                    <tr key={f.id}>
                      <td><strong>{f.id}</strong></td>
                      <td>{f.customerName}</td>
                      <td>{f.followUpType}</td>
                      <td>{f.targetDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 13. REPAIRS */}
          {activeTab === "repairs" && (
            <div className="rhps-view">
              <h2>Major Shop Repairs Tracking</h2>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Repair ID</th>
                    <th>Customer Name</th>
                    <th>Piano Model</th>
                    <th>Issue Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.id}</strong></td>
                      <td>{r.customerName}</td>
                      <td>{r.pianoModel}</td>
                      <td>{r.issueDescription}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 14. TRADE-IN / SALES */}
          {activeTab === "trade_in" && (
            <div className="rhps-view">
              <h2>Trade-In & Sales Opportunities</h2>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Opportunity ID</th>
                    <th>Customer Name</th>
                    <th>Offered Piano</th>
                    <th>Valuation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeIns.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.id}</strong></td>
                      <td>{t.customerName}</td>
                      <td>{t.offeredPiano}</td>
                      <td>₱{t.valuation.toLocaleString()}</td>
                      <td>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 15. INVENTORY */}
          {activeTab === "inventory" && (
            <div className="rhps-view">
              <h2>Store Inventory Units</h2>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Inventory ID</th>
                    <th>Brand & Model</th>
                    <th>Serial Number</th>
                    <th>Condition</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((inv) => (
                    <tr key={inv.id}>
                      <td><strong>{inv.id}</strong></td>
                      <td>{inv.brand} {inv.model}</td>
                      <td>{inv.serialNumber}</td>
                      <td>{inv.condition}</td>
                      <td>₱{inv.price.toLocaleString()}</td>
                      <td>{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 16. DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="rhps-view">
              <h2>Documents & Generated Reports</h2>
              <table className="rhps-table">
                <thead>
                  <tr>
                    <th>Doc ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Generated By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td><strong>{d.id}</strong></td>
                      <td>{d.title}</td>
                      <td>{d.documentType}</td>
                      <td>{d.generatedBy}</td>
                      <td>{d.dateGenerated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                        <li><strong>Auto Pre-Restore Snapshot:</strong> A fresh pre-restore snapshot (<code>SNAP-PRE-{new Date().toISOString().slice(0,10).replace(/-/g,"")}-01</code>) will be created automatically before restore.</li>
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
                          onChange={(e) => setCustType(e.target.value as "New" | "Repeat")}
                        >
                          <option value="New">New Customer</option>
                          <option value="Repeat">Repeat Customer (Loyal)</option>
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
                        <label>City / Service Area</label>
                        <input
                          className="input-field"
                          value={custCityArea}
                          onChange={(e) => setCustCityArea(e.target.value)}
                          placeholder="e.g. Davao City Central / Matina"
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
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Facebook Account</span><strong>{selectedCustomerDetail.facebookName || "N/A"}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>City / Area</span><strong>{selectedCustomerDetail.cityArea || "Davao City"}</strong></div>
                    <div><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Landmark</span><strong>{selectedCustomerDetail.landmark || "N/A"}</strong></div>
                    <div style={{ gridColumn: "span 2" }}><span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", display: "block" }}>Complete Address</span><strong>{selectedCustomerDetail.completeAddress}</strong></div>
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
                          {leads.map((l) => (
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
                          {estimates.map((est) => (
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
                          {cases.map((c) => (
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
        </main>
      </div>
    </div>
  );
}
