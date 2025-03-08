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

// Predefined admin addresses for demo
const ADMIN_ADDRESSES = [
  "0x1234567890123456789012345678901234567890",
  // Add more admin addresses as needed
].map(addr => addr.toLowerCase());

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
    const { address, provider } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address required" });
    }

    // Only admins can use WalletConnect
    if (provider === "walletconnect" && !ADMIN_ADDRESSES.includes(address.toLowerCase())) {
      return res.status(403).json({ message: "Only admins can use WalletConnect" });
    }

    let user = await storage.getUser(address);

    if (!user) {
      // Determine role based on address
      const role = ADMIN_ADDRESSES.includes(address.toLowerCase()) 
        ? UserRole.ADMIN 
        : UserRole.OFFICER;

      // Create new user with determined role
      user = await storage.createUser({
        address,
        role,
        name: role === UserRole.ADMIN ? "Admin " : "Officer " + address.slice(0, 6),
        department: role === UserRole.ADMIN ? "Central Bureau" : "Police Department",
        badgeNumber: (role === UserRole.ADMIN ? "CBI" : "PD") + Math.floor(Math.random() * 10000),
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