import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  badgeNumber: text("badge_number"),
  email: text("email"),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  isRegistered: boolean("is_registered").default(false),
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
  aiAnalysis: jsonb("ai_analysis"),
  assignedTo: text("assigned_to"),
  priority: text("priority").default("medium"),
  tags: text("tags").array(),
  reviewedBy: text("reviewed_by"),
  reviewDate: timestamp("review_date"),
});

// Metadata schema for evidence
const evidenceMetadataSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size must be greater than 0"),
  fileType: z.string().min(1, "File type is required"),
  timestamp: z.string(),
  location: z.string().optional(),
  deviceInfo: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// AI analysis schema
const aiAnalysisSchema = z.object({
  summary: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  keywords: z.array(z.string()),
  recommendations: z.array(z.string()),
  relatedCases: z.array(z.string()).optional(),
  confidenceScore: z.number().min(0).max(1),
});

// Evidence insert schema with proper validation
export const insertEvidenceSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  submittedBy: z.string().min(1, "Submitter address is required"),
  fileHash: z.string().min(1, "File hash is required"),
  ipfsHash: z.string().min(1, "IPFS hash is required"),
  metadata: evidenceMetadataSchema,
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  transactionHash: z.string().nullable(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string()).optional(),
});

export type User = typeof users.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

export const UserRole = {
  ADMIN: "admin",
  OFFICER: "officer",
  PUBLIC: "public",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const EvidenceStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type EvidenceStatus = typeof EvidenceStatus[keyof typeof EvidenceStatus];

export const insertUserSchema = createInsertSchema(users).extend({
  role: z.enum([UserRole.ADMIN, UserRole.OFFICER, UserRole.PUBLIC]),
  email: z.string().email().optional(),
});