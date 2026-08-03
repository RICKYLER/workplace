import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const files = sqliteTable("files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  objectKey: text("object_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  projectReference: text("project_reference"),
  category: text("category").notNull().default("Other"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const commissionRecords = sqliteTable("commission_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectReference: text("project_reference").notNull(),
  expectedAmount: real("expected_amount").notNull().default(0),
  receivedAmount: real("received_amount").notNull().default(0),
  status: text("status").notNull().default("Pending"),
  receivedDate: text("received_date"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
