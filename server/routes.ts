import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireRole } from "./auth";
import { insertEvidenceSchema, UserRole } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Evidence submission - only ADMIN and OFFICER roles
  app.post("/api/evidence", requireRole([UserRole.ADMIN, UserRole.OFFICER]), async (req, res) => {
    try {
      console.log("Validating evidence data:", req.body);
      const evidence = insertEvidenceSchema.parse(req.body);

      // Ensure the submitter matches the authenticated user
      if (evidence.submittedBy !== req.user!.address) {
        return res.status(403).json({ 
          message: "Evidence submitter must match authenticated user" 
        });
      }

      const result = await storage.createEvidence(evidence);
      console.log("Evidence created successfully:", result);
      res.json(result);
    } catch (error) {
      console.error("Evidence validation error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid evidence data", 
          errors: error.errors 
        });
      }
      res.status(400).json({ message: "Invalid evidence data" });
    }
  });

  // Evidence retrieval - all roles have access, but data is filtered based on role
  app.get("/api/evidence", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const evidence = await storage.getEvidence(req.user);
    res.json(evidence);
  });

  // Evidence assignment - only ADMIN role
  app.post("/api/evidence/:id/assign", requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      const evidence = await storage.assignEvidence(parseInt(id), assignedTo);
      res.json(evidence);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Analysis - ADMIN and OFFICER roles
  app.get("/api/evidence/:id/analysis", requireRole([UserRole.ADMIN, UserRole.OFFICER]), async (req, res) => {
    try {
      const { id } = req.params;
      const evidence = await storage.getEvidenceWithAIAnalysis(parseInt(id));
      res.json(evidence);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Evidence update - only ADMIN role
  app.patch("/api/evidence/:id", requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const evidence = await storage.updateEvidence(parseInt(id), updates);
      res.json(evidence);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}