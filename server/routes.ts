import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertEvidenceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/evidence", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const evidence = insertEvidenceSchema.parse(req.body);
      const result = await storage.createEvidence({
        ...evidence,
        submittedBy: req.user.address,
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid evidence data" });
    }
  });

  app.get("/api/evidence", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const evidence = await storage.getEvidence(req.user);
    res.json(evidence);
  });

  const httpServer = createServer(app);
  return httpServer;
}
