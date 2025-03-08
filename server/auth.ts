import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { UserRole } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      address: string;
      role: string;
      name: string;
      department: string;
      badgeNumber: string;
    }
  }
}

export function setupAuth(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev_secret",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
    })
  );

  app.post("/api/auth/connect", async (req, res) => {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: "Address required" });
    }

    let user = await storage.getUser(address);
    
    if (!user) {
      // For demo purposes, auto-create user with officer role
      user = await storage.createUser({
        address,
        role: UserRole.OFFICER,
        name: "Officer " + address.slice(0, 6),
        department: "Police Department",
        badgeNumber: "PD" + Math.floor(Math.random() * 10000),
      });
    }

    req.session.user = user;
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.session.user);
  });

  app.use((req, _res, next) => {
    req.user = req.session.user;
    next();
  });
}
