CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" text DEFAULT 'Ara Mae Marcillo' NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"sales_agent" text NOT NULL,
	"gsm_name" text DEFAULT 'Robespierre T. Agir' NOT NULL,
	"legal_docs_missing" boolean DEFAULT false NOT NULL,
	"missing_reason" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"account_type" text DEFAULT 'Government' NOT NULL,
	"contact_person" text NOT NULL,
	"contact_number" text NOT NULL,
	"philgeps_itb_no" text,
	"procurement_entity" text,
	"abc_amount" double precision,
	"unit_to_be_used" text,
	"remarks" text,
	"legal_checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_cs_number" text,
	"client_name" text NOT NULL,
	"bank_po_status" text DEFAULT 'For Submission' NOT NULL,
	"expected_amount" double precision DEFAULT 0 NOT NULL,
	"collected_amount" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"due_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_reference" text NOT NULL,
	"expected_amount" double precision DEFAULT 0 NOT NULL,
	"received_amount" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"received_date" text,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"doc_name" text NOT NULL,
	"doc_type" text NOT NULL,
	"unit_cs_number" text,
	"client_id" integer,
	"status" text DEFAULT 'Pending' NOT NULL,
	"file_url" text,
	"notarial_status" text DEFAULT 'Not Required',
	"transmittal_status" text DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_cs_number" text,
	"project_name" text NOT NULL,
	"requested_amount" double precision DEFAULT 0 NOT NULL,
	"approved_amount" double precision DEFAULT 0 NOT NULL,
	"released_amount" double precision DEFAULT 0 NOT NULL,
	"liquidated_amount" double precision DEFAULT 0 NOT NULL,
	"unliquidated_balance" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'Requested' NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"object_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"project_reference" text,
	"category" text DEFAULT 'Other' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "files_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
CREATE TABLE "followups" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"unit_cs_number" text,
	"client_name" text NOT NULL,
	"requirement" text NOT NULL,
	"action_needed" text NOT NULL,
	"due_date" text NOT NULL,
	"contact_person" text,
	"contact_number" text,
	"remarks" text,
	"status" text DEFAULT 'Open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incentives" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_cs_number" text NOT NULL,
	"sales_consultant" text NOT NULL,
	"agent_pin" text DEFAULT '1234',
	"invoice_uploaded" boolean DEFAULT false NOT NULL,
	"dr_uploaded" boolean DEFAULT false NOT NULL,
	"htb_leads_uploaded" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'Requirements Pending' NOT NULL,
	"incentive_amount" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_cs_number" text NOT NULL,
	"insurance_company" text NOT NULL,
	"policy_number" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"expiry_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"option_value" text NOT NULL,
	"active_status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdi_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_cs_number" text NOT NULL,
	"status" text DEFAULT 'Not Started' NOT NULL,
	"findings" text,
	"remarks" text,
	"waived_reason" text,
	"scheduled_date" text,
	"completed_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"role" text NOT NULL,
	"department" text DEFAULT 'Sales' NOT NULL,
	"department_start_date" text,
	"contact_number" text,
	"email" text,
	"active_status" text DEFAULT 'Active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"client" text NOT NULL,
	"model" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"agent" text NOT NULL,
	"manager" text DEFAULT 'Robespierre T. Agir' NOT NULL,
	"stage" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"priority" text DEFAULT 'Normal' NOT NULL,
	"target_delivery" text,
	"next_action" text DEFAULT '' NOT NULL,
	"progress" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "releases" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_cs_number" text NOT NULL,
	"client_name" text NOT NULL,
	"sales_agent" text NOT NULL,
	"gate_pass_status" text DEFAULT 'Missing' NOT NULL,
	"is_ready" boolean DEFAULT false NOT NULL,
	"released_with_pending" boolean DEFAULT false NOT NULL,
	"pending_reason" text,
	"release_status" text DEFAULT 'Pending' NOT NULL,
	"actual_release_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"cs_number" text NOT NULL,
	"vin_number" text,
	"engine_number" text,
	"model_description" text NOT NULL,
	"color" text DEFAULT 'White' NOT NULL,
	"location" text DEFAULT 'Davao Yard' NOT NULL,
	"status" text DEFAULT 'Available' NOT NULL,
	"client_id" integer,
	"sales_consultant" text,
	"date_assigned" text,
	"date_released" text,
	"dealers_price" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "units_cs_number_unique" UNIQUE("cs_number")
);
