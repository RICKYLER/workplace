CREATE TABLE `commission_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_reference` text NOT NULL,
	`expected_amount` real DEFAULT 0 NOT NULL,
	`received_amount` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`received_date` text,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`project_reference` text,
	`category` text DEFAULT 'Other' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_object_key_unique` ON `files` (`object_key`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`client` text NOT NULL,
	`model` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`agent` text NOT NULL,
	`manager` text DEFAULT 'Robespierre T. Agir' NOT NULL,
	`stage` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`priority` text DEFAULT 'Normal' NOT NULL,
	`target_delivery` text,
	`next_action` text DEFAULT '' NOT NULL,
	`progress` integer DEFAULT 10 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
