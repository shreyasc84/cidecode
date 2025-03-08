import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertEvidenceSchema, UserRole } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check if user is admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  app.post("/api/evidence", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      console.log("Validating evidence data:", req.body);
      const evidence = insertEvidenceSchema.parse({
        ...req.body,
        submittedBy: req.user.address
      });

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
      res.status(500).json({ message: "Error creating evidence" });
    }
  });

  app.get("/api/evidence", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const evidence = await storage.getEvidence(req.user);
    res.json(evidence);
  });

  // Admin-only routes for managing evidence
  app.patch("/api/evidence/:id", isAdmin, async (req, res) => {
    try {
      const evidence = await storage.updateEvidence(
        parseInt(req.params.id),
        req.body
      );
      res.json(evidence);
    } catch (error) {
      res.status(400).json({ message: "Error updating evidence" });
    }
  });

  app.delete("/api/evidence/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteEvidence(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ message: "Error deleting evidence" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}