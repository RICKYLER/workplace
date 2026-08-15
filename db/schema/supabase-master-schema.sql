-- =============================================================================
-- MASTER UNIFIED SUPABASE DATABASE SCHEMA WITH FOREIGN KEY RELATIONSHIPS
-- For both CV Sales Admin OS (Ara Mae Marcillo) & RHPS OS (Robert Herrero's Piano Services)
-- COPY AND PASTE THIS ENTIRE FILE DIRECTLY INTO YOUR SUPABASE SQL EDITOR!
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SECTION A: ARA OS — CV SALES ADMIN OPERATIONS (17 TABLES)
-- =============================================================================

-- 1. CLIENTS TABLE (Lead Intake & Legal Compliance Check)
CREATE TABLE IF NOT EXISTS public.clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'Government',
  contact_person TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  philgeps_itb_no TEXT,
  procurement_entity TEXT,
  abc_amount DOUBLE PRECISION,
  unit_to_be_used TEXT,
  remarks TEXT,
  legal_checked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. UNITS TABLE (Inventory Source of Truth - CS #, VIN #, Engine #)
CREATE TABLE IF NOT EXISTS public.units (
  id SERIAL PRIMARY KEY,
  cs_number TEXT NOT NULL UNIQUE,
  vin_number TEXT,
  engine_number TEXT,
  model_description TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'White',
  location TEXT NOT NULL DEFAULT 'Davao Yard',
  status TEXT NOT NULL DEFAULT 'Available',
  client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL,
  sales_consultant TEXT,
  date_assigned TEXT,
  date_released TEXT,
  dealers_price DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. PROJECTS TABLE (Commercial Vehicle Projects & Units)
CREATE TABLE IF NOT EXISTS public.projects (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  client TEXT NOT NULL,
  model TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  agent TEXT NOT NULL,
  manager TEXT NOT NULL DEFAULT 'Robespierre T. Agir',
  stage INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Active',
  priority TEXT NOT NULL DEFAULT 'Normal',
  target_delivery TEXT,
  next_action TEXT NOT NULL DEFAULT '',
  progress INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. ALLOCATIONS TABLE (Unit Assignment to Client, Sales Agent, & GSM)
CREATE TABLE IF NOT EXISTS public.allocations (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sales_agent TEXT NOT NULL,
  gsm_name TEXT NOT NULL DEFAULT 'Robespierre T. Agir',
  legal_docs_missing BOOLEAN NOT NULL DEFAULT FALSE,
  missing_reason TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. DOCUMENTS TABLE (Legal Compliance, NOA, NTP, PO, Contracts, Notarial, Transmittal)
CREATE TABLE IF NOT EXISTS public.documents (
  id SERIAL PRIMARY KEY,
  doc_name TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  unit_cs_number TEXT REFERENCES public.units(cs_number) ON DELETE SET NULL,
  client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  file_url TEXT,
  notarial_status TEXT DEFAULT 'Not Required',
  transmittal_status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. FOLLOWUPS TABLE (18 Spec Categories: Missing PO, NOA, NTP, Contract, Bank PO, etc.)
CREATE TABLE IF NOT EXISTS public.followups (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  unit_cs_number TEXT REFERENCES public.units(cs_number) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  requirement TEXT NOT NULL,
  action_needed TEXT NOT NULL,
  due_date TEXT NOT NULL,
  contact_person TEXT,
  contact_number TEXT,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. PDI CHECKS TABLE (Pre-delivery Inspection Pipeline & Findings)
CREATE TABLE IF NOT EXISTS public.pdi_checks (
  id SERIAL PRIMARY KEY,
  unit_cs_number TEXT NOT NULL REFERENCES public.units(cs_number) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Not Started',
  findings TEXT,
  remarks TEXT,
  waived_reason TEXT,
  scheduled_date TEXT,
  completed_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. RELEASES TABLE (13-Item Pre-release Checklist & Gate Pass Enforcement Rule)
CREATE TABLE IF NOT EXISTS public.releases (
  id SERIAL PRIMARY KEY,
  unit_cs_number TEXT NOT NULL REFERENCES public.units(cs_number) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  sales_agent TEXT NOT NULL,
  gate_pass_status TEXT NOT NULL DEFAULT 'Missing',
  is_ready BOOLEAN NOT NULL DEFAULT FALSE,
  released_with_pending BOOLEAN NOT NULL DEFAULT FALSE,
  pending_reason TEXT,
  release_status TEXT NOT NULL DEFAULT 'Pending',
  actual_release_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. EXPENSES TABLE (Budget Lifecycle & Unliquidated Balance Formula)
CREATE TABLE IF NOT EXISTS public.expenses (
  id SERIAL PRIMARY KEY,
  unit_cs_number TEXT REFERENCES public.units(cs_number) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  requested_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  approved_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  released_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  liquidated_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  unliquidated_balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Requested',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. COLLECTIONS TABLE (Bank PO 3+ Month Monitoring Pipeline)
CREATE TABLE IF NOT EXISTS public.collections (
  id SERIAL PRIMARY KEY,
  unit_cs_number TEXT REFERENCES public.units(cs_number) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  bank_po_status TEXT NOT NULL DEFAULT 'For Submission',
  expected_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  collected_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  due_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 11. INSURANCE RECORDS TABLE (Policy Expiry Countdown & Company Management)
CREATE TABLE IF NOT EXISTS public.insurance_records (
  id SERIAL PRIMARY KEY,
  unit_cs_number TEXT NOT NULL REFERENCES public.units(cs_number) ON DELETE CASCADE,
  insurance_company TEXT NOT NULL,
  policy_number TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  expiry_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 12. INCENTIVES TABLE (PIN Protected Sales Agent Incentives)
CREATE TABLE IF NOT EXISTS public.incentives (
  id SERIAL PRIMARY KEY,
  unit_cs_number TEXT NOT NULL REFERENCES public.units(cs_number) ON DELETE CASCADE,
  sales_consultant TEXT NOT NULL,
  agent_pin TEXT DEFAULT '1234',
  invoice_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
  dr_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
  htb_leads_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Requirements Pending',
  incentive_amount DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 13. PEOPLE TABLE (Reference Directory Only - Sales Agents, GSM, & Accounting Staff)
CREATE TABLE IF NOT EXISTS public.people (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Sales',
  department_start_date TEXT,
  contact_number TEXT,
  email TEXT,
  active_status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 14. MASTER LISTS TABLE (Editable System Dropdowns Dictionary)
CREATE TABLE IF NOT EXISTS public.master_lists (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  option_value TEXT NOT NULL,
  active_status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 15. COMMISSION RECORDS TABLE (Solo Commission Vault)
CREATE TABLE IF NOT EXISTS public.commission_records (
  id SERIAL PRIMARY KEY,
  project_reference TEXT NOT NULL,
  expected_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  received_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  received_date TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 16. FILES TABLE (Production File Library & Storage References)
CREATE TABLE IF NOT EXISTS public.files (
  id SERIAL PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  project_reference TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 17. ACTIVITY LOGS TABLE (Audit Logs & Operation History)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id SERIAL PRIMARY KEY,
  actor TEXT NOT NULL DEFAULT 'Ara Mae Marcillo',
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- SECTION B: RHPS OS — ROBERT'S PIANO & SERVICES (9 TABLES)
-- =============================================================================

-- 18. RHPS CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.rhps_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  complete_address TEXT NOT NULL,
  customer_type TEXT NOT NULL DEFAULT 'New',
  city_area TEXT,
  landmark TEXT,
  email TEXT,
  facebook_name TEXT,
  alternate_contact TEXT,
  notes TEXT,
  client_status TEXT DEFAULT 'Ready for Assessment',
  product_service TEXT DEFAULT 'Piano Tuning & Service',
  priority TEXT DEFAULT 'Normal',
  source TEXT DEFAULT 'Facebook Direct',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 19. RHPS CUSTOMER PIANOS TABLE
CREATE TABLE IF NOT EXISTS public.rhps_customer_pianos (
  id TEXT PRIMARY KEY,
  linked_customer_id TEXT NOT NULL REFERENCES public.rhps_customers(id) ON DELETE CASCADE,
  piano_type TEXT NOT NULL DEFAULT 'Upright',
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  current_location TEXT NOT NULL,
  piano_status TEXT NOT NULL DEFAULT 'Owned by Customer',
  color TEXT,
  size TEXT,
  last_tuning_date TEXT,
  last_service_date TEXT,
  condition_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 20. RHPS LEADS TABLE
CREATE TABLE IF NOT EXISTS public.rhps_leads (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'Facebook',
  customer_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  location_city TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'Tuning',
  piano_type TEXT NOT NULL,
  main_concern TEXT NOT NULL,
  preferred_schedule TEXT,
  status TEXT NOT NULL DEFAULT 'New Lead',
  next_action TEXT NOT NULL,
  assigned_owner TEXT NOT NULL DEFAULT 'Robert Herrero',
  record_mode TEXT NOT NULL DEFAULT 'ACTUAL',
  budget_range TEXT,
  notes TEXT,
  follow_up_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 21. RHPS ESTIMATES TABLE
CREATE TABLE IF NOT EXISTS public.rhps_estimates (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES public.rhps_leads(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  service_location TEXT NOT NULL,
  piano_brand_type_model_serial TEXT NOT NULL,
  main_concern TEXT NOT NULL,
  recommended_scope TEXT NOT NULL,
  estimated_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  estimate_basis TEXT NOT NULL DEFAULT 'Remote',
  validity_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  prepared_by TEXT NOT NULL DEFAULT 'Robert Herrero',
  record_mode TEXT NOT NULL DEFAULT 'ACTUAL',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 22. RHPS QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.rhps_quotations (
  id TEXT PRIMARY KEY,
  estimate_id TEXT NOT NULL REFERENCES public.rhps_estimates(id) ON DELETE CASCADE,
  revision_no TEXT NOT NULL DEFAULT '01',
  customer_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  service_location TEXT NOT NULL,
  piano_brand_type_model_serial TEXT NOT NULL,
  proposed_scope TEXT NOT NULL,
  approved_quoted_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  deposit_required DOUBLE PRECISION NOT NULL DEFAULT 0,
  balance_terms TEXT NOT NULL,
  validity_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  prepared_by TEXT NOT NULL DEFAULT 'Robert Herrero',
  record_mode TEXT NOT NULL DEFAULT 'ACTUAL',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 23. RHPS CUSTOMER CASES TABLE
CREATE TABLE IF NOT EXISTS public.rhps_customer_cases (
  id TEXT PRIMARY KEY,
  linked_customer_id TEXT NOT NULL REFERENCES public.rhps_customers(id) ON DELETE CASCADE,
  linked_quotation_no TEXT NOT NULL,
  approved_scope_of_work TEXT NOT NULL,
  approved_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open',
  customer_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  record_mode TEXT NOT NULL DEFAULT 'ACTUAL',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 24. RHPS JOB CARDS TABLE
CREATE TABLE IF NOT EXISTS public.rhps_job_cards (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES public.rhps_customer_cases(id) ON DELETE CASCADE,
  assigned_technician TEXT NOT NULL DEFAULT 'Robert Herrero',
  work_status TEXT NOT NULL DEFAULT 'Pending',
  service_checklist_json JSONB,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 25. RHPS BILLING RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.rhps_billing_records (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES public.rhps_customer_cases(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  deposit_paid DOUBLE PRECISION NOT NULL DEFAULT 0,
  balance_due DOUBLE PRECISION NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  receipt_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 26. RHPS MASTER LISTS TABLE
CREATE TABLE IF NOT EXISTS public.rhps_master_lists (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  option_value TEXT NOT NULL,
  active_status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- ADDING FOREIGN KEY CONSTRAINTS TO EXISTING TABLES IF ALREADY CREATED
-- =============================================================================
DO $$
BEGIN
  -- 1. units -> clients
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_units_clients') THEN
    ALTER TABLE public.units ADD CONSTRAINT fk_units_clients FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;

  -- 2. allocations -> units & clients
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_allocations_units') THEN
    ALTER TABLE public.allocations ADD CONSTRAINT fk_allocations_units FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_allocations_clients') THEN
    ALTER TABLE public.allocations ADD CONSTRAINT fk_allocations_clients FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;

  -- 3. documents -> units & clients
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_documents_units') THEN
    ALTER TABLE public.documents ADD CONSTRAINT fk_documents_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_documents_clients') THEN
    ALTER TABLE public.documents ADD CONSTRAINT fk_documents_clients FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;

  -- 4. followups -> units
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_followups_units') THEN
    ALTER TABLE public.followups ADD CONSTRAINT fk_followups_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE SET NULL;
  END IF;

  -- 5. pdi_checks -> units
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_pdi_checks_units') THEN
    ALTER TABLE public.pdi_checks ADD CONSTRAINT fk_pdi_checks_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE CASCADE;
  END IF;

  -- 6. releases -> units
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_releases_units') THEN
    ALTER TABLE public.releases ADD CONSTRAINT fk_releases_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE CASCADE;
  END IF;

  -- 7. expenses -> units
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_expenses_units') THEN
    ALTER TABLE public.expenses ADD CONSTRAINT fk_expenses_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE SET NULL;
  END IF;

  -- 8. collections -> units
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_collections_units') THEN
    ALTER TABLE public.collections ADD CONSTRAINT fk_collections_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE SET NULL;
  END IF;

  -- 9. insurance_records -> units
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_insurance_records_units') THEN
    ALTER TABLE public.insurance_records ADD CONSTRAINT fk_insurance_records_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE CASCADE;
  END IF;

  -- 10. incentives -> units
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_incentives_units') THEN
    ALTER TABLE public.incentives ADD CONSTRAINT fk_incentives_units FOREIGN KEY (unit_cs_number) REFERENCES public.units(cs_number) ON DELETE CASCADE;
  END IF;

  -- 11. rhps_customer_pianos -> rhps_customers
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_rhps_pianos_customers') THEN
    ALTER TABLE public.rhps_customer_pianos ADD CONSTRAINT fk_rhps_pianos_customers FOREIGN KEY (linked_customer_id) REFERENCES public.rhps_customers(id) ON DELETE CASCADE;
  END IF;

  -- 12. rhps_estimates -> rhps_leads
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_rhps_estimates_leads') THEN
    ALTER TABLE public.rhps_estimates ADD CONSTRAINT fk_rhps_estimates_leads FOREIGN KEY (lead_id) REFERENCES public.rhps_leads(id) ON DELETE CASCADE;
  END IF;

  -- 13. rhps_quotations -> rhps_estimates
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_rhps_quotations_estimates') THEN
    ALTER TABLE public.rhps_quotations ADD CONSTRAINT fk_rhps_quotations_estimates FOREIGN KEY (estimate_id) REFERENCES public.rhps_estimates(id) ON DELETE CASCADE;
  END IF;

  -- 14. rhps_customer_cases -> rhps_customers
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_rhps_cases_customers') THEN
    ALTER TABLE public.rhps_customer_cases ADD CONSTRAINT fk_rhps_cases_customers FOREIGN KEY (linked_customer_id) REFERENCES public.rhps_customers(id) ON DELETE CASCADE;
  END IF;

  -- 15. rhps_job_cards -> rhps_customer_cases
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_rhps_jobcards_cases') THEN
    ALTER TABLE public.rhps_job_cards ADD CONSTRAINT fk_rhps_jobcards_cases FOREIGN KEY (case_id) REFERENCES public.rhps_customer_cases(id) ON DELETE CASCADE;
  END IF;

  -- 16. rhps_billing_records -> rhps_customer_cases
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_rhps_billing_cases') THEN
    ALTER TABLE public.rhps_billing_records ADD CONSTRAINT fk_rhps_billing_cases FOREIGN KEY (case_id) REFERENCES public.rhps_customer_cases(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;


-- =============================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_units_cs_number ON public.units(cs_number);
CREATE INDEX IF NOT EXISTS idx_documents_unit ON public.documents(unit_cs_number);
CREATE INDEX IF NOT EXISTS idx_followups_category ON public.followups(category);
CREATE INDEX IF NOT EXISTS idx_releases_unit ON public.releases(unit_cs_number);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON public.expenses(project_name);
CREATE INDEX IF NOT EXISTS idx_rhps_leads_status ON public.rhps_leads(status);
CREATE INDEX IF NOT EXISTS idx_rhps_cases_status ON public.rhps_customer_cases(status);

-- =============================================================================
-- PERMISSIONS & ROLES GRANT FOR SUPABASE
-- =============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role, postgres;

-- Enable Supabase Realtime Publication for ALL 26 SYSTEM TABLES (Safe Idempotent Check)
DO $$
DECLARE
  tbl TEXT;
  tables_list TEXT[] := ARRAY[
    'projects', 'units', 'clients', 'allocations', 'documents', 'followups',
    'pdi_checks', 'releases', 'expenses', 'collections', 'insurance_records',
    'incentives', 'people', 'master_lists', 'commission_records', 'files', 'activity_logs',
    'rhps_customers', 'rhps_customer_pianos', 'rhps_leads', 'rhps_estimates',
    'rhps_quotations', 'rhps_customer_cases', 'rhps_job_cards', 'rhps_billing_records', 'rhps_master_lists'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_list LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = tbl) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

