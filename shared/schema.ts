import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  badgeNumber: text("badge_number").notNull(),
});

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  caseId: text("case_id").notNull(),
  submittedBy: text("submitted_by").notNull(),
  fileHash: text("file_hash").notNull(),
  ipfsHash: text("ipfs_hash").notNull(),
  metadata: jsonb("metadata").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  transactionHash: text("transaction_hash"),
});

export const insertUserSchema = createInsertSchema(users);

// Custom evidence schema with proper validation
export const insertEvidenceSchema = createInsertSchema(evidence).extend({
  metadata: z.object({
    description: z.string().min(10, "Description must be at least 10 characters"),
    fileName: z.string().min(1, "File name is required"),
    fileSize: z.number().min(1, "File size must be greater than 0"),
    fileType: z.string().min(1, "File type is required"),
    timestamp: z.string().datetime(),
  }),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export type User = typeof users.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

export const UserRole = {
  ADMIN: "admin",
  CBI: "cbi",
  OFFICER: "officer",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const EvidenceStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type EvidenceStatus = typeof EvidenceStatus[keyof typeof EvidenceStatus];